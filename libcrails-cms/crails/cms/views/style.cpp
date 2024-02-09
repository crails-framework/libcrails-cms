#include "style.hpp"
#include "../lib/assets.hpp"
#include <crails/icons.hpp>
#include <crails/i18n.hpp>
#include <crails/html_template.hpp>
#include <sstream>

using namespace Crails;
using namespace std;

vector<string> Cms::Style::stylesheets() const
{
  return {CrailsCmsAssets::pure_css, CrailsCmsAssets::proudcms_css};
}

vector<string> Cms::Style::admin_stylesheets() const
{
  auto result = stylesheets();

  result.push_back(CrailsCmsAssets::admin_css);
  return result;
}

string_view Cms::Style::admin_layout() const
{
  return "layouts/admin";
}

string_view Cms::Style::wizard_layout() const
{
  return "layouts/wizard";
}

DataTree Cms::Style::as_data() const
{
  DataTree tree;

  tree["form"] = string(form_classes());
  tree["searchForm"] = string(search_form_classes());
  tree["formGroup"] = string(form_group_classes());
  tree["formInput"] = string(form_input_classes());
  tree["buttonGroup"] = string(button_group_classes());
  tree["button"] = string(button_classes());
  tree["confirmButton"] = string(confirm_button_classes());
  tree["dangerButton"] = string(danger_button_classes());
  tree["smallButton"] = string(small_button_classes());
  tree["activeButton"] = string(active_button_classes());
  tree["table"] = string(table_classes());
  tree["menuHeading"] = string(menu_heading_classes());
  tree["verticalMenuWrapper"] = string(menu_wrapper_classes(Cms::Menu::Vertical));
  tree["horizontalMenuWrapper"] = string(menu_wrapper_classes(Cms::Menu::Horizontal));
  tree["menu"] = string(menu_classes());
  tree["menuActiveItem"] = string(menu_active_item_classes());
  tree["menuLink"] = string(menu_link_classes());
  tree["menuItem"] = string(menu_item_classes());
  tree["menuItemWithChildren"] = string(menu_item_with_children_classes());
  tree["menuChildren"] = string(menu_children_classes());
  tree["modal"] = string(modal_classes());
  tree["modalContent"] = string(modal_content_classes());
  tree["modalControls"] = string(modal_controls_classes());
  tree["badge"] = string(badge_classes());
  tree["collection"] = string(collection_classes());
  tree["collectionItem"] = string(collection_item_classes());
  tree["paginator"] = string(paginator_classes());
  return tree;
}

string Cms::Style::form_group(const Cms::ClassList& classes, function<string()> yield) const
{
  return HtmlTemplate::tag("div", {
    {"class", form_group_classes() + classes}
  }, yield);
}

string Cms::Style::signin_button(const std::string& form_id) const
{
  return admin_submit_button(form_id);
}

string Cms::Style::admin_remove_button(const HtmlTemplate& tpl, const string& url, string label) const
{
  HtmlTemplate::Yieldable yield = [&label]()
  {
    return fonticon_tag(FontIcon::Destroy)
         + ' '
         + HtmlTemplate::html_escape(label);
  };

  if (!label.length())
    label = i18n::t("admin.destroy");
  return tpl.link(url, {
    {"class", singleton::get()->danger_button_classes()},
    {"method", "delete"},
    {"confirm", i18n::t("admin.confirm-destroy")}
  }, yield);
}

string Cms::Style::admin_submit_button(const std::string& form_id) const
{
  auto yield = []() -> string
  {
    return fonticon_tag(FontIcon::Save)
         + ' '
         + i18n::t("admin.confirm");
  };
  map<string,string> attrs{
    {"type", "submit"},
    {"class", confirm_button_classes()}
  };

  if (form_id.length() > 0)
    attrs["form"] = form_id;
  return HtmlTemplate::tag("button", attrs, yield);
}

string Cms::Style::admin_preview_button(const std::string& action) const
{
  auto yield = []() -> string
  {
    return fonticon_tag(FontIcon::Preview)
         + ' '
         + i18n::t("admin.preview");
  };

  return HtmlTemplate::tag("button", {
    {"type", "submit"},
    {"class", confirm_button_classes()},
    {"form", "main-form"},
    {"onclick", "event.preventDefault();window.previewPost(this.form, '" + action + "')"}
  }, yield);
}

string Cms::Style::admin_search_button() const
{
  auto yield = []() -> string
  {
    return fonticon_tag(FontIcon::Search)
         + ' ' + i18n::t("admin.search");
  };

  return HtmlTemplate::tag("button", {
    {"type", "submit"},
    {"class", confirm_button_classes()}
  }, yield);
}

string Cms::Style::section(int, const std::map<std::string, std::string>& attrs, std::function<std::string()> yield) const
{
  return HtmlTemplate::tag("section", attrs, yield);
}

string Cms::Style::card(const std::map<std::string,std::string>& attrs, std::function<std::string()> yield) const
{
  return HtmlTemplate::tag("div", attrs, yield);
}

string Cms::Style::thumbnail(const ClassList& classes, const std::string& src) const
{
  return HtmlTemplate::tag("img", {{"class",classes + "thumbnail"},{"src",src}});
}

string Cms::Style::nav(const ClassList& classes, function<string()> yield) const
{
  return HtmlTemplate::tag("nav", {{"class",classes}}, yield);
}
