#pragma once
#include <crails/odb/controller.hpp>
#include <crails/signin/auth_controller.hpp>
#include <crails/paginator.hpp>
#include "../models/user.hpp"

namespace Crails::Cms
{
  template<typename USER, typename SUPER>
  class AdminController : public Crails::AuthController<USER, SUPER>
  {
    typedef Crails::AuthController<USER, SUPER> Super;
  public:
    AdminController(Crails::Context& context) : Super(context), paginator(Super::params)
    {
      paginator.set_default_items_per_page(10);
    }

    void initialize()
    {
      Super::initialize();
      if (Super::user_session.get_current_user() != nullptr)
      {
        auto role = Super::user_session.get_current_user()->get_role();

        if (role != AdminRole && role != EditorRole)
          Super::redirect_to("/login");
      }
    }

    virtual void redirect_to_root()
    {
      Super::redirect_to("/admin/settings");
    }

    bool require_authentified_user() const override { return true; }

  protected:
    Crails::Paginator paginator;
  };
}
