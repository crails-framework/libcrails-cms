#include "sluggable.hpp"
#include <crails/utils/semantics.hpp>
#include <crails/url.hpp>

using namespace std;
using namespace Crails;
using namespace Crails::Cms;

string Sluggable::slug_from_title(const string& title) const
{
  return Url::encode(dasherize(title));
}

void Sluggable::edit(Data params)
{
  if (!params["slug"].is_blank())
    set_slug(params["slug"]);
  else if (params["title"].exists())
    set_slug(slug_from_title(params["title"]));
  if (params["title"].exists())
    set_title(params["title"]);
}

void Sluggable::merge_data(Data out) const
{
  out["title"] = this->title;
  out["slug"] = this->slug;
}

string Sluggable::to_json() const
{
  DataTree out;

  merge_data(out);
  return out.to_json();
}
