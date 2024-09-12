#pragma once
#include <utility>
#include <string>
#include <string_view>

namespace Crails::Cms
{
  struct ValidationError : public std::pair<bool, std::string>
  {
    static std::string message(const std::string_view type, const std::string_view field_name);
    ValidationError() : std::pair<bool, std::string>(false, std::string()) {}
    ValidationError(const std::string_view type, const std::string_view field_name, bool value)
      : std::pair<bool, std::string>(value, value ? std::string() : message(type, field_name))
    {}
    operator bool() const { return this->first; }
    operator std::string_view() const { return this->second.c_str(); }
    operator std::string() const { return this->second; }
  };
}
