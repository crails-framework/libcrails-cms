#pragma once
#include <set>
#include <crails/utils/singleton.hpp>
#include <crails/datatree.hpp>
#include "../models/menu.hpp"
#include "class_list.hpp"

namespace Crails { class HtmlTemplate; }

namespace Crails::Cms
{
  class Style
  {
    SINGLETON(Style)
  public:
    virtual DataTree as_data() const;

    virtual ClassList menu_wrapper_classes(Menu::Direction direction) const
    {
      return direction == Menu::Vertical
        ? ClassList{"pure-menu"}
        : ClassList{"pure-menu", "pure-menu-horizontal"};
    }

    virtual ClassList menu_heading_classes() const { return {"pure-menu-heading"}; }
    virtual ClassList menu_classes() const { return {"pure-menu-list"}; }
    virtual ClassList menu_item_classes() const { return {"pure-menu-item"}; }
    virtual ClassList menu_active_item_classes() const { return {"pure-menu-item", "pure-menu-selected"}; }
    virtual ClassList menu_link_classes() const { return {"pure-menu-link"}; }
    virtual ClassList menu_item_with_children_classes() const { return {"pure-menu-item", "pure-menu-has-children", "pure-menu-allow-hover"}; }
    virtual ClassList menu_children_classes() const { return {"pure-menu-children"}; }
    virtual ClassList form_classes() const { return {"pure-form","pure-form-stacked"}; }
    virtual ClassList search_form_classes() const { return form_classes() - "pure-form-stacked" + "search-form"; }
    virtual ClassList form_group_classes() const { return {}; }
    virtual ClassList form_input_classes() const { return {}; }
    virtual ClassList button_classes() const { return {"pure-button"}; }
    virtual ClassList active_button_classes() const { return button_classes() + "pure-button-active"; }
    virtual ClassList confirm_button_classes() const { return {"pure-button", "pure-button-primary"}; }
    virtual ClassList danger_button_classes() const { return {"pure-button", "pure-button-danger"}; }
    virtual ClassList button_group_classes() const { return {"pure-button-group"}; }
    virtual ClassList small_button_classes() const { return {"pure-sm-button"}; }
    virtual ClassList table_classes() const { return {"pure-table", "pure-table-horizontal", "pure-table-striped"}; }
    virtual ClassList modal_classes() const { return {}; }
    virtual ClassList modal_content_classes() const { return {}; }
    virtual ClassList modal_controls_classes() const { return {}; }
    virtual ClassList badge_classes() const { return {}; }
    virtual ClassList collection_classes() const { return {}; }
    virtual ClassList collection_item_classes() const { return {}; }
    virtual ClassList paginator_classes() const { return button_group_classes() + "proudcms-paginator"; }

    virtual std::string admin_remove_button(const HtmlTemplate&, const std::string& url, std::string label = "") const;
    virtual std::string admin_submit_button(const std::string& form_id = "") const;
    virtual std::string admin_preview_button(const std::string& action) const;
    virtual std::string admin_search_button() const;
    std::string form_group(std::function<std::string()> yield) const { return form_group({}, yield); }
    virtual std::string form_group(const ClassList& classes, std::function<std::string()> yield) const; 

    virtual std::string render_menu(const Menu&, Menu::Direction, const ClassList& classlist = {}, const std::string& header = "") const;

    virtual std::string javascript_on_content_loaded() const { return std::string(); }
  };
}
