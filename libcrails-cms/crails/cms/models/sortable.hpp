#pragma once
#if !defined(ODB_COMPILER)
# include <crails/odb/connection.hpp>
#endif

namespace Crails::Cms
{
#if !defined(ODB_COMPILER)
  template<typename MODEL>
  void before_sortable_save(MODEL& model, odb::query<MODEL> criteria = odb::query<MODEL>(true))
  {
    if (!model.is_persistent())
    {
      Crails::Odb::ConnectionHandle database;

      model.set_order(database.template count<MODEL>(criteria));
    }
  }
#endif

  #pragma db object abstract
  class Sortable
  {
    friend class odb::access;
  public:
    unsigned int get_order() const { return order; }
    void set_order(unsigned int value) { order = value; }

  protected:
    unsigned int order;
  };
}
