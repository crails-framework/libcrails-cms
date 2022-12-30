#include "menu.hpp"
#include "style.hpp"
#include <crails/utils/join.hpp>

using namespace Crails;
using namespace std;

namespace Crails::Cms
{
  bool is_active_menu_from_uri(Data params, const string& uri)
  {
    return params["uri"].as<string>().find(uri) != string::npos;
  }

  string menu_entry_classes(Data params, const string& uri, bool with_children)
  {
    const auto* style = Style::singleton::get();
    std::set<string> class_list;

    if (is_active_menu_from_uri(params, uri))
      class_list = style->menu_active_item_classes();
    else
      class_list = style->menu_item_classes();
    if (with_children)
    {
      auto with_children_classes = style->menu_item_with_children_classes();
      copy(
        with_children_classes.begin(), with_children_classes.end(),
        inserter(class_list, class_list.begin())
      );
    }
    return Crails::join(class_list.begin(), class_list.end(), ' ');
  }

  string RenderMenu::operator()(HtmlTemplate::Yieldable yield)
  {
    auto menu = MenuManager::singleton::require().find_menu(name);

    if (menu)
      return style->render_menu(*menu, direction, classes, yield());
    return string("<!-- menu " + name + " not found -->");
  }

  string RenderMenu::operator()(const char* yield)
  {
    return operator()([yield]() -> string { return yield ? string(yield) : string(); });
  }
}
