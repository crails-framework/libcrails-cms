#pragma once
#include <crails/utils/singleton.hpp>
#include <crails/request_handlers/builtin_assets.hpp>
#include <map>
#include "../models/layout.hpp"

class dylib;
namespace Crails { class Renderer; }

namespace Crails::Cms
{
  enum LayoutType
  {
    ComponentLayoutType,
    DocumentLayoutType
  };

  class Style;

  class Layout
  {
  public:
    virtual ~Layout() {}

    const std::string& get_name() const { return name; }
    LayoutType         get_type() const { return type; }
    const std::vector<std::string> get_stylesheets() const { return stylesheets; }
    const std::vector<std::string> get_javascripts() const { return javascripts; }
    const std::vector<std::string> get_editor_stylesheets() const { return editor_stylesheets; }
    const std::vector<std::string> get_editor_javascripts() const { return editor_javascripts; }
    const std::string get_component_layout_name() const { return component_layout_name; }
    const LayoutVariables& get_variables() const { return variables; }

    virtual std::string get_layout_path() const
    {
      if (type != DocumentLayoutType)
        return "layouts/themes/" + name;
      return std::string();
    }

    virtual void use_admin_style() const { throw std::runtime_error("no admin style for layout " + name); }
    virtual const Style& get_style() const { throw std::runtime_error("no style defined for layout " + name); }

    static const Layout& get(const std::string& name);

  protected:
    std::string              name;
    LayoutType               type = DocumentLayoutType;
    LayoutVariables          variables;
    std::string              component_layout_name;
    std::vector<std::string> stylesheets, editor_stylesheets;
    std::vector<std::string> javascripts, editor_javascripts;
  };

  class Layouts
  {
    SINGLETON(Layouts)
  protected:
    Layouts();
    ~Layouts();
  public:
    void load_renderers(Crails::Renderer&) const;
    void load_assets(std::function<void(Crails::RequestHandler*)>) const;
    void use_admin_style(const std::string& name) const;

    virtual const Layout& default_layout() const;
    const Layout* find(const std::string& name) const;
    const Layout& require(const std::string& name) const;
    const std::vector<const Layout*>& get_layouts() const { return layouts; }
    std::map<std::string, std::string> get_layout_options() const;
    std::map<std::string, std::string> get_theme_options() const;

  protected:
    std::vector<const Layout*> layouts;
    std::list<const dylib*> plugins;
  };
}
