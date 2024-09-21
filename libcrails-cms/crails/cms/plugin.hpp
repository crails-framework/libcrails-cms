#ifndef  CRAILS_CMS_PLUGIN_HPP
# define CRAILS_CMS_PLUGIN_HPP

# include <filesystem>
# include <mutex>
# include <string_view>
# include <crails/utils/backtrace.hpp>
# include "sitemap.hpp"

class dylib;

namespace Crails::Cms
{
  class Plugin
  {
  public:
    struct invalid_plugin : public boost_ext::runtime_error
    {
      invalid_plugin() : boost_ext::runtime_error("could not load Crails::Cms::Plugin") {}
    };

    struct cannot_install : public boost_ext::runtime_error
    {
      cannot_install(const std::string& reason) : boost_ext::runtime_error(reason) {}
    };

    Plugin(const std::filesystem::path&);
    ~Plugin();

    std::string name() const { return filepath.stem(); }
    std::string description() const;
    std::string base64_logo() const;
    std::unique_ptr<SiteMap::Index> sitemap_index() const;
    void install();
    void uninstall();
    void initialize();

    std::string_view javascript() const;
    std::string_view stylesheet() const;
    std::string_view admin_javascript() const;
    std::string_view admin_stylesheet() const;

  private:
    void load();
    void unload();

    const std::filesystem::path filepath;
    const dylib* library = nullptr;
    std::mutex mutex_;
  };
}

#endif
