#pragma once
#include "resource.hpp"
#include "../../models/menu.hpp"
#include <crails/odb/helpers.hpp>

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminMenuController : public AdminResourceController<TRAITS, Crails::Cms::Menu, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::Menu, SUPER> Super;

    std::string get_view_scope() const override { return "menus"; }
  public:
    AdminMenuController(Crails::Context& context) : Super(context)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.menus");
      Super::vars["page_subtitle"] = i18n::t("admin.menus-subtitle");
    }

  protected:
    void render_editor(typename TRAITS::Model& model) override
    {
      Super::vars["page_title"] = model.get_name();
      Super::render_editor(model);
    }
  };
}
