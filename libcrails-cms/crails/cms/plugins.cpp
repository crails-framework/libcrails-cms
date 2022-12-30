#include <crails/getenv.hpp>
#include "plugins.hpp"
#include "dylib.hpp"

using namespace Crails::Cms;
using namespace std;

namespace Crails::Cms
{
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
