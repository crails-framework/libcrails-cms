#ifndef  CRAILS_CMS_PLUGINS_HPP
# define CRAILS_CMS_PLUGINS_HPP

# include <list>
# include <filesystem>
# include <crails/utils/singleton.hpp>
# include "plugin.hpp"

namespace Crails::Cms
{
  std::list<std::filesystem::path> find_plugin_paths();
  void find_plugins_at(const std::filesystem::path&, std::list<std::filesystem::path>& output);

  class Plugins
  {
    SINGLETON(Plugins)
  protected:
    std::vector<Plugin*> list;
  public:
    Plugins();
    virtual ~Plugins();

    Plugin* get_plugin(const std::string&) const;
    std::vector<std::string> get_plugin_names() const;
    void initialize(const std::vector<std::string>&) const;
  };
}

#endif
