#pragma once
#include <crails/context.hpp>
#include "../models/settings.hpp"
#include "../sitemap.hpp"

namespace Crails::Cms::SiteMap
{
  class Controller
  {
    SINGLETON(Controller)
    Map indexes;
  public:
    virtual std::shared_ptr<Crails::Cms::Settings> find_settings() const = 0;

    void initialize_plugin_indexes();
    void add_index(const std::string&, std::unique_ptr<Index>);

    static void as_json_request(Crails::Context&, std::function<void()>);
    static void handle_request(Crails::Context&, std::function<void()>);
    static void handle_robots_request(Crails::Context&, const std::string prefix, std::function<void()>);
  private:
    void handle_robots(Crails::Context&, const std::string&) const;
    void handle_urlset_request(Crails::Context&, const std::string&) const;
    void handle_sitemapindex_request(Crails::Context&) const;
  };
}
