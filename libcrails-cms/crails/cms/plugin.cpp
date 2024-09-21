#include "plugin.hpp"
#include "models/settings.hpp"
#include "dylib.hpp"
#include <crails/odb/connection.hpp>
#include <crails/read_file.hpp>
#include <crails/utils/base64.hpp>
#include <crails/i18n.hpp>
#include <crails/datatree.hpp>

using namespace Crails::Cms;
using namespace std;

typedef void                       (PluginFunction)(void);
typedef string_view                (PluginAssetGetter)(void);
typedef unique_ptr<SiteMap::Index> (PluginSitemapGetter)(void);

static void run_plugin_function(const dylib* library, const char* function_name)
{
  if (library && library->has_symbol(function_name))
  {
    PluginFunction* function;

    function = library->get_function<PluginFunction>(function_name);
    (*function)();
  }
}

static std::string_view get_plugin_asset(const dylib* library, const char* function_name)
{
  if (library && library->has_symbol(function_name))
  {
    PluginAssetGetter* function;

    function = library->get_function<PluginAssetGetter>(function_name);
    return (*function)();
  }
  return std::string_view();
}

Plugin::Plugin(const filesystem::path& path) : filepath(path)
{
}

Plugin::~Plugin()
{
  const std::lock_guard<std::mutex> lock(mutex_);
  unload();
}

string Plugin::description() const
{
  DataTree data;

  try
  {
    string filename = name() + ".description.json";
    filesystem::path description_path = filepath.parent_path() / filename;
    string locale_name = i18n::locale_name();

    if (filesystem::exists(description_path))
    {
      data.from_json_file(description_path.string());
      if (locale_name.length())
        return data[locale_name].defaults_to<string>("");
      else if (data.as_data().count())
        return (*data.begin()).defaults_to<string>("");
    }
  }
  catch (...)
  {
    return "/!\\ broken plugin description";
  }
  return string();
}

string Plugin::base64_logo() const
{
  string filename = name() + ".description.png";
  filesystem::path description_path = filepath.parent_path() / filename;
  string result;

  if (Crails::read_file(description_path, result))
    return "data:image/png;base64," + Crails::base64_encode(result);
  return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
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
  const lock_guard<std::mutex> lock(mutex_);

  load();
  run_plugin_function(library, "initialize");
}

void Plugin::install()
{
  const lock_guard<std::mutex> lock(mutex_);

  load();
  run_plugin_function(library, "install");
}

void Plugin::uninstall()
{
  const lock_guard<std::mutex> lock(mutex_);

  load();
  run_plugin_function(library, "uninstall");
}

string_view Plugin::javascript() const
{
  return get_plugin_asset(library, "plugin_javascript");
}

string_view Plugin::stylesheet() const
{
  return get_plugin_asset(library, "plugin_stylesheet");
}

string_view Plugin::admin_javascript() const
{
  return get_plugin_asset(library, "plugin_admin_javascript");
}

string_view Plugin::admin_stylesheet() const
{
  return get_plugin_asset(library, "plugin_admin_stylesheet");
}

unique_ptr<SiteMap::Index> Plugin::sitemap_index() const
{
  const char* function_name = "plugin_sitemap_index";

  if (library && library->has_symbol(function_name))
  {
    PluginSitemapGetter* function;

    function = library->get_function<PluginSitemapGetter>(function_name);
    return std::move((*function)());
  }
  return nullptr;
}
