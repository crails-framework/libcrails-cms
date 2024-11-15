#include "sluggable.hpp"
#include <crails/utils/string.hpp>
#include <crails/url.hpp>
#include <crails/i18n.hpp>

using namespace std;
using namespace Crails;
using namespace Crails::Cms;

string Sluggable::slug_from_title(const string& title) const
{
  return Url::encode(
    dasherize(
      title
    )
  );
}

string Sluggable::slug_from_title(const i18n::String& title) const
{
  const auto& i18n_settings = i18n::Settings::singleton::require();
  const string& locale = i18n_settings.default_locale;

  if (locale.length() && title[locale].exists())
    return slug_from_title(title[locale].as<string>());
  return slug_from_title(title.to_string());
}

void Sluggable::edit(Data params)
{
  if (params["title"].exists())
    title.from_data(params["title"]);
  if (!params["slug"].is_blank())
    set_slug(params["slug"]);
  else if (params["title"].exists())
    set_slug(slug_from_title(title));
}

void Sluggable::merge_data(Data out) const
{
  out["title"].merge(this->title);
  out["slug"] = this->slug;
}

string Sluggable::to_json() const
{
  DataTree out;

  merge_data(out);
  return out.to_json();
}
