#include "menu.hpp"
#include <iostream>

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

std::string Crails::Cms::Menu::get_data_as_json() const
{
  std::stringstream output;
  bool first = true;

  output << '[';
  data.as_data().each([&](Data data) -> bool
  {
    if (!first)
      output << ',';
    output << data.to_json();
    first = false;
    return true;
  });
  output << ']';
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
