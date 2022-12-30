#include "style.hpp"
#include <crails/html_template.hpp>

using namespace Crails;
using namespace std;

static string render_menu_list(const Cms::Style& style, Cms::ClassList classlist, Data data);

static string render_menu_item(const Cms::Style& style, Data item)
{
  Data children = item["children"];
  bool has_children = children.exists();
  auto classlist = has_children
    ? style.menu_item_with_children_classes()
    : style.menu_item_classes();

  return HtmlTemplate::tag("li", {{"class", classlist}}, [&]() -> string
  {
    stringstream li;
    
    li << HtmlTemplate::tag("a", {
      {"href", item["href"].as<string>()},
      {"class", style.menu_link_classes()},
      {"target", item["target"].as<string>()}
    }, [item]() -> string { return item["text"]; });
    if (has_children)
    {
      li << render_menu_list(
        style, style.menu_children_classes(), children
      );
    }
    return li.str();
  });
}

static string render_menu_list(const Cms::Style& style, Cms::ClassList classlist, Data data)
{
  auto yield = [&style, data]() -> string
  {
    stringstream html;

    data.each([&](Data item) -> bool
    {
      html << render_menu_item(style, item);
      return true;
    });
    return html.str();
  };

  return HtmlTemplate::tag("ul", {
    {"class", classlist},
  }, yield);
}

string Cms::Style::render_menu(const Menu& menu, Menu::Direction direction, const ClassList& classlist, const std::string& header) const
{
  auto yield = [this, &menu, &header]() -> string
  {
    return header
         + render_menu_list(*this, menu_classes(), menu.get_data());
  };

  return HtmlTemplate::tag("nav", {
    {"class", menu_wrapper_classes(direction) + classlist},
    {"data-name", menu.get_name()}
  }, yield);
}
