#pragma once
#include "resource.hpp"
#include "../../models/blog/post.hpp"
#include "../../local_route.hpp"
#include <chrono>

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class AdminBlogController : public AdminResourceController<TRAITS, Crails::Cms::BlogPost, SUPER>
  {
    typedef AdminResourceController<TRAITS, Crails::Cms::BlogPost, SUPER> Super;
    typedef typename TRAITS::Model      Post;
    typedef typename TRAITS::TagModel   Tag;
    typedef typename TRAITS::IndexModel IndexPost;

    std::string get_view_scope() const override { return "blog"; }
  public:
    AdminBlogController(Crails::Context& context) : Super(context)
    {
      Super::vars["page_title"] = i18n::t("admin.menu.blog");
      Super::vars["page_subtitle"] = i18n::t("admin.blog-subtitle");
    }

    void index()
    {
      Super::vars["tag_options"] = Post().template collect_tags<Tag>(true);
      Super::vars["tag"] = Super::params["tag"].template defaults_to<std::string>("");
      Super::index();
    }

    void new_()
    {
      Post model;

      model.set_published(can_publish());
      Super::vars["page_subtitle"] = i18n::t("admin.blog-creation");
      Super::vars["can_publish"] = model.get_published();
      Super::vars["tag_options"] = model.template collect_tags<Tag>();
      Super::render_editor(model);
    }

    void create()
    {
      LocalRoute route(Super::vars);
      Post model;
      bool published = should_publish();
      auto author = Super::user_session.const_get_current_user();

      model.edit(Super::params[Post::scope]);
      model.set_author_id(author->get_id());
      if (published)
        before_publishing_post(model);
      Super::database.save(model);
      if (published)
        on_post_published(model);
      Super::flash["info"] = "Post created";
      Super::redirect_to(route.make("post", model.get_id()));
    }

    void update()
    {
      LocalRoute route(Super::vars);
      std::shared_ptr<Post> model = Super::require_resource();

      if (model)
      {
        bool already_published = model->get_published();
        bool published = should_publish();
        bool published_action = published && !already_published;

        model->edit(Super::params[Post::scope]);
        model->set_published(published);
        if (published_action)
          before_publishing_post(*model);
        Super::database.save(*model);
        if (published_action)
          on_post_published(*model);
        Super::flash["info"] = "Post updated";
        Super::redirect_to(route.make("post", model->get_id()));
      }
    }

  protected:
    odb::query<Post> make_index_query() const override
    {
      return Post::template make_index_query<odb::query<Post>>(Super::params.as_data());
    }

    void render_editor(Post& model) override
    {
      Super::vars["page_title"] = std::string(model.get_title());
      Super::vars["page_subtitle"] = i18n::t("admin.blog-edition");
      Super::vars["can_publish"] = can_publish();
      Super::vars["tag_options"] = model.template collect_tags<Tag>();
      Super::render_editor(model);
    }

    bool can_publish() const
    {
      auto role = Super::user_session.const_get_current_user()->get_role();
      return role == AdminRole || role == EditorRole;
    }

    bool should_publish() const
    {
      return can_publish()
          && Super::params[Post::scope]["published"].template defaults_to<std::string>("") == "on";
    }

    virtual void before_publishing_post(Post& post)
    {
      auto now = std::chrono::system_clock::now();
      post.set_publication_at(std::chrono::system_clock::to_time_t(now));
    }

    virtual void on_post_published(Post&) {}
  };
}

