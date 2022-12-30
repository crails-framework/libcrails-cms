#pragma once
#include <crails/odb/controller.hpp>
#include <crails/controller/i18n.hpp>
#include "../opengraph.hpp"
#include "../models/editable.hpp"
#include "../models/settings.hpp"

namespace Crails::Cms
{
  class User;

  class Controller : public Crails::Odb::Controller<Crails::I18nController>
  {
    typedef Crails::Odb::Controller<Crails::I18nController> Super;
  protected:
    Controller(Crails::Context& context) : Super(context)
    {
    }

    void initialize();
    virtual void respond_with(Crails::HttpStatus status);

    void prepare_open_graph();
    void prepare_open_graph(const Crails::Cms::Editable&);

    virtual std::shared_ptr<Crails::Cms::Settings> find_settings() = 0;

    virtual const User* get_current_user() { return nullptr; }

    std::shared_ptr<Crails::Cms::Settings> settings;
    Crails::Cms::OpenGraph open_graph;
  };
}
