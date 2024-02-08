#pragma once
#include <crails/signin/session_controller.hpp>
#include <crails/signin/password.hpp>
#include <crails/i18n.hpp>

namespace Crails::Cms
{
  template<typename USERSPACE_TRAITS, typename SUPER>
  class SessionController : public Crails::SessionController<typename USERSPACE_TRAITS::UserModel, SUPER>
  {
    typedef typename USERSPACE_TRAITS::UserModel UserModel;
    typedef Crails::SessionController<typename USERSPACE_TRAITS::UserModel, SUPER> Super;
  public:
    static constexpr const char* signin_path = USERSPACE_TRAITS::signin_path;

    SessionController(Crails::Context& context) : Super(context)
    {
      Super::vars["local_route"] = signin_path;
    }

    void new_()
    {
      Super::render("session/new");
    }

    void on_session_created() override
    {
      if (Super::params["redirect_to"].exists())
        Super::redirect_to(Super::params["redirect_to"].template as<std::string>());
      else
        Super::redirect_to("/");
    }

    void on_session_destroyed() override
    {
      Super::redirect_to("/");
    }

    void on_session_not_created() override
    {
      Super::flash["error"] = i18n::t("session.invalid-credentials");
      if (Super::params["redirect_to"].exists())
        Super::redirect_to(Super::params["redirect_to"].template as<std::string>());
      else
        new_();
    }

  private:
    std::shared_ptr<UserModel> find_user() override
    {
      std::shared_ptr<UserModel> user;
      Crails::Password password(Super::params["password"].template as<std::string>());

      Super::database.find_one(
        user,
        odb::query<UserModel>::email == Super::params["email"].template as<std::string>() &&
        odb::query<UserModel>::password == password.c_str()
      );
      return user;
    }
  };
}
