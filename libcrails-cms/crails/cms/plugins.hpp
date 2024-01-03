#ifndef  CRAILS_CMS_PLUGINS_HPP
# define CRAILS_CMS_PLUGINS_HPP

# include <list>
# include <filesystem>
# include <crails/utils/singleton.hpp>
# include <crails/request_handlers/builtin_assets.hpp>
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
    std::string javascript, admin_javascript;
    std::string stylesheet, admin_stylesheet;
    BuiltinAssets assets;
  public:
    static const char* application_js_uri;
    static const char* application_css_uri;
    static const char* admin_js_uri;
    static const char* admin_css_uri;

    Plugins();
    virtual ~Plugins();

    const BuiltinAssets get_assets() const { return assets; }
    Plugin* get_plugin(const std::string&) const;
    std::vector<std::string> get_plugin_names() const;
    void initialize(const std::vector<std::string>&);
  };
}

#endif
