#pragma once
#include <crails/controller.hpp>

namespace Crails::Cms
{
  class StyleController : public Crails::Controller
  {
  public:
    StyleController(Crails::Context& context);

    void show();
  };
}
