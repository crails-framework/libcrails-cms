#pragma once
#include "resource.hpp"
#include "../../models/attachment.hpp"
#include <crails/logger.hpp>
#include <thread>

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
      const auto& files = Super::params.get_files();
      DataTree output;

      logger << Logger::Debug << "AdminAttachmentController: create has been called" << Logger::endl;
      if (files.size() > 0)
      {
        for (const auto& file : files)
        {
          Model model;
          auto file_id = std::to_string(model.get_id());
          Data file_data = output["files"][file_id];

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
      else
      {
        logger << Logger::Debug << "AdminAttachmentController: no files were sent" << Logger::endl;
        Super::respond_with(Crails::HttpStatus::bad_request);
      }
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
      else if (file.mimetype.find("audio/") == 0)
        model.set_type(Crails::Cms::AudioAttachment);
      else if (file.mimetype.find("video/") == 0)
        model.set_type(Crails::Cms::VideoAttachment);
      Super::database.save(model);
      if (enforce_acceptable_format(model))
        model.set_processing(true);
      Super::database.save(model);
    }

    virtual std::vector<std::string_view> get_acceptable_audio_formats() const
    {
      return std::vector<std::string_view>{"audio/mp3"};
    }

    virtual std::vector<std::string_view> get_acceptable_video_formats() const
    {
      return std::vector<std::string_view>{"video/mpeg", "video/mp4", "video/webm"};
    }

    virtual bool enforce_acceptable_format(Model& model)
    {
      auto find = [](const std::vector<std::string_view>& a, const std::string& b) -> bool { return std::find(a.begin(), a.end(), b) != a.end(); };

      if (model.get_mimetype().find("audio/") == 0 && !find(get_acceptable_audio_formats(), model.get_mimetype()))
        start_convert_task<Crails::AudioFile>(Crails::AudioFile::Mp3Format, model);
      else if (model.get_mimetype().find("video/") == 0 && !find(get_acceptable_video_formats(), model.get_mimetype()))
        start_convert_task<Crails::VideoFile>(Crails::VideoFile::Mp4Format, model);
      else
        return false;
      return true;
    }

    template<typename MEDIA_TYPE>
    void start_convert_task(typename MEDIA_TYPE::Format format, const Model& model)
    {
      Super::start_thread([model, format]()
      {
        logger << Logger::Info << "AdminAttachmentController: converting attachment "
                               << model.get_id() << Logger::endl;
        Model model2(model);
        MEDIA_TYPE source(model.get_resource());
        MEDIA_TYPE target = source.as_format(format);

        source.link_to(target);
        model2.set_resource(target);
        model2.set_mimetype(target.get_mimetype());
        model2.set_processing(false);
        {
          Odb::Connection database;
          database.rollback_on_destruction = false;
          database.save(model2);
          database.commit();
        }
        logger << Logger::Info << "AdminAttachmentController: done converting media "
                               << model.get_id() << " to " << target.get_mimetype() << Logger::endl;
      });
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
