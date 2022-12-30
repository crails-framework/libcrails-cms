#include "editable.hpp"

void Crails::Cms::Editable::edit(Data params)
{
  Sluggable::edit(params);
  if (params["body"].exists())
    set_body(params["body"]);
  if (params["description"].exists())
    set_description(params["description"]);
  if (params["thumbnail"].exists())
    set_thumbnail_url(params["thumbnail"]);
}

void Crails::Cms::Editable::merge_data(Data out) const
{
  Sluggable::merge_data(out);
  out["body"] = this->body;
  if (this->description.length())
    out["description"] = this->description;
  if (this->thumbnail.length())
    out["thumbnail"] = this->thumbnail;
}
