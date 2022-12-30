#include "routes.hpp"
#include "controllers/style.hpp"
#include <crails/controller/i18n.hpp>

namespace Crails::Cms
{
  void initialize_cms_routes(Crails::Router& router)
  {
    router.match_action("GET", "/cms/locale/:lang", I18nController, json_locale);
    router.match_action("GET", "/cms/locale/", I18nController, json_locale);
    router.match_action("GET", "/cms/style", StyleController, show);
  }
}
