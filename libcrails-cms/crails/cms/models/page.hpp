#pragma once
#include "editable.hpp"

namespace Crails::Cms
{
  class Layout;

  #pragma db object abstract
  class Page : public Editable
  {
  public:
    static const std::string scope;
    static const std::string plural_scope;
    static const std::string view;

    template<typename QUERY>
    static QUERY default_order_by(QUERY query) { return query + "ORDER BY" + QUERY::title; }

    virtual void edit(Data) override;
    virtual void merge_data(Data) const override;

    void set_layout_name(const std::string& name) { layout_name = name; }
    const std::string& get_layout_name() const;

    void set_layout(const Layout&);
    const Layout& get_layout(const std::string& theme) const;

    bool get_has_footer() const { return has_footer; }
    void set_has_footer(bool value) { has_footer = value; }

private:
    std::string layout_name;
    bool has_footer = false;
  };
}
