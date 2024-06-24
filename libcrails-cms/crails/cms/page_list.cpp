#include "page_list.hpp"
#include "plugins.hpp"

using namespace std;
using namespace Crails::Cms;

typedef PageList::PathMap (Crails::Cms::Plugin::*PluginUrlListGetter)() const;

static PageList::PathMap plugins_url_list_getter(PluginUrlListGetter method)
{
  const Plugins* plugins = Crails::Cms::Plugins::singleton::get();
  map<string,string> list;

  if (plugins)
  {
    for (const string& plugin_name : plugins->get_plugin_names())
    {
      const Plugin* plugin = plugins->get_plugin(plugin_name);

      list.merge((plugin->*method)());
    }
  }
  return {};
}

PageList::PathMap PageList::list() const
{
  return plugins_url_list_getter(&Plugin::pages);
}

PageList::PathMap PageList::feeds() const
{
  return plugins_url_list_getter(&Plugin::feeds);
}
