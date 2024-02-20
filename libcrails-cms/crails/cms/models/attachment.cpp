#include "attachment.hpp"
#include <filesystem>

using namespace std;
using namespace Crails::Cms;

const std::string Attachment::scope = "attachment";
const std::string Attachment::plural_scope = "attachments";
const std::string Attachment::view = "";

void Attachment::after_destroy()
{
  as_attachment().cleanup_files();
  get_miniature().cleanup_files();
}

void Attachment::edit(Data params)
{
  if (params["name"].exists())
    set_name(params["name"]);
  if (params["type"].exists())
    set_type(static_cast<AttachmentType>(params["type"].as<int>()));
  if (params["description"].exists())
    set_description(params["description"]);
  if (params["tags"].exists())
    set_tags(params["tags"].to_vector<std::string>());
}

void Attachment::merge_data(Data out) const
{
  out["name"] = this->name;
  out["type"] = this->type;
  out["description"] = this->description;
  out["mimetype"] = this->mimetype;
  out["url"] = this->as_attachment().get_url();
  if (type == ImageAttachment)
    out["miniature_url"] = this->get_miniature().get_url();
  out["tags"].from_vector(get_tags());
}

std::string Attachment::to_json() const
{
  DataTree out;

  merge_data(out);
  return out.to_json();
}
