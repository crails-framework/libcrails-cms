#include "layout.hpp"
#include "../plugins.hpp"
#include "../dylib.hpp"
#include <filesystem>
#include <list>
#include <crails/logger.hpp>
#include <crails/renderer.hpp>
#include <crails/i18n.hpp>
#include <iostream>
using namespace Crails::Cms;
using namespace std;

static list<filesystem::path> find_layout_libraries()
{
  list<filesystem::path> roots = find_plugin_paths();
  list<filesystem::path> libraries;

  for (const filesystem::path& root : roots)
    find_plugins_at(root / "layouts", libraries);
  return libraries;
}

static bool load_layout_plugin(dylib* plugin, vector<const Layout*>& layouts)
{
  static constexpr const char* layout_list_getter = "create_layouts";
  static constexpr const char* layout_unit_getter = "create_layout";
  typedef vector<Layout*> (LayoutListGetter)(void);
  typedef Layout*         (LayoutUnitGetter)(void);

  if (plugin->has_symbol(layout_list_getter))
  {
    LayoutListGetter* getter =
      plugin->get_function<LayoutListGetter>(layout_list_getter);
    for (Layout* layout : (*getter)())
      layouts.push_back(layout);
  }
  else if (plugin->has_symbol(layout_unit_getter))
  {
    LayoutUnitGetter* getter =
      plugin->get_function<LayoutUnitGetter>(layout_unit_getter);
    layouts.push_back((*getter)());
  }
  else
    return false;
  return true;
}

Layouts::Layouts()
{
  for (const filesystem::path& path : find_layout_libraries())
  {
    auto* plugin = new dylib(path);
    string name = path.filename().replace_extension("").string();
    LayoutList list;

    if (load_layout_plugin(plugin, list))
    {
      logger << Logger::Info << "CMS Layout plugin loaded (" << path << ')' << Logger::endl;
      layouts.emplace(name, list);
      plugins.push_back(plugin);
    }
    else
      delete plugin;
  }
}

Layouts::~Layouts()
{
  for (auto it = layouts.begin() ; it != layouts.end() ; ++it)
  {
    for (const auto* layout : it->second)
      delete layout;
  }
  for (const auto* plugin : plugins)
    delete plugin;
}

const Layout& Layouts::default_layout() const
{
  for (auto it = layouts.begin() ; it != layouts.end() ; ++it)
  {
    if (it->second.size() != 0)
      return **(it->second.begin());
  }
  throw boost_ext::runtime_error("Crails::Cms::Layouts: no registered layouts.");
  return **(layouts.begin()->second.begin());
}

const Layout& Layouts::default_layout_for_theme(const std::string& theme) const
{
  auto it = layouts.find(theme);

  if (it != layouts.end())
    return **(it->second.begin());
  return default_layout();
}

const Layout* Layouts::find(const string& theme, const string& name) const
{
  auto group = layouts.find(theme);

  if (group != layouts.end())
  {
    for (const Layout* layout : group->second)
    {
      if (layout->get_name() == name)
        return layout;
    }
  }
  return nullptr;
}

const Layout& Layouts::require(const string& theme, const string& name) const
{
  const Layout* layout = find(theme, name);

  if (layout == nullptr)
    throw boost_ext::runtime_error("Crails::Cms::Layouts: layout `" + name + "` not found.");
  return *layout;
}

const vector<const Layout*>& Layouts::get_layouts(const string& theme) const
{
  auto it = layouts.find(theme);

  if (it == layouts.end())
    throw boost_ext::runtime_error("theme " + theme + " not found.");
  return it->second;
}

map<string,string> Layouts::get_layout_options(const string& theme) const
{
  map<string,string> result;

  for (const auto* layout : get_layouts(theme))
  {
    result.emplace(
      layout->get_name(),
      layout->get_name()
    );
  }
  return result;
}

map<string,string> Layouts::get_theme_options() const
{
  map<string,string> result;

  for (auto it = layouts.begin() ; it != layouts.end() ; ++it)
    result.emplace(it->first, i18n::t("themes." + it->first));
  return result;
}

void Layouts::load_renderers(Renderer& renderer) const
{
  static constexpr const char* symbol = "get_html_renderer";

  for (const dylib* plugin : plugins)
  {
    if (plugin->has_symbol(symbol))
    {
      Renderer* plugin_renderer = plugin->get_function<Renderer*()>(symbol)();

      renderer.merge(*plugin_renderer);
    }
  }
}

void Layouts::load_assets(function<void (Crails::RequestHandler*)> callback) const
{
  typedef Crails::BuiltinAssets* (AssetsGetter)(void);
  static constexpr const char* symbol = "get_assets";

  for (const dylib* plugin : plugins)
  {
    if (plugin->has_symbol(symbol))
    {
      AssetsGetter* library_getter = plugin->get_function<AssetsGetter>(symbol);
      const Crails::BuiltinAssets& library = *(*library_getter)();

      callback(new Crails::BuiltinAssetsHandler(library));
    }
  }
}

const Layout& Layout::get(const std::string& theme, const std::string& layout_name)
{
  const auto& layouts = Crails::Cms::Layouts::singleton::require();
  const auto* layout = layouts.find(theme, layout_name);

  if (layout)
    return *layout;
  return layouts.default_layout();
}
