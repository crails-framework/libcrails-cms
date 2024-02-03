#pragma once
#include <string_view>
#include <string>
#include <map>

namespace Crails::Cms
{
  struct LayoutVariable
  {
    LayoutVariable(const std::string_view a, const std::string_view b, const std::string_view c = "") : name(a), type(b), default_value(c) {}
    LayoutVariable(const std::string_view a, const std::map<std::string, std::string>& b, std::string_view c) : name(a), type("select"), default_value(c), options(b) {}

    std::string_view name;
    std::string_view type;
    std::string_view default_value;
    std::map<std::string, std::string> options;
  };

  typedef std::vector<LayoutVariable> LayoutVariables;
}
