#pragma once

#include <string_view>
#include <functional>
#include <crails/shared_vars.hpp>
#include <crails/utils/singleton.hpp>
#include <crails/render_target.hpp>
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
      virtual ~Injector() {}

      void render(const std::string_view name, Crails::Odb::Connection&, const Crails::SharedVars&, Crails::RenderTarget&) const;
      std::string inject(const std::string_view content, Crails::Odb::Connection&, Crails::SharedVars) const;

      // Static description of an injectable's parameters (name/type/optional/dynamic).
      std::vector<InjectableParamTraits> params_for(const std::string_view name) const;
      // Resolves the value/label options for a `Selection` parameter, against
      // the current SharedVars and a free-text search string.
      std::vector<InjectableParamOption> options_for(const std::string_view name, const std::string_view param, const Crails::SharedVars&, const std::string_view search) const;

      std::string params_as_json(const std::string_view name) const;
      void add_injectable(InjectableTraits);

      static void render_injectable(const std::string_view name, Crails::Odb::Connection&, const Crails::SharedVars&, Crails::RenderTarget&);
      static std::string run(const std::string_view content, Crails::Odb::Connection&, const Crails::SharedVars&);
      static std::vector<std::string_view> available_injectors();
      static std::vector<InjectableParamTraits> find_params_for(const std::string_view name);
      static std::vector<InjectableParamOption> find_options_for(const std::string_view name, const std::string_view param, const Crails::SharedVars&, const std::string_view search);
      static std::string find_params_as_json(const std::string_view name);
      static std::string find_options_as_json(const std::string_view name, const std::string_view param, const Crails::SharedVars&, const std::string_view search);
      static void register_injectable(InjectableTraits);

      template<typename INJECTABLE>
      static void register_injectable(const std::string_view name, const std::vector<InjectableParamTraits>& params = {})
      {
        register_injectable(InjectableTraits{
          name,
          params,
          [](Crails::Odb::Connection& database, const Crails::SharedVars& vars, Crails::RenderTarget& sink) -> std::unique_ptr<Injectable>
          {
            return std::make_unique<INJECTABLE>(database, vars, sink);
          }
        });
      }

    private:
      std::unique_ptr<Injectable> generate_injectable(const std::string_view name, Crails::Odb::Connection&, const Crails::SharedVars&, Crails::RenderTarget&) const;

      std::vector<InjectableTraits> injectables;
    };

    std::string params_to_json(const std::vector<InjectableParamTraits>&);
    std::string options_to_json(const std::vector<InjectableParamOption>&);
  }
}
