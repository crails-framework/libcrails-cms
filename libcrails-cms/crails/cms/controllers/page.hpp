#pragma once
#include "resource.hpp"
#include "injectable.hpp"
#include "../models/page.hpp"
#include "../views/layout.hpp"
#include <boost/lexical_cast.hpp>
#include <crails/any_cast.hpp>
#include <crails/renderer.hpp>
#include <crails/logger.hpp>

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class PageController : public Crails::Cms::ResourceController<TRAITS, SUPER>
  {
    typedef Crails::Cms::ResourceController<TRAITS, SUPER> Super;
  public:
    class InjectablePage : public Crails::Cms::Injectable
    {
      typedef std::shared_ptr<typename Super::Model> ModelPtr;
      ModelPtr model;
    public:
      InjectablePage(const Crails::SharedVars& vars, Crails::RenderTarget& sink)
        : Injectable(vars, sink)
      {}

      InjectablePage(ModelPtr model, const Crails::SharedVars& vars, Crails::RenderTarget& sink)
        : Injectable(vars, sink), model(model)
      {}

      Crails::Odb::id_type page_id() const
      {
        return boost::lexical_cast<Crails::Odb::id_type>(
          Crails::any_cast(vars.at("id"))
        );
      }

      bool require_model()
      {
        if (!model)
          database.find_one(model, page_id());
        return model != nullptr;
      }

      void run() override
      {
        using namespace Crails;
        if (require_model())
        {
          const Layout& layout = model->get_layout();
          std::string layout_path = layout.get_layout_path();
          std::string page_view = "pages/show";

          if (layout.get_type() == DocumentLayoutType)
            page_view = "pages/document";
          if (injecting)
            vars["render_footer"] = false;
          else
          {
            if (layout_path.length())
              vars["layout"] = layout_path;
            vars["render_footer"] = !model->get_has_footer();
          }
          render(page_view, {
            {"page", reinterpret_cast<const Crails::Cms::Page*>(model.get())}
          });
        }
        else
          render_text("<!-- Page not found --!>");
      }
    };

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
        InjectablePage injectable(
          std::make_shared<typename Super::Model>(model),
          Super::vars,
          Super::response
        );

        Super::prepare_open_graph(model);
        injectable.run();
      }
      else
        Super::respond_with(Crails::HttpStatus::forbidden);
    }
  };
}
