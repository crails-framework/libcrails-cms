#pragma once
#include "tag_list.hpp"
#include <map>
#ifndef ODB_COMPILER
# include <crails/odb/connection.hpp>
#endif

namespace Crails::Cms
{
  #pragma db object abstract
  class Taggable
  {
    friend class odb::access;
  public:
    void set_tags(const std::vector<std::string>& value);
    std::vector<std::string> get_tags() const { return TagList(tag_list).to_vector(); }

    template<typename TAGGABLE>
    std::map<std::string,std::string> collect_tags(bool with_empty_option = false) const
    {
      std::map<std::string,std::string> options;
#ifndef ODB_COMPILER
      odb::result<TAGGABLE>             tags;
      Crails::Odb::Connection           database;

      database.rollback_on_destruction = false;
      database.template find<TAGGABLE>(tags);
      if (with_empty_option)
        options.emplace("", "");
      for (const auto& tag : tags)
        options.emplace(tag.value, tag.value);
      for (const auto& tag : get_tags())
        options.emplace(tag, tag);
#endif
      return options;
    }

  protected:
    std::string tag_list;
  };
}
