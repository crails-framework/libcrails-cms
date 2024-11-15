#pragma once
#include "sluggable.hpp"
#include "permission_target.hpp"
#include "../opengraph.hpp"

namespace odb { class access; }

namespace Crails::Cms
{
  #pragma db object abstract
  class Editable : public Sluggable, public PermissionTarget
  {
    friend class odb::access;
  public:
    static constexpr unsigned short description_length = 255;

    virtual void edit(Data);
    virtual void merge_data(Data) const;

    void set_body(const std::string& value) { this->body = value; }
    const i18n::String& get_body() const { return body; }
    void set_description(const std::string& value) { this->description = value; }
    const i18n::String& get_description() const { return description; }
    void set_thumbnail_url(const std::string& value) { thumbnail = value; }
    const std::string& get_thumbnail_url() const { return thumbnail; }
    bool get_preview() const { return preview; }
    void set_preview(bool value) { preview = value; }
    std::vector<std::string> get_available_locales() const;

private:
    #pragma db type("TEXT")
    i18n::String body;
    #pragma db type("TEXT")
    i18n::String description;
    std::string thumbnail;
    #pragma db transient
    bool preview = false;
  };
}
