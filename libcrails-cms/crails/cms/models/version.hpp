#pragma once
#include <crails/odb/model.hpp>
#include <crails/datatree.hpp>
#include <ctime>
#include "version_summary.hpp"

namespace odb { class access; }

namespace Crails::Cms
{
  /*
   * A snapshot of a versioned resource, as produced by Editable::merge_data.
   * Applications declare one concrete class per versioned resource:
   *
   *   #pragma db object table("page_versions")
   *   #pragma db index("page_versions_number") unique members(resource_id, number)
   *   class PageVersion : public Crails::Cms::Version {};
   */
  #pragma db object abstract
  class Version : public Crails::Odb::Model
  {
    friend class odb::access;
  public:
    static constexpr unsigned short author_name_length = 128;

    template<typename QUERY>
    static QUERY default_order_by(QUERY query) { return query + "ORDER BY" + QUERY::number + "DESC"; }

    Crails::Odb::id_type get_resource_id() const { return resource_id; }
    void set_resource_id(Crails::Odb::id_type value) { resource_id = value; }

    unsigned int get_number() const { return number; }
    void set_number(unsigned int value) { number = value; }

    std::time_t get_recorded_at() const { return recorded_at; }
    void set_recorded_at(std::time_t value) { recorded_at = value; }

    Crails::Odb::id_type get_author_id() const { return author_id; }
    void set_author_id(Crails::Odb::id_type value) { author_id = value; }

    const std::string& get_author_name() const { return author_name; }
    void set_author_name(const std::string& value) { author_name = value; }

    Data get_data() const { return data.as_data(); }
    void set_data(const DataTree& value) { data = value; }

    VersionSummary summarize() const;

  private:
    Crails::Odb::id_type resource_id = ODB_NULL_ID;
    unsigned int number = 0;
    std::time_t recorded_at = 0;
    Crails::Odb::id_type author_id = ODB_NULL_ID;
    #pragma db value_type("VARCHAR(128)")
    std::string author_name;
    #pragma db type("TEXT")
    DataTree data;
  };
}
