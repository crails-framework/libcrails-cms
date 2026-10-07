#include "version_picker.hpp"
#include "style.hpp"
#include "../time.hpp"
#include <crails/html_template.hpp>
#include <crails/i18n.hpp>
#include <iomanip>
#include <sstream>

using namespace std;
using namespace Crails;
using namespace Crails::Cms;

static string format_date(time_t timestamp)
{
  return time_to_string(timestamp, "%Y-%m-%d %H:%M");
}

static string version_label(const VersionSummary& version, unsigned int current)
{
  stringstream label;

  label << '#' << version.number << " \u2013 " << format_date(version.recorded_at);
  if (version.author_name.length())
    label << " \u2013 " << version.author_name;
  if (version.number == current)
    label << " (" << i18n::t("admin.versions.live") << ')';
  return label.str();
}

string Crails::Cms::render_version_picker(const SharedVars& vars)
{
  auto entry = vars.find("version_picker");

  if (entry == vars.end())
    return string();

  const VersionPickerData* data = Crails::cast<const VersionPickerData*>(vars, "version_picker");
  const Style* style = Style::singleton::get();
  stringstream html;
  ClassList item_classes;

  if (data == nullptr || data->versions.empty())
    return string();
  item_classes = style->form_group_classes() + "cms-version-picker";
  if (data->selected != data->current)
    item_classes = item_classes + "cms-version-pending";
  html << "<div class=\"" << item_classes << "\" data-version-picker"
       << " data-current=\"" << data->current << "\""
       << " data-route=\"" << data->route << "\">"
       << "<label for=\"version-picker-select\">" << i18n::t("admin.versions.label") << "</label>"
       << "<input type=\"hidden\" name=\"version\" value=\"" << data->selected << "\">"
       << "<select id=\"version-picker-select\" class=\"" << style->form_input_classes().to_string() << "\" data-version-picker-select>";
  for (const VersionSummary& version : data->versions)
  {
    html << "<option value=\"" << version.number << '"'
         << (version.number == data->selected ? " selected" : "")
         << '>' << HtmlTemplate::html_escape(version_label(version, data->current))
         << "</option>";
  }
  html << "</select>";
  if (data->selected != data->current && data->route.length())
  {
    html << "<button type=\"button\" class=\""
         << (style->danger_button_classes() + style->small_button_classes()).to_string()
         << "\" data-version-picker-delete>"
         << i18n::t("admin.versions.delete")
         << "</button>";
  }
  html << "</div>";
  return html.str();
}
