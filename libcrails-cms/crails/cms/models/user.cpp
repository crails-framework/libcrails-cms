#include "user.hpp"
#include <crails/md5.hpp>
#include <crails/image.hpp>

using namespace Crails::Cms;

const std::string User::scope = "user";
const std::string User::plural_scope = "users";
const std::string User::view = "";

void User::after_destroy()
{
  if (attached_avatar.length())
  {
    Crails::BasicImage avatar(attached_avatar);
    avatar.cleanup_files();
  }
}

void User::edit(Data params)
{
  if (params["email"].exists())
    set_email(params["email"]);
  if (params["firstname"].exists())
    set_firstname(params["firstname"]);
  if (params["lastname"].exists())
    set_lastname(params["lastname"]);
  if (!params["password"].is_blank())
    set_password(params["password"]);
  if (params["role"].exists())
    set_role(static_cast<Crails::Cms::UserRole>(params["role"].as<int>()));
}

void User::merge_data(Data out) const
{
  out["email"] = this->email;
  out["firstname"] = this->firstname;
  out["lastname"] = this->lastname;
  out["avatar_url"] = get_avatar_url();
}

std::string User::to_json() const
{
  DataTree out;

  merge_data(out);
  return out.to_json();
}

std::string User::get_display_name() const
{
  if (firstname.length() + lastname.length())
    return firstname + ' ' + lastname;
  return email.substr(0, email.find_last_of('@'));
}

std::string User::get_avatar_url() const
{
  if (!attached_avatar.length())
    return "https://www.gravatar.com/avatar/" + Crails::md5(email) + "?f=y";
  return Crails::BasicImage(attached_avatar).get_url();
}
