#pragma once
#include <crails/odb/controller.hpp>
#include "../views/layout.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class PageController : public Crails::Odb::Controller<SUPER>
  {
    typedef Crails::Odb::Controller<SUPER> Super;
    typedef typename TRAITS::Model Model;
  public:
    PageController(Crails::Context& context) : Super(context)
    {
    }

    void show()
    {
      using namespace std;
      shared_ptr<Model> model;
      auto query = odb::query<Model>::slug == Super::params["slug"].template as<string>();

      Super::database.find_one(model, query);
      if (model)
        render_page(*model);
      else
        not_found();
    }

    void by_id()
    {
      using namespace std;
      shared_ptr<Model> model;
      auto query = odb::query<Model>::id == Super::params["id"].template as<Crails::Odb::id_type>();

      Super::database.find_one(model, query);
      if (model)
        Super::redirect_to(Crails::HttpStatus::permanent_redirect, "/page/" + model->get_slug());
      else
        not_found();
    }

    virtual void render_page(const Model& model)
    {
      if (model.can_read(Super::get_current_user()))
      {
        Super::prepare_open_graph(model);
        Super::vars["layout"] = model.get_layout().get_layout_path();
        Super::vars["render_footer"] = !model.get_has_footer();
        Super::render("pages/show", {
          {"page", reinterpret_cast<const Crails::Cms::Page*>(&model)}
        });
      }
      else
        Super::respond_with(Crails::HttpStatus::forbidden);
    }

    virtual void not_found()
    {
      Super::respond_with(Crails::HttpStatus::not_found);
    }

    bool must_protect_from_forgery() const override
    {
      if (Super::get_action_name() == "preview")
        return false;
      return Super::must_protect_from_forgery();
    }

    void preview()
    {
      Model model;
      auto settings = Super::find_settings();

      model.edit(Super::params[Crails::Cms::Page::scope]);
      Super::prepare_open_graph(model);
      Super::vars["preview"] = true;
      render_page(model);
    }
  };
}
