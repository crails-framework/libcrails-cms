#pragma once
#include "resource.hpp"
#include "../../models/attachment.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminAttachmentController : public AdminResourceController<TRAITS, Crails::Cms::Attachment, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::Attachment, SUPER> Super;
    typedef typename TRAITS::Model      Model;
    typedef typename TRAITS::TagModel   Tag;
    typedef typename TRAITS::IndexModel IndexModel;
    std::pair<unsigned int, unsigned int> miniature_size;

    std::string get_view_scope() const override { return "attachments"; }
  public:
    AdminAttachmentController(Crails::Context& context) : Super(context), miniature_size(256, 256)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.files");
      Super::vars["page_subtitle"] = i18n::t("admin.attachments-subtitle");
    }

    void index()
    {
      Super::vars["tag_options"] = Model().template collect_tags<Tag>(true);
      Super::vars["tag"] = Super::params["tag"].template defaults_to<std::string>("");
      Super::index();
    }

    void create()
    {
      DataTree output;

      Super::params.as_data().output();
      for (const auto& file : Super::params.get_files())
      {
        Model model;
        Data file_data = output["files"][std::to_string(model.get_id())];

        if (Super::params["tags"].exists())
        {
          TagList tag_list(Super::params["tags"].template as<std::string>());
          model.set_tags(tag_list.to_vector());
        }
        model.edit(file_data);
        upload_to(model, file);
        model.merge_data(file_data);
      }
      output["csrf-token"] = Super::session["csrf-token"].template as<std::string>();
      Super::render(Super::JSON, output);
    }

    void update()
    {
      std::shared_ptr<Model> model = Super::require_resource();

      if (model)
      {
        model->edit(Super::params[Crails::Cms::Attachment::scope]);
        Super::database.save(*model);
        render_editor(*model);
      }
    }

    void reupload()
    {
      std::shared_ptr<Model> model = Super::require_resource();

      if (model)
      {
        auto list = Super::params.get_files();

        if (list.size() == 1)
        {
          upload_to(*model, *list.begin());
          render_editor(*model);
        }
        else
          Super::respond_with(Crails::HttpStatus::bad_request);
      }
    }

    void upload_to(Model& model, const Crails::Params::File& file)
    {
      Crails::Attachment attachment = model.as_attachment();

      attachment.use_uploaded_file(&file);
      model.set_name(file.name);
      model.set_mimetype(file.mimetype);
      model.set_resource(attachment);
      if (file.mimetype.find("image/") == 0)
      {
        auto miniature = model.as_image()
          .cropped(miniature_size.first, miniature_size.second, Crails::BasicImage::PreserveAspectRatio);
        model.set_type(Crails::Cms::ImageAttachment);
        model.set_miniature(miniature);
      }
      Super::database.save(model);
    }

    void new_()
    {
      Super::vars["page_subtitle"] = i18n::t("admin.new-attachment");
      Super::vars["tag_options"] = Model().template collect_tags<Tag>();
      Super::render("admin/attachments/new");
    }

    void show_reupload()
    {
      std::shared_ptr<Model> model = Super::require_resource();

      if (model)
      {
        Super::vars["page_subtitle"] = i18n::t("admin.reupload");
        Super::vars["model"] = reinterpret_cast<const Crails::Cms::Attachment*>(model.get());
        Super::render("admin/attachments/reupload");
      }
    }

    void destroy()
    {
      std::shared_ptr<Model> model = Super::require_resource();

      if (model)
      {
        Super::database.destroy(*model);
        Super::redirect_to(Super::get_url());
      }
    }

  protected:
    virtual odb::query<Model> make_index_query() const
    {
      return Model::template make_index_query<odb::query<Model>>(Super::params.as_data());
    }

    void render_editor(Model& model) override
    {
      Super::vars["tag_options"] = model.template collect_tags<Tag>();
      Super::render_editor(model);
    }
  };
}
