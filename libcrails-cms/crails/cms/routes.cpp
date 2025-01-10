#include "routes.hpp"
#include "controllers/style.hpp"
#include "controllers/sitemap.hpp"
#include <crails/controller/i18n.hpp>

namespace Crails::Cms
{
  void initialize_cms_routes(Crails::Router& router)
  {
    router.match_action("GET", "/cms/locale/:lang", I18nController, json_locale);
    router.match_action("GET", "/cms/locale/", I18nController, json_locale);
    router.match_action("GET", "/cms/style", StyleController, show);
  }

  void Routes::register_sitemap_routes(Crails::Router& router, const std::string& prefix)
  {
    router.match("GET", "robots.txt", std::bind(
      &SiteMap::Controller::handle_robots_request,
      std::placeholders::_1, prefix, std::placeholders::_2
    ));
    router.scope(prefix, [this, &router]()
    {
      set_path_for<SiteMap::Controller>(router);
      router.match("GET", "/json", SiteMap::Controller::as_json_request);
      router.match("GET", "/", SiteMap::Controller::handle_request);
      router.match("GET", "/:index", SiteMap::Controller::handle_request);
    });
  }
}
