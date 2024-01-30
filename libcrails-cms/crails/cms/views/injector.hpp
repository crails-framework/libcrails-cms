#pragma once

#include <string_view>
#include <functional>
#include <crails/shared_vars.hpp>
#include <crails/utils/singleton.hpp>

namespace Crails
{
  namespace Cms
  {
    class Injectable
    {
    public:                           
      typedef std::function<std::string (const Crails::SharedVars&)> Callback;

      Injectable(const std::string_view name, Callback callback, const std::vector<std::string_view>& param_names = {}) : name(name), callback(callback), param_names(param_names)
      {
      }

      const std::string_view get_name() const { return name; }
      bool operator==(const std::string_view value) const { return matches(value); }
      bool matches(const std::string_view value) const { return name == value; }
      const std::vector<std::string_view>& get_param_names() const { return param_names; }
      
      std::string run(const Crails::SharedVars& vars) const
      {
        return callback(vars);
      }

    private:
      std::string_view name;
      Callback callback;
      std::vector<std::string_view> param_names;
    };

    class Injector
    {
      SINGLETON(Injector)
    public:
      Injector() {}
      Injector(const std::vector<Injectable>& injectables) : injectables(injectables) {}

      std::string inject(std::string content, Crails::SharedVars) const;
      std::vector<std::string_view> params_for(const std::string_view) const;
      void add_injectable(Injectable);

      static std::string run(std::string content, const Crails::SharedVars&);
      static void register_injectable(Injectable);
      static void register_injectable(const std::string_view name, Injectable::Callback callback) { register_injectable(Injectable(name, callback)); }
      static std::vector<std::string_view> available_injectors();
      static std::vector<std::string_view> find_params_for(const std::string_view);

    private:
      std::string generate_injection(const std::string_view name, const Crails::SharedVars&) const;

      std::vector<Injectable> injectables;
    };
  }
}
