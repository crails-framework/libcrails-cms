#include "newsfeed.hpp"
#include "../models/settings.hpp"
#include <crails/html_template.hpp>
#include <crails/getenv.hpp>

using namespace std;

Crails::Cms::NewsFeed::NewsFeed(const string& href) : href(href)
{
  if (href.length() == 0)
    this->href = Crails::getenv("DEFAULT_RSS_PATH", "");
}

string Crails::Cms::NewsFeed::render(const Crails::Cms::Settings& settings) const
{
  return Crails::HtmlTemplate::tag("link", {
    {"rel",   "alternate"},
    {"type",  type},
    {"href",  "//" + settings.get_public_url() + href},
    {"title", title.length() ? title : settings.get_title()}
  });
}
