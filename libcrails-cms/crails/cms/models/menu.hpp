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

    Data get_data() const { return data.as_data(); }
    void set_data(const DataTree& value) { data = value; }
    std::string get_data_as_json() const;

  private:
    std::string name;
    #pragma db type("TEXT")
    DataTree data;
  };
}
