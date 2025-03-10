#pragma once
#include "resource.hpp"
#include "../../models/page.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminPageController : public AdminResourceController<TRAITS, Crails::Cms::Page, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::Page, SUPER> Super;
    typedef typename TRAITS::Model Model;

    std::string get_view_scope() const override { return "pages"; }
  public:
    AdminPageController(Crails::Context& context) : Super(context)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.pages");
      Super::vars["page_subtitle"] = i18n::t("admin.pages-subtitle");
    }

    void new_()
    {
      Model model;

      if (Super::params["with_cms_layout"].exists())
        model.set_layout_name(Super::params["with_cms_layout"].template as<std::string>());
      else
        model.set_layout_name(default_layout_name());
      Super::vars["page_subtitle"] = i18n::t("admin.new-page");
      Super::render_editor(model);
    }

  protected:
    virtual odb::query<Model> make_index_query() const override
    {
      auto search = Super::params["search"].template defaults_to<std::string>("");

      if (search.length())
        return Super::make_index_query() && odb::query<Model>::title.like("%" + search + "%");
      return Super::make_index_query();
    }

    virtual bool edit_resource(typename TRAITS::Model& model, Data data) override
    {
      if (Super::edit_resource(model, data))
      {
        ValidationErrors validations(std::vector<ValidationError>{
          Super::validate_uniqueness(model, "slug", odb::query<Model>::slug == model.get_slug()),
          ValidationError("not-empty", "title", model.get_title().to_string().length() > 0)
        });

        if (validations)
          return true;
        else
          Super::received_flash["warning"] = validations.to_html_list();
      }
      return false;
    }

    void render_editor(typename TRAITS::Model& model) override
    {
      if (Super::params["with_cms_layout"].exists())
        model.set_layout_name(Super::params["with_cms_layout"].template as<std::string>());
      Super::vars["page_title"] = std::string(model.get_title());
      Super::vars["page_subtitle"] = i18n::t("admin.page-edition");
      Super::render_editor(model);
    }

    std::string default_layout_name() const
    {
      const Layouts* layouts = Crails::Cms::Layouts::singleton::get();
      const Layout* default_layout = layouts->default_layout_for_theme(Super::settings->get_theme());

      return default_layout ? default_layout->get_name() : std::string();
    }
  };
}
