#include "page.hpp"
#include "../views/layout.hpp"
#include <crails/utils/semantics.hpp>
#include <crails/url.hpp>

const std::string Crails::Cms::Page::scope = "page";
const std::string Crails::Cms::Page::plural_scope = "pages";
const std::string Crails::Cms::Page::view = "pages/show";

void Crails::Cms::Page::edit(Data params)
{
  Editable::edit(params);
  if (params["layout"].exists())
    set_layout_name(params["layout"].as<std::string>());
  if (params["has_footer"].exists())
    set_has_footer(params["has_footer"].as<std::string>() == "1");
}

void Crails::Cms::Page::merge_data(Data out) const
{
  Editable::merge_data(out);
  out["layout"] = this->layout_name;
  out["has_footer"] = this->has_footer;
}

void Crails::Cms::Page::set_layout(const Crails::Cms::Layout& layout)
{
  layout_name = layout.get_name();
}

const std::string& Crails::Cms::Page::get_layout_name() const
{
  //if (layout_name.length() == 0)
  //  return get_layout().get_name();
  return layout_name;
}

const Crails::Cms::Layout& Crails::Cms::Page::get_layout(const std::string& theme) const
{
  return Crails::Cms::Layout::get(theme, layout_name);
}
