#include "opengraph.hpp"
#include <crails/html_template.hpp>

using namespace Crails;
using namespace Crails::Cms;
using namespace std;

static string type_to_string(OpenGraph::Type type)
{
  switch (type)
  {
  case OpenGraph::ArticleType:
    return "article";
  default:
    break ;
  }
  return "website";
}

string OpenGraph::render() const
{
  stringstream stream;

  stream
    << HtmlTemplate::tag("meta", map<string,string>{
      {"property", "og:title"}, {"content", title}
    })
    << HtmlTemplate::tag("meta", map<string,string>{
      {"property", "og:type"}, {"content", type_to_string(type)}
    })
    << HtmlTemplate::tag("meta", map<string,string>{
      {"property", "og:url"}, {"content", url}
    })
    << HtmlTemplate::tag("meta", map<string,string>{
      {"property", "og:description"}, {"content", description}
    });
  if (locales.size() > 0)
  {
    stream << HtmlTemplate::tag("meta", map<string,string>{
      {"property", "og:locale"}, {"content", *locales.begin()}
    });
    for (auto locale : locales)
    {
      stream << HtmlTemplate::tag("meta", map<string,string>{
        {"property", "og:locale:alternate"}, {"content", locale}
      });
    }
  }
  if (image.length() > 0)
  {
    stream << HtmlTemplate::tag("meta", map<string,string>{
      {"property", "og:image"}, {"content", image}
    });
  }
  return stream.str();
}
