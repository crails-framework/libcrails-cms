#include "../../models/layout.hpp"
#include <sstream>
#include <crails/datatree.hpp>

using namespace std;

namespace Crails::Cms
{
  string render_css_variables(const LayoutVariables& variables, Data values)
  {
    stringstream stream;

    stream << "<style id=\"layout-variables\">"
              ":root {";
    for (const auto& variable : variables)
    {
      if (variable.type == "color")
      {
        string value = values[string(variable.name)]
          .defaults_to<string>(string(variable.default_value));
        stream << "--" << variable.name << ": " << value << ";";
      }
    }
    stream << "</style>";
    return stream.str();
  }
}
