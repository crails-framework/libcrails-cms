#pragma once

#include <string_view>
#include <functional>
#include <crails/shared_vars.hpp>
#include <crails/utils/singleton.hpp>
#include "../controllers/injectable.hpp"

namespace Crails
{
  namespace Cms
  {
    class Injector
    {
      SINGLETON(Injector)
    public:
      Injector() {}
      Injector(const std::vector<InjectableTraits>& injectables) : injectables(injectables) {}

      std::string inject(const std::string_view content, Crails::SharedVars) const;
      std::vector<std::string_view> params_for(const std::string_view) const;
      void add_injectable(InjectableTraits);

      static std::string run(const std::string_view content, const Crails::SharedVars&);
      static std::vector<std::string_view> available_injectors();
      static std::vector<std::string_view> find_params_for(const std::string_view);
      static void register_injectable(InjectableTraits);

      template<typename INJECTABLE>
      static void register_injectable(const std::string_view name, const std::vector<std::string_view>& param_names = {})
      {
        register_injectable(InjectableTraits{
          name,
          param_names,
          [](const Crails::SharedVars& vars, Crails::RenderTarget& sink) -> std::unique_ptr<Injectable>
          {
            return std::make_unique<INJECTABLE>(vars, sink);
          }
        });
      }

    private:
      std::unique_ptr<Injectable> generate_injectable(const std::string_view name, const Crails::SharedVars&, Crails::RenderTarget&) const;

      std::vector<InjectableTraits> injectables;
    };
  }
}
