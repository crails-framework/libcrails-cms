#pragma once
#include <string>

namespace Crails::Cms
{
  class Settings;

  class NewsFeed
  {
  public:
    NewsFeed(const std::string& href);
    NewsFeed() {}

    std::string render(const Settings&) const;
    bool exists() const { return href.length() > 0; }

  private:
    std::string href;
    std::string title;
    std::string type = "application/rss+xml";
  };
}
