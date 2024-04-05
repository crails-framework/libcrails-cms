#pragma once
#include "../models/attachment.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AttachmentController : public Crails::Odb::Controller<SUPER>
  {
    typedef Crails::Odb::Controller<SUPER> Super;
    typedef typename TRAITS::Model Model;
  public:
    AttachmentController(Crails::Context& context) : Super(context)
    {
    }

    void initialize()
    {
      if (require_attachment())
        Super::initialize();
    }

    void show()
    {
      Super::redirect_to(model->as_attachment().get_url());
    }

    void thumbnail()
    {
      if (model->get_mimetype().find("image/") == 0)
        Super::redirect_to(model->get_miniature().get_url());
      else
        Super::respond_with(Crails::HttpStatus::not_found);
    }

  private:
    bool require_attachment()
    {
      auto criteria = odb::query<Model>::id == Super::params["id"].template as<Crails::Odb::id_type>();
      
      if (Super::database.template find_one(model, criteria))
        return true;
      else
        Super::respond_with(Crails::HttpStatus::not_found);
      return false;
    }

    std::shared_ptr<Model> model;
  };
}
