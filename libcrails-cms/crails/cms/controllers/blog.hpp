#pragma once
#include <crails/odb/controller.hpp>
#include <crails/odb/to_vector.hpp>
#include <crails/paginator.hpp>
#include "../models/blog/post.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class BlogController : public Crails::Odb::Controller<SUPER>
  {
    typedef Crails::Odb::Controller<SUPER> Super;
    typedef typename TRAITS::PostModel Post;
    typedef typename TRAITS::IndexModel IndexPost;
  public:
    BlogController(Crails::Context& context) : Super(context), paginator(Super::params)
    {
      paginator.set_default_items_per_page(10);
    }

    void index()
    {
      using namespace std;
      odb::result<IndexPost> posts;
      vector<unique_ptr<Crails::Cms::BlogPost>> models;
      auto query = Post::template make_index_query<odb::query<Post>>(Super::params.as_data());
      paginator.decorate_view(Super::vars, [this]()
      {
        return Super::database.template count<Post>(
          Post::template make_index_query<odb::query<Post>>(Super::params.as_data())
        );
      });
      paginator.decorate_query(query);
      Super::database.template find<IndexPost>(posts, query);
      for (const auto& post : posts)
        models.push_back(make_unique<Post>(post.to_post()));
      Super::render("blog/index", {{
        {"posts", &models},
        {"tag",   Super::params["tag"].template defaults_to<string>("")}
      }});
    }

    void show()
    {
      using namespace std;
      shared_ptr<Post> model;

      if (Super::params["slug"].exists())
        Super::database.find_one(model, odb::query<Post>::slug == Super::params["slug"].template as<string>());
      else if (Super::params["id"].exists())
        Super::database.find_one(model, Super::params["id"].template as<Crails::Odb::id_type>());
      if (model)
      {
        Super::prepare_open_graph(*model);
        Super::render("blog/show", {{"model", reinterpret_cast<Crails::Cms::BlogPost*>(model.get())}});
      }
      else
        Super::respond_with(Crails::HttpStatus::not_found);
    }

    bool must_protect_from_forgery() const override
    {
      if (Super::get_action_name() == "preview")
        return false;
      return Super::must_protect_from_forgery();
    }

    void preview()
    {
      Post model;

      model.edit(Super::params[Crails::Cms::BlogPost::scope]);
      Super::prepare_open_graph(model);
      Super::vars["preview"] = true;
      Super::render("blog/show", {
        {"model", reinterpret_cast<Crails::Cms::BlogPost*>(&model)}
      });
    }

  protected:
    Crails::Paginator paginator;
  };
}
