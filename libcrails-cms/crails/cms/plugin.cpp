#include "plugin.hpp"
#include "models/settings.hpp"
#include "dylib.hpp"
#include <crails/odb/connection.hpp>

using namespace Crails::Cms;
using namespace std;

typedef void (PluginFunction)(void);

static void run_plugin_function(const dylib* library, const char* function_name)
{
  if (library && library->has_symbol(function_name))
  {
    PluginFunction* function;

    function = library->get_function<PluginFunction>(function_name);
    (*function)();
  }
}

Plugin::Plugin(const filesystem::path& path) : filepath(path)
{
}

Plugin::~Plugin()
{
  const std::lock_guard<std::mutex> lock(mutex_);
  unload();
}

void Plugin::load()
{
  if (!library)
  {
    library = new dylib(filepath);
    if (!library)
      throw invalid_plugin();
  }
}

void Plugin::unload()
{
  if (library)
    delete library;
  library = nullptr;
}

void Plugin::initialize()
{
  const std::lock_guard<std::mutex> lock(mutex_);

  load();
  run_plugin_function(library, "initialize");
}

void Plugin::install()
{
  const std::lock_guard<std::mutex> lock(mutex_);

  load();
  run_plugin_function(library, "install");
}

void Plugin::uninstall()
{
  const std::lock_guard<std::mutex> lock(mutex_);

  load();
  run_plugin_function(library, "uninstall");
}
