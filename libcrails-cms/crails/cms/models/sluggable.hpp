#pragma once
#include <crails/i18n_string.hpp>
#include <crails/odb/model.hpp>
#include <crails/datatree.hpp>

namespace odb { class access; }

namespace Crails::Cms
{
  #pragma db object abstract
  class Sluggable : public Crails::Odb::Model
  {
    friend class odb::access;
  public:
    static constexpr unsigned short title_length = 128;
    static constexpr unsigned short slug_length = 64;

    virtual void edit(Data);
    virtual void merge_data(Data) const;
    std::string to_json() const;

    void set_title(const std::string& value) { title = value; }
    const i18n::String& get_title() const { return title; }
    void set_slug(const std::string& value) { slug = value; }
    const std::string& get_slug() const { return slug; }
    
    virtual std::string slug_from_title(const std::string& title) const;
    virtual std::string slug_from_title(const i18n::String& title) const;

  private:
    #pragma db type("TEXT")
    i18n::String title;
    #pragma db value_type("VARCHAR(64)")
    std::string slug;
  };
}
