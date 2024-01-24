#pragma once
#include <crails/odb/controller.hpp>
#include "../local_route.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class ResourceController : public Crails::Odb::Controller<SUPER>
  {
  protected:
    typedef Crails::Odb::Controller<SUPER> Super;
    typedef typename TRAITS::Model Model;
  public:
    ResourceController(Crails::Context& context) : Super(context)
    {
    }

    void show()
    {
      using namespace std;
      shared_ptr<Model> model;
      auto query = odb::query<Model>::slug == Super::params["slug"].template as<string>();

      Super::database.find_one(model, query);
      if (model)
        render_model(*model);
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
        Super::redirect_to(Crails::HttpStatus::permanent_redirect,  LocalRoute(Super::vars).make(model->get_slug()));
      else
        not_found();
    }

    virtual void render_model(const Model& model) = 0;

    virtual void not_found()
    {
      Super::respond_with(Crails::HttpStatus::not_found);
    }
    
    virtual bool must_protect_from_forgery() const override
    {
      if (Super::get_action_name() == "preview")
        return false;
      return Super::must_protect_from_forgery();
    }

    void preview()
    {
      Model model;
      auto settings = Super::find_settings();

      model.edit(Super::params[Model::scope]);
      Super::prepare_open_graph(model);
      Super::vars["preview"] = true;
      render_model(model);
    }
  };  
}
