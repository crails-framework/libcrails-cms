#pragma once
#include <crails/i18n.hpp>
#include "../admin.hpp"
#include "../../local_route.hpp"
#include "../../validation_error.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename BASE_MODEL, typename SUPER>
  class AdminResourceController : public AdminController<typename TRAITS::UserModel, SUPER>
  {
    typedef AdminController<typename TRAITS::UserModel, SUPER> Super;
    typedef typename TRAITS::Model      Model;
    typedef typename TRAITS::IndexModel IndexModel;
  public:
    AdminResourceController(Crails::Context& context) : Super(context)
    {
    }

    void index()
    {
      odb::result<IndexModel> models;
      std::vector<std::shared_ptr<BASE_MODEL>> list;
      odb::query<Model> query(make_index_query());

      Super::paginator.set_enabled(
        Super::params["no_pagination"].template defaults_to<std::string>("0") != "1"
      );
      if (Super::paginator.is_enabled())
      {
        Super::paginator.decorate_view(Super::vars, [this, query]()
        {
          return Super::database.template count<Model>(query);
        });
        Super::paginator.decorate_query(query);
      }
      else
        query = Model::default_order_by(query);
      Super::database.template find<IndexModel>(models, query);
      for (IndexModel& model : models)
        list.push_back(std::make_shared<Model>(model));
      Super::render("admin/" + get_view_scope() + "/index", {
        {"models", &list}
      });
    }

    void show()
    {
      std::shared_ptr<Model> model = require_resource();

      if (model)
        render_editor(*model);
    }

    void new_()
    {
      Model model;

      render_editor(model);
    }

    void create()
    {
      Model model;
      Data attributes = Super::params[BASE_MODEL::scope];

      if (initialize_resource(model, attributes) && edit_resource(model, attributes))
      {
        Super::database.save(model);
        Super::flash["info"] = i18n::t("admin.flash.resource-created");
        Super::redirect_to(get_url_for(model));
      }
      else
      {
        Super::received_flash["error"] = i18n::t("admin.flash.resource-not-created");
        render_editor(model);
      }
    }

    void update()
    {
      std::shared_ptr<Model> model = require_resource();

      if (model)
      {
        if (edit_resource(*model, Super::params[BASE_MODEL::scope]))
        {
          Super::database.save(*model);
          Super::flash["info"] = i18n::t("admin.flash.resource-updated");
          Super::redirect_to(get_url_for(*model));
        }
        else
        {
          Super::received_flash["error"] = i18n::t("admin.flash.resource-not-updated");
          render_editor(*model);
        }
      }
    }

    void destroy()
    {
      std::shared_ptr<Model> model = require_resource();

      if (model)
      {
        Super::database.destroy(*model);
        Super::flash["info"] = i18n::t("admin.flash.resource-removed");
        Super::redirect_to(get_url());
      }
    }

  protected:
    ValidationError validate_uniqueness(const Model& model, const std::string_view field_name, odb::query<Model> query)
    {
      std::shared_ptr<Model> result;

      Super::database.template find_one<Model>(result, query && odb::query<Model>::id != model.get_id());
      return ValidationError("uniqueness", field_name, result == nullptr);
    }

    virtual odb::query<Model> make_index_query() const
    {
      return odb::query<Model>(true);
    }
    
    virtual void render_editor(Model& model)
    {
      Super::vars["route"] = get_route();
      Super::render("admin/" + get_view_scope() + "/show", {
        {"model", reinterpret_cast<const BASE_MODEL*>(&model)}
      });
    }

    virtual std::string get_view_scope() const = 0;

    virtual LocalRoute get_route() const { return LocalRoute(Super::vars); }

    virtual std::string get_url() const { return get_route()(); }
    
    std::string get_url_for(const Model& model) const
    {
      LocalRoute route = get_route();

      if (model.is_persistent())
        return route.make(model.get_id());
      return route();
    }

    std::shared_ptr<Model> find_resource()
    {
      std::shared_ptr<Model> model;

      Super::database.template find_one(model, Super::params["id"].template as<Crails::Odb::id_type>());
      return model;
    }

    std::shared_ptr<Model> require_resource()
    {
      std::shared_ptr<Model> model = find_resource();

      if (!model)
        Super::respond_with(Crails::HttpStatus::not_found);
      return model;
    }

    virtual bool initialize_resource(Model& model, Data data)
    {
      return true;
    }

    virtual bool edit_resource(Model& model, Data data)
    {
      model.edit(data);
      return true;
    }
  };
}
