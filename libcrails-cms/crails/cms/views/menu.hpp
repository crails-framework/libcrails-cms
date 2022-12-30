#pragma once
#include "../views/menu.hpp"
#include <crails/odb/connection.hpp>
#include <crails/params.hpp>
#include <crails/html_template.hpp>
#include "style.hpp"

namespace Crails::Cms
{
  class MenuManager
  {
    SINGLETON(MenuManager)
  public:
    virtual std::shared_ptr<Menu> find_menu(const std::string& name) const { return nullptr; }

  protected:
    template<typename MENU>
    std::shared_ptr<MENU> find_menu_with_type(const std::string& name) const
    {
      Crails::Odb::Connection database;
      std::shared_ptr<MENU> menu;

      database.rollback_on_destruction = false;
      database.find_one(menu, odb::query<MENU>::name == name);
      return menu;
    }
  };

  class RenderMenu
  {
  public:
    RenderMenu(const std::string& name, HtmlTemplate* tpl) : name(name), tpl(tpl)
    {
      style = Crails::Cms::Style::singleton::get();
    }

    RenderMenu& with_style(const Crails::Cms::Style* value) { style = value; return *this; }
    RenderMenu& with_direction(Crails::Cms::Menu::Direction value) { direction = value; return *this; }
    RenderMenu& with_class(ClassList value) { classes = classes + value; return *this; }

    std::string operator()(HtmlTemplate::Yieldable yield);
    std::string operator()(const char* yield = nullptr);

  private:
    std::string name;
    Crails::HtmlTemplate* tpl;
    const Crails::Cms::Style* style;
    Crails::Cms::ClassList classes;
    Crails::Cms::Menu::Direction direction = Crails::Cms::Menu::Horizontal;
  };

  bool is_active_menu_from_uri(Data, const std::string&);

  std::string menu_entry_classes(Data, const std::string&, bool with_children = false);
}
