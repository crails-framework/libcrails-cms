#pragma once
#include <vector>
#include <string>
#include <crails/image.hpp>

namespace Crails::Cms
{
  struct OpenGraph
  {
    typedef std::vector<std::string> Locales;

    enum Type
    {
      WebsiteType,
      ArticleType,
      VideoMovieType,
      VideoEpisodeType
    };

    Type        type = WebsiteType;
    std::string site_name;
    std::string title;
    std::string description;
    Locales     locales;
    std::string url;
    std::string image;

    std::string render() const;
  };
}
