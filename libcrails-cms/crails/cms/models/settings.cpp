#include "settings.hpp"
#include "../views/layout.hpp"
#include "../plugins.hpp"
#include "../plugin.hpp"
#include <crails/utils/split.hpp>

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
  if (params["plugins"].exists())
    update_plugins(params["plugins"].to_vector<std::string>());
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

std::vector<std::string> Crails::Cms::Settings::get_plugins() const
{
  return Crails::split<std::string, std::vector<std::string>>(plugins, ';');
}

void Crails::Cms::Settings::set_plugins(const std::vector<std::string>& value)
{
  plugins = std::string();
  for (const std::string& plugin : value)
  {
    if (plugins.length() > 0)
      plugins += ';';
    plugins += plugin;
  }
}

void Crails::Cms::Settings::update_plugins(const std::vector<std::string>& new_plugin_names)
{
  auto current_plugin_names = get_plugins();
  const auto* plugins = Crails::Cms::Plugins::singleton::get();

  if (!plugins)
    return ;

  // Clear removed plugins
  for (const auto& name : current_plugin_names)
  {
    auto it = std::find(new_plugin_names.begin(), new_plugin_names.end(), name);
    if (it == new_plugin_names.end())
    {
      Plugin* plugin = plugins->get_plugin(name);

      if (plugin)
      {
        plugin->uninstall();
        plugins_updated = true;
      }
    }
  }

  // Install added plugins
  for (const auto& name : new_plugin_names)
  {
    auto it = std::find(current_plugin_names.begin(), current_plugin_names.end(), name);
    if (it == current_plugin_names.end())
    {
      Plugin* plugin = plugins->get_plugin(name);

      if (plugin)
      {
        plugin->install();
        plugins_updated = true;
      }
    }
  }

  // Update installed plugin array
  set_plugins(new_plugin_names);
}

bool Crails::Cms::Settings::should_reload_server() const
{
  return plugins_updated;
}
