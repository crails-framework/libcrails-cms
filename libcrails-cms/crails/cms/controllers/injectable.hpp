#pragma once
#include <crails/renderer.hpp>
#include <crails/any_cast.hpp>
#include <crails/odb/connection.hpp>
#include <functional>
#include <string>
#include <string_view>
#include <vector>

namespace Crails::Cms
{
  class Injector;

  // The kind of value an injector parameter expects. This drives both the
  // widget the PageEditor's PropertyEditor renders for it, and how the value
  // gets validated/consumed on the injector's side.
  //
  // `Choice` and `Selection` both boil down to "pick one value/label pair
  // from a list", but they differ in where that list comes from:
  //  - `Choice` is a small, fixed set known at registration time (e.g. which
  //    template to render). Its options ship inline with the rest of the
  //    param description, and the client renders a plain <select>.
  //  - `Selection` is resolved at request-time against the database (e.g.
  //    picking a specific Model instance). Its options are fetched
  //    asynchronously, searchable, and rendered through a picker dialog.
  enum class InjectableParamType
  {
    String,
    Number,
    Boolean,
    Color,
    Url,
    Picture,
    Video,
    Audio,
    Gallery,
    Choice,
    Selection
  };

  struct InjectableParamOption
  {
    std::string value;
    std::string label;
  };

  struct InjectableParamTraits
  {
    // Called with the current SharedVars (so a selection can be scoped by
    // sibling parameters already set on the injector) and a free-text search
    // string typed by the admin user. Only meaningful when type == Selection.
    typedef std::function<
      std::vector<InjectableParamOption>(const Crails::SharedVars&, const std::string_view /* search */)
    > OptionLister;

    std::string_view                   name;
    InjectableParamType                type = InjectableParamType::String;
    bool                               optional = true;
    std::vector<InjectableParamOption> options;      // type == Choice
    OptionLister                       list_options; // type == Selection

    bool operator==(const std::string_view value) const { return name == value; }
  };

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
    Injectable(Crails::Odb::Connection&, const Crails::SharedVars& vars, Crails::RenderTarget& sink);
    virtual ~Injectable() {}

    virtual void run() = 0;
    void render(const std::string_view view, Crails::SharedVars local_vars = {});
    void render_text(const std::string_view text);
    void set_accepted_formats(const std::string& value) { formats = value; }
  };

  struct InjectableTraits
  {
    typedef std::function<
      std::unique_ptr<Injectable>(Crails::Odb::Connection&, const Crails::SharedVars&, Crails::RenderTarget&)
    > Instantiator;

    const std::string_view                   name;
    const std::vector<InjectableParamTraits> params;
    const Instantiator                       create;

    bool operator==(const std::string_view value) const { return name == value; }
  };
}
