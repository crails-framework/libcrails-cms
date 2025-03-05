#pragma once
#include <crails/utils/singleton.hpp>
#include <crails/render_target.hpp>
#include <crails/datatree.hpp>
#include <vector>
#include <map>
#include <string_view>
#include <sstream>
#include <ctime>
#include <memory>

namespace Crails::Cms::SiteMap
{
  struct Url
  {
    std::string title;
    std::string location;
    std::time_t updated_at;
    char        priority = 5;
  };

  typedef std::vector<Url> UrlSet;

  struct Index
  {
    virtual ~Index() {}
    virtual UrlSet url_set() const = 0;
    void render(const std::string& host_url, RenderTarget&) const;
    void merge(Data) const;
  };

  struct Map : public std::map<std::string, std::unique_ptr<Index>>
  {
    void render(const std::string& host_url, RenderTarget&) const;
    void merge(Data) const;
  };
}
