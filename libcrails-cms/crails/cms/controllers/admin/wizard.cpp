#include "../../views/style.hpp"

using namespace std;

namespace Crails::Cms
{
  string_view get_wizard_template_path()
  {
    const auto& style = Style::singleton::require();
    return style.wizard_layout();
  }
}
