#pragma once
#include <set>
#include <crails/utils/singleton.hpp>
#include <crails/datatree.hpp>
#include "../models/menu.hpp"
#include "class_list.hpp"

namespace Crails { class HtmlTemplate; }

namespace Crails::Cms
{
  typedef std::vector<std::pair<std::string,std::string>> BreadcrumbsList;

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
    virtual ClassList confirm_button_classes() const { return button_classes() + "pure-button-primary"; }
    virtual ClassList danger_button_classes() const { return button_classes() + "pure-button-danger"; }
    virtual ClassList button_group_classes() const { return {"pure-button-group"}; }
    virtual ClassList small_button_classes() const { return {"pure-sm-button"}; }
    virtual ClassList table_classes() const { return {"pure-table", "pure-table-horizontal", "pure-table-striped"}; }
    virtual ClassList sortable_table_classes() const { return table_classes() + "sortable-relationship"; }
    virtual ClassList modal_classes() const { return {}; }
    virtual ClassList modal_content_classes() const { return {}; }
    virtual ClassList modal_controls_classes() const { return {}; }
    virtual ClassList badge_classes() const { return {}; }
    virtual ClassList collection_classes() const { return {}; }
    virtual ClassList collection_item_classes() const { return {}; }
    virtual ClassList paginator_classes() const { return button_group_classes() + "cms-paginator"; }
    virtual ClassList card_classes() const { return {}; }
    virtual ClassList frame_classes() const { return {}; }
    virtual ClassList document_wrapper_classes() const { return {"document"}; }

    virtual std::string signin_button(const std::string& form_id = "") const;
    virtual std::string admin_remove_button(const HtmlTemplate&, const std::string& url, std::string label = "") const;
    virtual std::string admin_submit_button(const std::string& form_id = "") const;
    virtual std::string admin_preview_button(const std::string& action) const;
    virtual std::string admin_search_button() const;
    std::string form_group(std::function<std::string()> yield) const { return form_group({}, yield); }
    virtual std::string form_group(const ClassList& classes, std::function<std::string()> yield) const; 

    virtual std::string render_menu(const Menu&, Menu::Direction, const ClassList& classlist = {}, const std::string& header = "") const;
    std::string section(std::function<std::string()> yield) const { return section(1, {}, yield); }
    std::string section(const std::map<std::string,std::string>& attrs, std::function<std::string()> yield) const { return section(1, attrs, yield); }
    virtual std::string section(int index, const std::map<std::string, std::string>&, std::function<std::string()> yield) const;
    std::string card(std::function<std::string()> yield) const { return card({}, yield); }
    virtual std::string card(const std::map<std::string,std::string>&, std::function<std::string()> yield) const;
    std::string thumbnail(const std::string& src) const { return thumbnail({}, src); }
    virtual std::string thumbnail(const ClassList& classes, const std::string& src) const;
    std::string nav(std::function<std::string()> yield) const { return nav({}, yield); }
    virtual std::string nav(const ClassList& classes, std::function<std::string()> yield) const;
    virtual std::string breadcrumbs(const BreadcrumbsList& crumbs) const;

    virtual std::vector<std::string> stylesheets() const;
    virtual std::vector<std::string> admin_stylesheets() const;
    virtual std::string_view admin_layout() const;
    virtual std::string_view wizard_layout() const;
    virtual std::string javascript_on_content_loaded() const { return std::string(); }
  };
}
