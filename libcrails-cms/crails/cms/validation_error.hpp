#pragma once
#include <utility>
#include <string>
#include <string_view>
#include <functional>

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

  struct ValidationErrors : public std::vector<ValidationError>
  {
    ValidationErrors() {};
    ValidationErrors(const std::vector<ValidationError>& source) : std::vector<ValidationError>(source) {}
    bool is_empty() const;
    std::string to_html_list() const;
    std::string to_string(std::function<std::string (const std::string&)>) const;
    operator bool() const { return is_empty(); }
  };
}
