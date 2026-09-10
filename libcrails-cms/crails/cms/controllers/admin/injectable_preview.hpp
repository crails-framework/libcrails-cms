#pragma once
#include "../admin.hpp"
#include "../../views/injector.hpp"

namespace Crails::Cms
{
  template<typename USER, typename SUPER>
  class InjectablePreviewController : public AdminController<USER, SUPER>
  {
    typedef AdminController<USER, SUPER> Super;
  public:
    InjectablePreviewController(Crails::Context& context) : Super(context)
    {
    }

    void show()
    {
      std::string name = Super::params["name"];
      Crails::SharedVars vars = Super::vars;

      for (Data value : Super::params["vars"])
        vars[value.get_key()] = value.as<std::string>();
      Injector::render_injectable(name, vars, Super::response);
    }
  };
}
