#pragma once
#include <crails/i18n.hpp>
#include "../admin.hpp"

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
      std::vector<std::shared_ptr<BASE_MODEL>> pages;
      odb::query<Model> query(make_index_query());

      Super::paginator.decorate_view(Super::vars, [this, query]()
      {
        return Super::database.template count<Model>(query);
      });
      Super::paginator.decorate_query(query);
      Super::database.template find<IndexModel>(models, query);
      for (IndexModel& model : models)
        pages.push_back(std::make_shared<Model>(model));
      Super::render("admin/" + get_view_scope() + "/index", {
        {"models", &pages}
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

      model.edit(Super::params[BASE_MODEL::scope]);
      Super::database.save(model);
      Super::flash["info"] = i18n::t("admin.flash.resource-created");
      Super::redirect_to(get_url_for(model));
    }

    void update()
    {
      std::shared_ptr<Model> model = require_resource();

      if (model)
      {
        model->edit(Super::params[BASE_MODEL::scope]);
        Super::database.save(*model);
        Super::flash["info"] = i18n::t("admin.flash.resource-updated");
        Super::redirect_to(get_url_for(*model));
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
    virtual odb::query<Model> make_index_query() const
    {
      return odb::query<Model>(true);
    }
    
    virtual void render_editor(Model& model)
    {
      Super::render("admin/" + get_view_scope() + "/show", {
        {"model", reinterpret_cast<const BASE_MODEL*>(&model)}
      });
    }

    virtual std::string get_view_scope() const = 0;
    virtual std::string get_url() const = 0;
    
    std::string get_url_for(const Model& model) const
    {
      std::string url = get_url();

      if (model.is_persistent())
        return url + '/' + std::to_string(model.get_id());
      return url;
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
  };
}
