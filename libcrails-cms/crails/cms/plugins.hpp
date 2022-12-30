#ifndef  CRAILS_CMS_PLUGINS_HPP
# define CRAILS_CMS_PLUGINS_HPP

# include <list>
# include <filesystem>

namespace Crails::Cms
{
  std::list<std::filesystem::path> find_plugin_paths();
  void find_plugins_at(const std::filesystem::path&, std::list<std::filesystem::path>& output);
}

#endif
