#pragma once
#include <crails/odb/connection.hpp>
#include "models/sluggable.hpp"
#include "sitemap.hpp"
#include "routes.hpp"

namespace Crails::Cms::SiteMap
{
  template<typename CONTROLLER, typename TRAITS>
  struct ResourceIndex : public Index
  {
    typedef typename TRAITS::IndexModel IndexModel;

    UrlSet url_set() const override
    {
      const auto& routes = Crails::Cms::Routes::singleton::require();
      Crails::Odb::ConnectionHandle database;
      odb::result<IndexModel> models;
      UrlSet urls;

      database.find<IndexModel>(models);
      for (const IndexModel& model : models)
      {
        urls.push_back(Crails::Cms::SiteMap::Url{
          model.get_title(),
          routes.get_path_for<CONTROLLER>('/' + model.get_slug()),
          model.get_updated_at()
        });
      }
      return urls;
    }
  };
}
