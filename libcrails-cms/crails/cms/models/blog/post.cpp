#include "post.hpp"
#include "../user.hpp"
#include <crails/utils/semantics.hpp>
#include <crails/url.hpp>
#include <iomanip>
#include <ctime>
#include <sstream>

using namespace std;

const std::string Crails::Cms::BlogPost::scope = "blogpost";
const std::string Crails::Cms::BlogPost::plural_scope = "blogposts";
const std::string Crails::Cms::BlogPost::view = "blog/post/show";

void Crails::Cms::BlogPost::edit(Data params)
{
  Editable::edit(params);
  if (params["tags"].exists())
    set_tags(params["tags"].to_vector<std::string>());
}

void Crails::Cms::BlogPost::merge_data(Data out) const
{
  Editable::merge_data(out);
  out["published"] = published;
  out["publication_at"] = publication_at;
  out["author_id"] = author_id;
  out["tags"].from_vector(get_tags());
}

string Crails::Cms::BlogPost::slug_from_title(const std::string& title) const
{
  stringstream slug;
  auto tmp = publication_at;
  auto t = std::time(&tmp);
  auto tm = *std::localtime(&t);

  slug << put_time(&tm, "%d-%m-%Y") << '-';
  slug << Crails::Url::encode(Crails::dasherize(title));
  return slug.str();
}

void Crails::Cms::BlogPost::set_author(const std::shared_ptr<Crails::Cms::User>& value)
{
  if (value)
  {
    author_id = value->get_id();
    t_author = value;
  }
  else
  {
    author_id = ODB_NULL_ID;
    t_author = nullptr;
  }
}
