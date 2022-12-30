#pragma once
#include "resource.hpp"
#include "../../models/page.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminPageController : public AdminResourceController<TRAITS, Crails::Cms::Page, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::Page, SUPER> Super;
    typedef typename TRAITS::Model Model;

    std::string get_view_scope() const override { return "pages"; }
  public:
    AdminPageController(Crails::Context& context) : Super(context)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.pages");
      Super::vars["page_subtitle"] = i18n::t("admin.pages-subtitle");
    }

    void new_()
    {
      Model model;

      if (Super::params["with_cms_layout"].exists())
        model.set_layout_name(Super::params["with_cms_layout"].template as<std::string>());
      Super::vars["page_subtitle"] = i18n::t("admin.new-page");
      Super::render_editor(model);
    }

  protected:
    void render_editor(typename TRAITS::Model& model) override
    {
      if (Super::params["with_cms_layout"].exists())
        model.set_layout_name(Super::params["with_cms_layout"].template as<std::string>());
      Super::vars["page_title"] = std::string(model.get_title());
      Super::vars["page_subtitle"] = i18n::t("admin.page-edition");
      Super::render_editor(model);
    }
  };
}
