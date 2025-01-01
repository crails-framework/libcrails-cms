#include "validation_error.hpp"
#include <crails/i18n.hpp>
#include <algorithm>

using namespace Crails::Cms;
using namespace std;

static const string i18n_key_base("admin.validations.");

string ValidationError::message(const string_view type, const string_view field_name)
{
  string translated_field_name = i18n::t("form.label." + string(field_name));

  return i18n::t(i18n_key_base + type.data(), pair<string, string>{"field", translated_field_name});
}

bool ValidationErrors::is_empty() const
{
  return find(begin(), end(), false) == end();
}

string ValidationErrors::to_html_list() const
{
  return "<ul class=\"crailscms-validation-errors\">"
       + to_string([](const string& message) { return "<li>" + message + "</li>"; })
       + "</ul>";
}

string ValidationErrors::to_string(function<string (const string&)> formatter) const
{
  string result;

  for (auto it = begin() ; it != end () ; ++it)
  {
    if (!it->first)
      result += formatter(it->second);
  }
  return result;
}
