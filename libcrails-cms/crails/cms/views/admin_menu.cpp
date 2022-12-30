#include "admin_menu.hpp"
#include "menu.hpp"
#include "style.hpp"
#include "../routes.hpp"
#include <sstream>
#include <crails/html_template.hpp>
#include <crails/i18n.hpp>

using namespace Crails::Cms;
using namespace std;

AdminMenu::AdminMenu()
{
}

void AdminMenu::add_default_entries(const string& scope)
{
  Routes& routes = Routes::singleton::require();

  add({
    {1, "settings", scope + "/settings"},
    {2, "pages",    scope + "/pages"},
    {5, "files",    scope + "/attachments"},
    {5, "menus",    scope + "/menus"},
    {10, "users",   scope + "/users"}
  });
}

void AdminMenu::add(const Entry& entry)
{
  for (auto it = entries.begin() ; it != entries.end() ; ++it)
  {
    if (it->priority >= entry.priority)
    {
      entries.insert(it, entry);
      return ;
    }
  }
  entries.push_back(entry);
}

void AdminMenu::add(const Entries& entries)
{
  for (const Entry& entry : entries)
    add(entry);
}

string AdminMenu::render(Crails::HtmlTemplate* tpl, Data params) const
{
  Style* style = Style::singleton::get();
  stringstream html;

  html << "<div class=\"" << style->menu_wrapper_classes(Menu::Vertical) << "\">"
       << "<a class=\"" << style->menu_heading_classes() << "\">"
       << i18n::t("admin.menu.header")
       << "</a>"
       << "<ul class=\"" << style->menu_classes() << "\">";
  for (const auto& entry : entries)
  {
    html
      << "<li class=\"" << menu_entry_classes(params, entry.url) << "\">"
      << tpl->link(entry.url, i18n::t("admin.menu." + entry.label), {
           {"class", style->menu_link_classes()}
         })
      << "</li>";
  }
  html
    << "<li class=\"" << style->menu_item_classes() << "\">"
    << tpl->link("/session", i18n::t("admin.menu.logout"), {
         {"class", style->menu_link_classes()},
         {"method", "delete"},
       })
    << "</ul>"
    << "</div>";
  return html.str();
}
