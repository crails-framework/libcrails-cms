#include "editable.hpp"
#include "../html_excerpt.hpp"

void Crails::Cms::Editable::edit(Data params)
{
  Sluggable::edit(params);
  if (params["thumbnail"].exists())
    set_thumbnail_url(params["thumbnail"]);
  if (params["description"].exists())
    description.from_data(params["description"]);
  if (params["body"].exists())
  {
    body.from_data(params["body"]);
    Crails::Cms::generate_translated_excerpts_from_html(description, body);
  }
}

void Crails::Cms::Editable::merge_data(Data out) const
{
  Sluggable::merge_data(out);
  out["body"].merge(this->body);
  out["description"].merge(this->description);
  if (this->thumbnail.length())
    out["thumbnail"] = this->thumbnail;
}
