#pragma once
#include "resource.hpp"
#include "../../models/user.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminUserController : public AdminResourceController<TRAITS, Crails::Cms::User, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::User, SUPER> Super;
    typedef typename TRAITS::Model Model;

    std::string get_view_scope() const override { return "users"; }
    std::string get_url() const override { return "/admin/users"; }

  public:
    AdminUserController(Crails::Context& context) : Super(context)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.users");
      Super::vars["page_subtitle"] = i18n::t("admin.users-subtitle");
    }

    void new_()
    {
      Super::vars["page_subtitle"] = i18n::t("admin.new-user");
      Super::new_();
    }

    void destroy()
    {
      std::shared_ptr<Model> model = Super::require_resource();

      if (model)
      {
        auto current_user = Super::user_session.const_get_current_user();

        if (current_user->get_id() != model->get_id())
        {
          Super::database.destroy(*model);
          Super::flash["info"] = "User destroyed";
        }
        else
          Super::flash["error"] = "You are currently connected as the user you are trying to destroy";
        Super::redirect_to("/admin/users");
      }
    }

  protected:
    void render_editor(Model& model) override
    {
      Super::vars["page_title"] = model.get_email();
      Super::render_editor(model);
    }
  };
}

