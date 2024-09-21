#include "sitemap.hpp"
#include "time.hpp"
#include "controllers/sitemap.hpp"
#include <sstream>
#include <crails/cms/routes.hpp>

using namespace std;
using namespace Crails;
using namespace Crails::Cms::SiteMap;

static time_t latest_update_for(const UrlSet& urls)
{
  time_t result = 0;

  for (const Url& url : urls)
  {
    if (url.updated_at > result)
      result = url.updated_at;
  }
  return result;
}

void Index::merge(Data data) const
{
  for (const Url& url : url_set())
  {
    DataTree object;

    object["title"] = url.title;
    object["href"] = url.location;
    data.push_back(object.as_data());
  }
}

void Map::merge(Data data) const
{
  for (auto it = begin() ; it != end() ; ++it)
  {
    const Index& index = *(it->second);
    const string& name(it->first);

    index.merge(data[name]);
  }
}

void Index::render(const string& host_url, RenderTarget& target) const
{
  ostringstream stream;

  stream << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
         << "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
  for (const Url& url : url_set())
  {
    double priority = static_cast<double>(url.priority) / 10;
    stream << "<url>"
           << "<loc>" << host_url << url.location << "</loc>"
           << "<lastmod>" << time_to_string(url.updated_at, "%Y-%m-%d") << "</lastmod>"
           << "<priority>" << priority << "</priority>"
           << "</url>";
  }
  stream << "</urlset>";
  target.set_header("Content-Type", "application/xml");
  target.set_body(stream.str());
}

void Map::render(const string& host_url, RenderTarget& target) const
{
  const Crails::Cms::Routes& routes = Cms::Routes::singleton::require();
  ostringstream stream;

  stream << "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n"
         << "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">";
  for (auto it = begin() ; it != end() ; ++it)
  {
    const UrlSet urls = it->second->url_set();
    const string name(it->first);

    if (urls.size() > 0)
    {
      time_t updated_at = latest_update_for(urls);

      stream << "<sitemap>"
             << "<loc>" << host_url << routes.get_path_for<Controller>('/' + name) << "</loc>"
             << "<lastmod>" << time_to_string(updated_at, "%Y-%m-%d") << "</lastmod>"
             << "</sitemap>";
    }
  }
  stream << "</sitemapindex>";
  target.set_header("Content-Type", "application/xml");
  target.set_body(stream.str());
}
