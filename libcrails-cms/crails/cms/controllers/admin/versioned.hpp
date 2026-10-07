#pragma once
#include "resource.hpp"
#include "../../models/versioning.hpp"
#include "../../models/settings.hpp"
#include "../../views/version_picker.hpp"

namespace Crails::Cms
{
  /*
   * Adds version management to an AdminResourceController.
   *
   * Requirements:
   *  - TRAITS::Model derives from Editable and Versionable
   *  - TRAITS::VersionModel is the concrete Version class of that model
   *
   * Behavior:
   *  - GET  <resource>/:id?version=N  renders the editor with version N loaded in
   *    memory. Nothing is written.
   *  - PUT  <resource>/:id            the editor posts the version it was loaded from
   *    in the `version` parameter. If the submitted content differs from that
   *    version, a new version is recorded and becomes the current one. If it is
   *    identical, the selected version simply becomes the current one.
   *  - The model's own columns always hold the current version, so the public side
   *    needs no change.
   *  - DELETE <resource>/:id/versions/:version removes a version (never the current one).
   *  - After each save, the oldest versions are pruned so that at most
   *    Settings::max_versions remain, not counting the current one.
   */
  template<typename TRAITS, typename BASE_MODEL, typename SUPER>
  class AdminVersionedResourceController : public AdminResourceController<TRAITS, BASE_MODEL, SUPER>
  {
    typedef AdminResourceController<TRAITS, BASE_MODEL, SUPER> Super;
    typedef typename TRAITS::Model        Model;
    typedef typename TRAITS::VersionModel VersionModel;
    typedef Versioning<Model, VersionModel> Versions;
  public:
    AdminVersionedResourceController(Crails::Context& context) : Super(context)
    {
    }

    virtual bool must_protect_from_forgery() const override
    {
      return Super::must_protect_from_forgery() && Super::get_action_name() != "destroy_version";
    }

    void show()
    {
      std::shared_ptr<Model> model = Super::require_resource();

      if (model)
      {
        unsigned int requested = requested_version();

        if (requested != 0)
        {
          Versions versions(Super::database);
          std::shared_ptr<VersionModel> version = versions.find(*model, requested);

          if (!version)
          {
            Super::respond_with(Crails::HttpStatus::not_found);
            return ;
          }
          versions.apply(*model, *version);
        }
        render_editor(*model);
      }
    }

    void destroy_version()
    {
      std::shared_ptr<Model> model = Super::require_resource();

      if (model)
      {
        Versions versions(Super::database);
        unsigned int number = requested_version();
        std::string url = Super::get_url_for(*model);

        if (number == 0 || number == model->get_current_version())
          Super::flash["warning"] = i18n::t("admin.versions.cannot-remove-live");
        else if (versions.destroy(*model, number))
          Super::flash["info"] = i18n::t("admin.versions.removed");
        else
        {
          Super::respond_with(Crails::HttpStatus::not_found);
          return ;
        }
        Super::redirect_to(url);
      }
    }

  protected:
    // Versions kept per resource, not counting the live one. 0 means unlimited.
    virtual unsigned int get_max_versions()
    {
      auto settings = Super::settings ? Super::settings : Super::find_settings();

      return settings ? settings->get_max_versions() : Settings::default_max_versions;
    }

    void render_editor(Model& model) override
    {
      Versions versions(Super::database);
      VersionPickerData picker;

      picker.versions = versions.list(model);
      picker.current  = model.get_current_version();
      picker.selected = selected_version_for_display(model, picker.versions);
      if (model.is_persistent())
        picker.route = Super::get_route().make(model.get_id(), "versions");
      Super::vars["version_picker"] = const_cast<const VersionPickerData*>(&picker);
      Super::render_editor(model); // renders synchronously, `picker` outlives the rendering
      Super::vars.erase("version_picker");
    }

    void prepare_resource_update(Model& model) override
    {
      Versions versions(Super::database);
      std::shared_ptr<VersionModel> selected = versions.find(model, requested_version());

      pending_versions.clear();
      baseline_version = 0;
      if (!model.has_versions())
      {
        // First edit of an object that predates versioning: keep its original content as a version
        baseline_version = record_version(versions, model)->get_number();
      }
      else if (selected)
      {
        versions.apply(model, *selected);
        baseline_version = selected->get_number();
      }
      else
        baseline_version = model.get_current_version();
      baseline = versions.snapshot(model).to_json();
    }

    void before_save_resource(Model& model) override
    {
      Versions versions(Super::database);

      if (baseline_version != 0 && versions.snapshot(model).to_json() == baseline)
        model.set_current_version(baseline_version); // nothing was edited: only the live version changes
      else
        record_version(versions, model);
    }

    void after_save_resource(Model& model) override
    {
      Versions versions(Super::database);

      for (auto& version : pending_versions)
        versions.commit(model, *version);
      pending_versions.clear();
      versions.prune(model, get_max_versions());
    }

    void before_destroy_resource(Model& model) override
    {
      Versions versions(Super::database);

      versions.destroy_all(model);
    }

    unsigned int requested_version() const
    {
      return Super::params["version"].template defaults_to<unsigned int>(0);
    }

  private:
    VersionModel* record_version(Versions& versions, Model& model)
    {
      auto user = Super::user_session.const_get_current_user();
      const User* author = user ? &*user : nullptr;

      pending_versions.push_back(versions.prepare(model, author));
      return pending_versions.back().get();
    }

    unsigned int selected_version_for_display(const Model& model, const VersionSummaries& list) const
    {
      unsigned int requested = requested_version();

      for (const VersionSummary& summary : list)
      {
        if (summary.number == requested)
          return requested;
      }
      return model.get_current_version();
    }

    std::vector<std::unique_ptr<VersionModel>> pending_versions;
    unsigned int baseline_version = 0;
    std::string  baseline;
  };
}
