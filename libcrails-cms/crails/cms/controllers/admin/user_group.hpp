#pragma once
#include "resource.hpp"
#include "../../models/user_group.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminUserGroupController : public AdminResourceController<TRAITS, Crails::Cms::UserGroup, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::UserGroup, SUPER> Super;

    std::string get_view_scope() const override { return "users/groups"; }
  public:
    AdminUserGroupController(Crails::Context& context) : Super(context)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.user-groups");
      Super::vars["page_subtitle"] = i18n::t("admin.user-groups-subtitle");
    }
  };
}
