#include "validation_error.hpp"
#include <crails/i18n.hpp>

using namespace Crails::Cms;
using namespace std;

static const string i18n_key_base("admin.validations.");

string ValidationError::message(const string_view type, const string_view field_name)
{
  return i18n::t(i18n_key_base + type.data(), pair<string, string_view>{"field", field_name});
}
