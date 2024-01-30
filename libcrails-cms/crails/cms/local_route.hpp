#pragma once
#include <crails/shared_vars.hpp>

namespace Crails::Cms
{
  class LocalRoute
  {
    std::string route;
  public:
    LocalRoute(const Crails::SharedVars& vars, const std::string& varname = "local_route");
    LocalRoute(const std::string& route) { initialize(route); }

    std::string operator()() const { return route; }

    template<typename... Args>
    std::string make(Args... args) const { return route + '/' + fragment(args...); }

  private:
    void initialize(const std::string& route);

    template<typename ARG>
    std::string fragment(ARG arg) const { return std::to_string(arg); }

    template<typename ARG, typename... Args>
    std::string fragment(ARG arg, Args... args) const
    {
      return fragment(arg) + '/' + fragment(args...);
    }
  };

  template<>
  std::string LocalRoute::fragment<std::string>(std::string) const;
  template<>
  std::string LocalRoute::fragment<const std::string&>(const std::string&) const;
  template<>
  std::string LocalRoute::fragment<const char*>(const char*) const;
}
