#pragma once
#include "resource.hpp"
#include "../models/page.hpp"
#include "../views/layout.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class PageController : public Crails::Cms::ResourceController<TRAITS, SUPER>
  {
    typedef Crails::Cms::ResourceController<TRAITS, SUPER> Super;
  public:
    PageController(Crails::Context& context) : Super(context)
    {
    }

    void render_model(const typename Super::Model& model) override
    {
      render_page(model);
    }

    virtual void render_page(const typename Super::Model& model)
    {
      if (model.can_read(Super::get_current_user()))
      {
        const Layout& layout = model.get_layout();
        std::string layout_path = layout.get_layout_path();
        std::string page_view = "pages/show";

        if (!layout_path.length())
          layout_path = Super::find_settings()->get_layout().get_layout_path();
        if (layout.get_type() == DocumentLayoutType)
          page_view = "pages/document";
        Super::prepare_open_graph(model);
        Super::vars["layout"] = layout_path;
        Super::vars["render_footer"] = !model.get_has_footer();
        Super::render(page_view, {
          {"page", reinterpret_cast<const Crails::Cms::Page*>(&model)}
        });
      }
      else
        Super::respond_with(Crails::HttpStatus::forbidden);
    }
  };
}
