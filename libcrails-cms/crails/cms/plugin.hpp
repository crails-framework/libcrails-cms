#ifndef  CRAILS_CMS_PLUGIN_HPP
# define CRAILS_CMS_PLUGIN_HPP

# include <filesystem>
# include <mutex>
# include <crails/utils/backtrace.hpp>

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
    void install();
    void uninstall();
    void initialize();

    std::string javascript() const;
    std::string stylesheet() const;
    std::string admin_javascript() const;
    std::string admin_stylesheet() const;

  private:
    void load();
    void unload();

    const std::filesystem::path filepath;
    const dylib* library = nullptr;
    std::mutex mutex_;
  };
}

#endif
