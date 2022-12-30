#pragma once
#include "resource.hpp"
#include "../../models/user.hpp"
#include <crails/odb/any.hpp>

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminUserController : public AdminResourceController<TRAITS, Crails::Cms::User, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::User, SUPER> Super;
    typedef typename TRAITS::Model Model;
    typedef typename TRAITS::UserGroupModel Group;

    std::string get_view_scope() const override { return "users"; }
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
      require_groups();
      Super::vars["page_title"] = model.get_email();
      Super::vars["group_options"] = &groups;
      Super::render_editor(model);
    }

    void require_groups()
    {
      if (!groups_fetched)
      {
        odb::result<Group> models;

        Super::database.find(models);
        for (const auto& group : models)
          groups.emplace(group.get_id(), group.get_name());
        groups_fetched = true;
      }
    }

    virtual bool edit_resource(Model& model, Data data)
    {
      if (Super::edit_resource(model, data))
      {
        if (data["groups"].exists())
          update_groups(model, data["groups"].to_vector<Crails::Odb::id_type>());
        return true;
      }
      return false;
    }

    void update_groups(Model& model, const std::vector<Crails::Odb::id_type>& group_ids)
    {
      odb::result<Group> groups;
      odb::query<Group> query =
        odb::query<Group>::id + "=" + Crails::Odb::any(group_ids);

      Super::database.find(groups, query);
      model.get_permissions().set_groups(groups);
    }

    bool groups_fetched = false;
    std::map<Crails::Odb::id_type, std::string> groups;
  };
}

