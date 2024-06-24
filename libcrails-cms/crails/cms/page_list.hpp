#pragma once
#include <crails/utils/singleton.hpp>
#include <crails/odb/connection.hpp>
#include <string>
#include <map>
#include "models/sluggable.hpp"

namespace Crails::Cms
{
  class PageList
  {
    SINGLETON(PageList)
  public:
    typedef std::map<std::string,std::string> PathMap;

    virtual PathMap list() const;
    virtual PathMap feeds() const;

  protected:
    template<typename SLUGGABLE>
    void append_sluggable_routes(const std::string& prefix, PathMap& pathes, odb::query<SLUGGABLE> query = odb::query<SLUGGABLE>(true))
    {
      Crails::Odb::ConnectionHandle database;
      odb::result<SLUGGABLE> models;

      database.find<SLUGGABLE>(models, query);
      for (const Crails::Cms::Sluggable& model : models)
      {
        std::string url = prefix + '/' + model.get_slug();
        pathes.emplace(model.get_title(), url);
      }
    }
  };
}
