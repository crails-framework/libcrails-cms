#pragma once
#include <crails/odb/model.hpp>
#include <crails/datatree.hpp>

namespace Crails::Cms
{
  #pragma db object abstract
  class Menu : public Crails::Odb::Model
  {
    friend class odb::access;
  public:
    static const std::string scope;
    static const std::string plural_scope;
    static const std::string view;

    enum Direction { Horizontal, Vertical };

    template<typename QUERY>
    static QUERY default_order_by(QUERY query) { return query; }

    virtual void edit(Data);
    virtual void merge_data(Data) const;
    std::string to_json() const;

    const std::string& get_name() const { return name; }
    void set_name(const std::string& value) { name = value; }

    // Items of the menu for the current locale (see get_data(locale) for the fallback rules)
    Data get_data() const;
    // Items of the menu for the given locale. Falls back to the default locale, then to any
    // locale that has items. Menus saved before translations were enabled are returned as is.
    Data get_data(const std::string& locale) const;
    void set_data(const DataTree& value) { data = value; }
    // JSON array of the items for the current locale
    std::string get_data_as_json() const;
    // JSON object of the items of every locale, without fallback: {"en": [...], "fr": [...]}
    std::string get_translations_as_json() const;
    // False for menus saved as a plain list of items (no translations, or saved before they were enabled)
    bool is_translated() const;

  private:
    std::string name;
    #pragma db type("TEXT")
    DataTree data;
  };
}
