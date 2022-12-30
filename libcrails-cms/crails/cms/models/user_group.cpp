#include "user_group.hpp"
#include "permission_rule.hpp"
#include <algorithm>
#include <crails/odb/connection.hpp>

using namespace Crails::Cms;
using namespace std;

// UserGroup
const string UserGroup::scope = "group";
const string UserGroup::plural_scope = "groups";
const string UserGroup::view = "";

void UserGroup::edit(Data params)
{
  if (params["name"].exists())
    set_name(params["name"]);
}

void UserGroup::merge_data(Data out) const
{
  out["name"] = this->name;
}

string UserGroup::to_json() const
{
  DataTree out;

  merge_data(out);
  return out.to_json();
}

void UserGroup::before_save()
{
  if (!is_persistent())
    flag = find_available_flag();
}

void UserGroup::after_destroy()
{
  purge_flag();
}

void PermissionRule::purge_flag(unsigned long flag)
{
  read = read ^ flag;
  write = write ^ flag;
  destroy = destroy ^ flag;
}
