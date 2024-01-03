#include <crails/getenv.hpp>
#include <crails/logger.hpp>
#include "plugins.hpp"
#include "plugin.hpp"
#include "dylib.hpp"
#include <iostream>

using namespace Crails::Cms;
using namespace std;

namespace Crails::Cms
{
  Plugins::Plugins()
  {
    std::list<filesystem::path> roots = find_plugin_paths();
    std::list<filesystem::path> libraries;

    for (const filesystem::path& root : roots)
      find_plugins_at(root, libraries);
    for (const filesystem::path& library_path : libraries)
    {
      auto plugin = new Plugin(library_path);
      list.push_back(move(plugin));
    }
  }

  Plugins::~Plugins()
  {
    for (Plugin* plugin : list)
      delete plugin;
  }

  Plugin* Plugins::get_plugin(const string& name) const
  {
    std::cout << "Plugins::get_plugin(" << name << ')' << std::endl;
    for (Plugin* plugin : list)
    {
      std::cout << " -> matching with " << plugin << std::endl;
      std::cout << " -> with name " << plugin->name() << std::endl;
      if (plugin->name() == name)
        return plugin;
    }
    return nullptr;
  }

  vector<string> Plugins::get_plugin_names() const
  {
    vector<string> names;

    for (const Plugin* plugin : list)
      names.push_back(plugin->name());
    return names;
  }

  void Plugins::initialize(const std::vector<std::string>& names) const
  {
    for (const std::string& name : names)
    {
      Plugin* plugin = get_plugin(name);

      if (plugin)
      {
        try
        {
          plugin->initialize();
        }
        catch (const std::exception& err)
        {
          Crails::logger << Crails::Logger::Error << "Crails::Cms::Plugins: failed to initialize plugin " << name << ": " << err.what() << Crails::Logger::endl;
        }
      }
      else
        Crails::logger << Crails::Logger::Error << "Crails::Cms::Plugins: missing plugin " << name << Crails::Logger::endl;
    }
  }

  void find_plugins_at(const filesystem::path& path, list<filesystem::path>& list)
  {
    string_view suffix(dylib::filename_components::suffix);

    if (!filesystem::is_directory(path)) return ;
    for (const auto& entry : filesystem::directory_iterator(path))
    {
      if (filesystem::is_regular_file(entry.path()))
      {
        const auto filepath = entry.path().string();
        const char* extension = &filepath[filepath.length() - suffix.length()];

        if (suffix == extension)
          list.push_back(filepath);
      }
    }
  }

  list<filesystem::path> find_plugin_paths()
  {
    list<filesystem::path> roots;
    string custom_path = Crails::getenv("CRAILS_CMS_PLUGIN_PATH");

    roots.push_back(".");
    if (custom_path.length())
      roots.push_back(custom_path);
#if !(defined(_WIN32) || defined(_WIN64))
    roots.push_back("/usr/lib/libcrails-cms");
    roots.push_back("/usr/local/lib/libcrails-cms");
#endif
    return roots;
  }

}
