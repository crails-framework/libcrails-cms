#pragma once
#include "../admin.hpp"
#include "../../models/settings.hpp"
#include <crails/i18n.hpp>

namespace Crails::Cms
{
  template<typename USER, typename SETTINGS, typename PAGE, typename SUPER>
  class AdminSettingsController : public AdminController<USER, SUPER>
  {
    typedef AdminController<USER, SUPER> Super;
  public:
    AdminSettingsController(Crails::Context& context) : Super(context)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.settings");
      Super::vars["page_subtitle"] = i18n::t("admin.settings-subtitle");
    }

    void show()
    {
      std::shared_ptr<SETTINGS> model = require_settings();

      if (model)
        render_editor(*model);
    }

    void render_editor(SETTINGS& model)
    {
      Super::vars["page_options"] = page_options();
      Super::render("admin/settings", {
        {"model", reinterpret_cast<const Crails::Cms::Settings*>(&model)}
      });
    }

    void update()
    {
      std::shared_ptr<SETTINGS> model = require_settings();

      model->edit(Super::params["setting"]);
      Super::database.save(*model);
      Super::flash["info"] = "Settings updated";
      Super::redirect_to("/admin/settings");
    }
  protected:
    std::shared_ptr<SETTINGS> require_settings()
    {
      auto model = Super::find_settings();

      if (model)
        return std::dynamic_pointer_cast<SETTINGS>(model);
      return std::make_shared<SETTINGS>();
    }

    std::map<Crails::Odb::id_type, std::string> page_options()
    {
      std::map<Crails::Odb::id_type, std::string> options;
      odb::result<PAGE> pages;

      Super::database.find(pages, odb::query<PAGE>(true));
      for (const PAGE& page : pages)
        options.emplace(page.get_id(), page.get_title());
      return options;
    }
  };
}
