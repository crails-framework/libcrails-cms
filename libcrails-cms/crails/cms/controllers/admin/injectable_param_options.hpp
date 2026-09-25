#pragma once
#include "../admin.hpp"
#include "../../views/injector.hpp"

namespace Crails::Cms
{
  template<typename USER, typename SUPER>
  class InjectableParamOptionsController : public AdminController<USER, SUPER>
  {
    typedef AdminController<USER, SUPER> Super;
  public:
    InjectableParamOptionsController(Crails::Context& context) : Super(context)
    {
    }

    void index()
    {
      std::string name   = Super::params["name"] .template defaults_to<std::string>("");
      std::string param  = Super::params["param"].template defaults_to<std::string>("");
      std::string search = Super::params["q"]    .template defaults_to<std::string>("");

      if (name.length() > 0 && param.length() > 0)
      {
        for (Data value : Super::params["vars"])
          Super::vars[value.get_key()] = value.as<std::string>();
        Super::render(Super::JSON, Injector::find_options_as_json(name, param, Super::database, Super::vars, search));
      }
      else
        Super::respond_with(Crails::HttpStatus::bad_request);
    }
  };
}
