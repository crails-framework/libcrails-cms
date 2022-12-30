#pragma once
#include <crails/odb/controller.hpp>

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminWizardController : public Crails::Odb::Controller<SUPER>
  {
    typedef Crails::Odb::Controller<SUPER> Super;
    typedef typename TRAITS::UserModel UserModel;
    typedef typename TRAITS::Model     SettingsModel;
  public:
    AdminWizardController(Crails::Context& context) : Super(context)
    {
      Super::vars["layout"] = std::string("layouts/wizard");
      Super::vars["page_title"] = i18n::t("admin.wizard.title");
      Super::vars["page_subtitle"] = i18n::t("admin.wizard.subtitle");
    }

    void initialize()
    {
      if (!is_enabled())
        Super::respond_with(Crails::HttpStatus::forbidden);
      else
        Super::initialize();
    }

    void show()
    {
      UserModel user;
      SettingsModel settings;

      Super::render("admin/wizard", {
        {"user",     reinterpret_cast<const Crails::Cms::User*>(&user)},
        {"settings", reinterpret_cast<const Crails::Cms::Settings*>(&settings)}
      });
    }

    void update()
    {
      UserModel admin;
      SettingsModel settings;

      admin.edit(Super::params["user"]);
      admin.set_role(Crails::Cms::AdminRole);
      settings.edit(Super::params["setting"]);
      Super::database.save(admin);
      Super::database.save(settings);
      Super::redirect_to("/admin");
    }

  private:
    bool is_enabled()
    {
      return Super::database.count(odb::query<SettingsModel>(true)) == 0;
    }
  };
}
