#include "settings.hpp"
#include "../views/layout.hpp"

const std::string Crails::Cms::Settings::scope = "setting";
const std::string Crails::Cms::Settings::plural_scope = "settings";
const std::string Crails::Cms::Settings::view = "";

void Crails::Cms::Settings::edit(Data params)
{
  if (params["title"].exists())
    set_title(params["title"]);
  if (params["homepage"].exists())
    set_homepage_id(params["homepage"]);
  if (params["public_url"].exists())
    set_public_url(params["public_url"]);
  if (params["favicon"].exists())
    set_favicon(params["favicon"]);
  if (params["theme"].exists())
    set_theme(params["theme"]);
  if (params["footer"].exists())
    set_footer(params["footer"]);
}

void Crails::Cms::Settings::merge_data(Data out) const
{
  out["title"] = this->title;
  out["homepage_id"] = this->homepage_id;
  out["public_url"] = this->public_url;
  out["favicon"] = this->favicon;
  out["theme"] = this->theme;
  out["footer"] = this->footer;
}

std::string Crails::Cms::Settings::to_json() const
{
  DataTree out;

  merge_data(out);
  return out.to_json();
}

const Crails::Cms::Layout& Crails::Cms::Settings::get_layout() const
{
  return Crails::Cms::Layout::get(theme);
}
