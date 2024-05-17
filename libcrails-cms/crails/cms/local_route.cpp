#include "local_route.hpp"
#include <crails/utils/split.hpp>
#include <crails/utils/join.hpp>

namespace Crails::Cms
{
  LocalRoute::LocalRoute(const Crails::SharedVars& vars, const std::string& varname)
  {
    route = Crails::cast<std::string>(vars, varname);
    initialize(route);
  }

  LocalRoute LocalRoute::parent(unsigned short depth) const
  {
    auto parts = split(route, '/');

    if (depth < parts.size())
    {
      auto last = parts.begin();

      std::advance(last, parts.size() - depth);
      return LocalRoute(join(parts.begin(), last, '/'));
    }
    return LocalRoute("");
  }
   
  void LocalRoute::initialize(const std::string& route)
  {
    this->route = (route[0] != '/') ? ('/' + route) : route;
  }

  template<>
  std::string LocalRoute::fragment<std::string>(std::string arg) const { return arg; }
  template<>
  std::string LocalRoute::fragment<const std::string&>(const std::string& arg) const { return arg; }
  template<>
  std::string LocalRoute::fragment<const char*>(const char* arg) const { return arg; }
}
