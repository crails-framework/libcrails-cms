#pragma once
#include <crails/odb/model.hpp>
#include <crails/datatree.hpp>
#include <crails/attachment.hpp>
#include <crails/image.hpp>
#include "taggable.hpp"

namespace Crails::Cms
{
  enum AttachmentType
  {
    UnknownAttachment = 0,
    ImageAttachment
  };

  #pragma db object abstract
  class Attachment : public Crails::Odb::Model, public Crails::Cms::Taggable
  {
    friend class odb::access;
  public:
    static const std::string scope;
    static const std::string plural_scope;
    static const std::string view;

    template<typename QUERY>
    static QUERY default_order_by(QUERY query) { return query + "ORDER BY" + QUERY::created_at + "DESC"; }

    template<typename QUERY>
    static QUERY make_index_query(Data params)
    {
      using namespace std;
      auto tag = params["tag"].template defaults_to<string>("");
      auto search = params["search"].template defaults_to<string>("");
      auto mimetype = params["mimetype"].template defaults_to<string>("");
      QUERY query(true);

      if (tag.length() && tag != "any")
        query = query && QUERY::tag_list.like("%\\%\\%" + tag + "\\%\\%%");
      if (mimetype.length())
        query = query && QUERY::mimetype.like(mimetype + "%");
      if (search.length())
        query = query && (QUERY::name.like("%" + search + "%") || QUERY::description.like("%" + search + "%"));
      return query;
    }

    void edit(Data);
    void merge_data(Data) const;
    std::string to_json() const;
    void set_name(const std::string& value) { this->name = value; }
    const std::string& get_name() const { return name; }
    void set_resource(const std::string& value) { this->resource = value; }
    const std::string& get_resource() const { return resource; }
    void set_description(const std::string& value) { this->description = value; }
    const std::string& get_description() const { return description; }
    void set_type(AttachmentType value) { this->type = value; }
    const std::string& get_mimetype() const { return mimetype; }
    void set_mimetype(const std::string& value) { mimetype = value; }
    AttachmentType get_type() const { return static_cast<AttachmentType>(type); }

    Crails::Attachment as_attachment() const { return Crails::Attachment(resource); }
    Crails::BasicImage as_image() const { return Crails::BasicImage(resource); }
    Crails::BasicImage get_miniature() const { return Crails::BasicImage(miniature); }
    void set_miniature(Crails::BasicImage value) { miniature = value; }

    virtual void after_destroy() override;

  private:
    std::string name;
    std::string resource, miniature;
    std::string description;
    std::string mimetype;
    int type = UnknownAttachment;
  };
}
