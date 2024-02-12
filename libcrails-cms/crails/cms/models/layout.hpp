#pragma once
#include <vector>
#include <string_view>
#include <string>
#include <map>
#include <crails/datatree.hpp>

namespace Crails::Cms
{
  struct LayoutVariable
  {
    LayoutVariable(const std::string_view a, const std::string_view b, const std::string_view c = "") : name(a), type(b), default_value(c) {}
    LayoutVariable(const std::string_view a, const std::map<std::string, std::string>& b, std::string_view c) : name(a), type("select"), default_value(c), options(b) {}

    bool operator==(const std::string_view value) const { return name == value; }

    std::string_view name;
    std::string_view type;
    std::string_view default_value;
    std::map<std::string, std::string> options;
  };

  typedef std::vector<LayoutVariable> LayoutVariables;

  LayoutVariable find_layout_variable(const LayoutVariables&, const std::string_view variable_name);
  std::string get_layout_value(const LayoutVariables&, const Data values, const std::string_view variable_name);
}
