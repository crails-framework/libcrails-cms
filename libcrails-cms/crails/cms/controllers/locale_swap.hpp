#pragma once
#include <crails/controller/i18n.hpp>
#include <algorithm>

namespace Crails
{
  namespace Cms
  {
    class LocaleSwapController final : public I18nController
    {
    public:
      LocaleSwapController(Context& context) : I18nController(context) {}

      void update()
      {
        using namespace std;
        const auto&  locales = i18n::locale_names();
        const string locale  = params["locale"].defaults_to<string>("");
        const auto   referer = request.find(Crails::HttpHeader::referer);

        if (find(locales.begin(), locales.end(), locale) != locales.end())
          set_current_locale(locale);
        else
          flash["warning"] = i18n::t("locales.not-found");
        if (referer != request.end())
          redirect_to(string(referer->value()));
        else
          redirect_to("/");
      }

      bool must_protect_from_forgery() const override { return false; }
    };
  }
}
