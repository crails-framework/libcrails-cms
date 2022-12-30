#pragma once
#include <crails/utils/singleton.hpp>
#include <crails/datatree.hpp>

namespace Crails { class HtmlTemplate; }

namespace Crails::Cms
{
  class AdminMenu 
  {
    SINGLETON(AdminMenu)
  public:
    struct Entry
    {
      unsigned char priority;
      std::string   label;
      std::string   url;
      std::string   classes;
    };

    typedef std::vector<Entry> Entries;

    AdminMenu();

    void add_default_entries(const std::string& scope = "/admin");
    void add(const Entry& entry);
    void add(const Entries& entries);

    const Entries& get_entries() const { return entries; }

    std::string render(Crails::HtmlTemplate*, Data params) const;

  protected:
    Entries entries;
  };
}
