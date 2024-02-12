#include "layout.hpp"
#include <algorithm>

using namespace std;

namespace Crails::Cms
{
  LayoutVariable find_layout_variable(const LayoutVariables& variables, const string_view name)
  {
    auto it = find(variables.begin(), variables.end(), name);

    if (it == variables.end())
      return LayoutVariable("", "");
    return *it;
  }

  string get_layout_value(const LayoutVariables& variables, const Data values, const string_view name)
  {
    LayoutVariable variable = find_layout_variable(variables, name);

    return values[string(name.data(), name.length())]
      .defaults_to<string>(string(variable.default_value));
  }
}
