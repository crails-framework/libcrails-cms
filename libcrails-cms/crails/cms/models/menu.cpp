#include "menu.hpp"
#include <crails/i18n.hpp>
#include <iostream>
#include <sstream>

using namespace Crails;
using namespace std;

const std::string Crails::Cms::Menu::scope = "menu";
const std::string Crails::Cms::Menu::plural_scope = "menus";
const std::string Crails::Cms::Menu::view = "";

void Crails::Cms::Menu::edit(Data params)
{
  std::cout << "EDITING MENU" << std::endl << params.to_json() << std::endl;

  if (params["name"].exists())
    set_name(params["name"]);
  if (params["data"].exists())
  {
    data.clear();
    data.from_json(params["data"].as<std::string>());
  }
}

static bool has_items(Data items)
{
  return items.exists() && items.count() > 0;
}

static string items_to_json(Data items)
{
  stringstream output;
  bool first = true;

  output << '[';
  if (items.exists())
  {
    items.each([&](Data item) -> bool
    {
      if (!first)
        output << ',';
      output << item.to_json();
      first = false;
      return true;
    });
  }
  output << ']';
  return output.str();
}

// The data is stored as {"en": [...items], "fr": [...items]}. Menus created before
// translations existed are a plain array of items: none of the locales is a key of it.
bool Crails::Cms::Menu::is_translated() const
{
  const auto& i18n_settings = i18n::Settings::singleton::require();
  Data root = data.as_data();

  for (const string& locale : i18n_settings.locales)
  {
    if (root[locale].exists())
      return true;
  }
  return false;
}

Data Crails::Cms::Menu::get_data() const
{
  return get_data(i18n::locale_name());
}

Data Crails::Cms::Menu::get_data(const string& locale) const
{
  Data root = data.as_data();

  if (is_translated())
  {
    const auto& i18n_settings = i18n::Settings::singleton::require();

    for (const string& candidate : vector<string>{locale, i18n_settings.default_locale})
    {
      if (has_items(root[candidate]))
        return root[candidate];
    }
    for (const string& candidate : i18n_settings.locales)
    {
      if (has_items(root[candidate]))
        return root[candidate];
    }
  }
  return root;
}

string Crails::Cms::Menu::get_data_as_json() const
{
  return items_to_json(get_data());
}

string Crails::Cms::Menu::get_translations_as_json() const
{
  const auto& i18n_settings = i18n::Settings::singleton::require();
  const bool translated = is_translated();
  Data root = data.as_data();
  // A menu predating translations is considered to be written in the default locale
  const string legacy_locale = i18n_settings.default_locale.length() || !i18n_settings.locales.size()
    ? i18n_settings.default_locale
    : i18n_settings.locales.front();
  stringstream output;
  bool first = true;

  output << '{';
  for (const string& locale : i18n_settings.locales)
  {
    string items = "[]";

    if (translated)
    {
      if (root[locale].exists())
        items = items_to_json(root[locale]);
    }
    else if (locale == legacy_locale)
      items = items_to_json(root);
    if (!first)
      output << ',';
    output << '"' << locale << "\":" << items;
    first = false;
  }
  output << '}';
  return output.str();
}

void Crails::Cms::Menu::merge_data(Data out) const
{
  out["name"] = this->name;
  out["data"].merge(data.as_data());
}

std::string Crails::Cms::Menu::to_json() const
{
  DataTree out;

  merge_data(out);
  return out.to_json();
}
