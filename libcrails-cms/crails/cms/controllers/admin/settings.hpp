#pragma once
#include "../admin.hpp"
#include "../../models/settings.hpp"
#include "../../plugins.hpp"
#include <crails/server.hpp>
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

    void show_plugins()
    {
      std::shared_ptr<SETTINGS> model = require_settings();

      if (model)
      {
        Super::vars["page_title"] = i18n::t("admin.menu.plugins");
        Super::vars["page_subtitle"] = i18n::t("admin.plugins-subtitle");
        Super::vars["plugin_options"] = plugin_options();
        Super::render("admin/plugins", {
          {"model", reinterpret_cast<const Crails::Cms::Settings*>(model.get())}
        });
      }
    }

    void show_layout() {
      std::shared_ptr<SETTINGS> model = require_settings();

      if (model)
      {
        Super::vars["page_title"] = i18n::t("admin.menu.layout");
        Super::vars["page_subtitle"] = i18n::t("admin.layout-subtitle");
        Super::render("admin/theme_settings", {
          {"model", reinterpret_cast<const Crails::Cms::Settings*>(model.get())}
        });
      }
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
      Super::flash["info"] = i18n::t("admin.flash.resource-updated");
      Super::redirect_to("/admin/settings");
      if (model->should_reload_server())
        trigger_server_restart();
    }

  protected:
    void trigger_server_restart()
    {
      std::thread restarter([]()
      {
        sleep(1);
        Crails::Server::singleton::require().restart();
      });
      restarter.detach();
    }

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

    std::map<std::string, std::string> plugin_options()
    {
      const auto* plugins = Crails::Cms::Plugins::singleton::get();
      std::map<std::string, std::string> options;

      if (plugins)
      {
        for (const std::string& name : plugins->get_plugin_names())
          options.emplace(name, name);
      }
      return options;
    }
  };
}
