#include "admin.hpp"
#include "../views/style.hpp"

using namespace std;

namespace Crails::Cms
{
  string_view get_admin_template_path()
  {
    const auto& style = Style::singleton::require();
    return style.admin_layout();
  }
}
