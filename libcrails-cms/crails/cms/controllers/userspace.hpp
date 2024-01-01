#pragma once
#include <crails/signin/auth_controller.hpp>
#include "../models/user.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class UserspaceController : public Crails::AuthController<typename TRAITS::UserModel, SUPER>
  {
    typedef Crails::AuthController<typename TRAITS::UserModel, SUPER> Super;
  protected:
    typedef TRAITS Traits;
  public:
    UserspaceController(Crails::Context& context) : Super(context)
    {
    }

    void initialize()
    {
      Super::initialize();
      if (require_logged_user() && get_current_user() == nullptr)
        on_user_not_logged();
    }

  protected:
    virtual bool require_logged_user() const
    {
      return true;
    }

    virtual void on_user_not_logged()
    {
      Super::respond_with(Crails::HttpStatus::unauthorized);
    }

    const Crails::Cms::User* get_current_user()
    {
      return Super::user_session.get_current_user().get();
    }

    virtual void redirect_to_userspace_home()
    {
      Super::redirect_to(TRAITS::root);
    }
  };
}
