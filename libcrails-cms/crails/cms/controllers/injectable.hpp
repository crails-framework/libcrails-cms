#pragma once
#include <crails/renderer.hpp>
#include <crails/any_cast.hpp>
#include <crails/odb/connection.hpp>

namespace Crails::Cms
{
  class Injector;
  class Injectable
  {
    friend class Crails::Cms::Injector;
  protected:
    bool                          injecting = false;
    Crails::SharedVars            vars;
    Crails::RenderTarget&         sink;
    const Crails::Renderer*       renderer;
    Crails::Odb::ConnectionHandle database;
    std::string                   formats = "text/html";
  public:
    Injectable(const Crails::SharedVars& vars, Crails::RenderTarget& sink);

    virtual void run() = 0;
    void render(const std::string_view view, Crails::SharedVars local_vars = {});
    void render_text(const std::string_view text);
    void set_accepted_formats(const std::string& value) { formats = value; }
  };

  struct InjectableTraits
  {
    typedef std::function<
      std::unique_ptr<Injectable>(const Crails::SharedVars&, Crails::RenderTarget&)
    > Instantiator;

    const std::string_view              name;
    const std::vector<std::string_view> param_names;
    const Instantiator                  create; 

    bool operator==(const std::string_view value) const { return name == value; }
  };
}
