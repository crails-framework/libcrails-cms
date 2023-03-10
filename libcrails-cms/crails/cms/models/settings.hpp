#pragma once
#include <crails/odb/model.hpp>
#include <crails/datatree.hpp>

namespace Crails::Cms
{
  class Layout;

  #pragma db object abstract
  class Settings : public Crails::Odb::Model
  {
  public:
    static const std::string scope;
    static const std::string plural_scope;
    static const std::string view;

    virtual void edit(Data);
    virtual void merge_data(Data) const;
    std::string to_json() const;

    const std::string& get_title() const { return title; }
    void set_title(const std::string& value) { title = value; }

    const std::string& get_public_url() const { return public_url; }
    void set_public_url(const std::string& value) { public_url = value; }

    const std::string& get_default_locale() const { return default_locale; }
    void set_default_locale(const std::string& value) { default_locale = value; }

    Crails::Odb::id_type get_homepage_id() const { return homepage_id; }
    void set_homepage_id(Crails::Odb::id_type value) { homepage_id = value; }

    const std::string& get_favicon() const { return favicon; }
    void set_favicon(const std::string& value) { favicon = value; }

    const std::string& get_theme() const { return theme; }
    void set_theme(const std::string& value) { theme = value; }

    const Layout& get_layout() const;

    const std::string& get_footer() const { return footer; }
    void set_footer(const std::string& value) { footer = value; }

  private:
    std::string title;
    std::string default_locale;
    std::string public_url;
    std::string favicon;
    #pragma db value_type("VARCHAR(32)")
    std::string theme;
    std::string footer;
    Crails::Odb::id_type homepage_id;
  };
}
