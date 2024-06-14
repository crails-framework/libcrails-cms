#pragma once
#include <crails/odb/controller.hpp>
#include <crails/odb/to_vector.hpp>
#include <crails/paginator.hpp>
#include <crails/renderer.hpp>
#include <crails/any_cast.hpp>
#include <crails/shared_vars.hpp>
#include "injectable.hpp"
#include "../models/blog/post.hpp"
#include "../local_route.hpp"

namespace Crails::Cms
{
  template<typename TRAITS, typename SUPER>
  class BlogController : public Crails::Odb::Controller<SUPER>
  {
    typedef Crails::Odb::Controller<SUPER> Super;
    typedef typename TRAITS::Model Post;
    typedef typename TRAITS::IndexModel IndexPost;
  public:
    BlogController(Crails::Context& context) : Super(context), paginator(Super::params)
    {
      paginator.set_default_items_per_page(10);
    }
 
    virtual std::string get_view_scope() const { return "blog"; }

    void initialize()
    {
      Super::initialize();
      Super::vars["rss"] = LocalRoute(Super::vars)();
    }

    class InjectableIndex : public Crails::Cms::Injectable
    {
      typedef std::vector<std::unique_ptr<Crails::Cms::BlogPost>> PostList;
    public:
      InjectableIndex(const Crails::SharedVars& a, Crails::RenderTarget& b) : Crails::Cms::Injectable(a, b)
      {
      }

      virtual void run() override
      {
        using namespace std;
        DataTree params;

        params.from_map(map<string,string>{
          {"page", "1"},
          {"count", Crails::defaults_to<string>(vars, "count", "3")}
        });
        run(params);
      }

      virtual void run(Data params)
      {
        Crails::Paginator paginator(params);

        run_with_paginator(params, paginator);
      }

      virtual void run_with_paginator(Data params, Crails::Paginator& paginator)
      {
        using namespace std;
        Crails::SharedVars view_vars;
        odb::result<IndexPost> posts;
        PostList models;
        odb::query<Post> query = Post::template make_index_query<odb::query<Post>>(params);

        query = odb::query<Post>::published == true && query;
        view_vars["is_injected"] = injecting;
        if (injecting)
          view_vars["local_route"] = "/blog";
        paginator.decorate_view(view_vars, [&]() { return database.count<Post>(query); });
        paginator.decorate_query<Post>(query);
        database.find<IndexPost>(posts, query);
        for (const auto& post : posts)
          models.push_back(make_unique<Post>(post.to_post()));
        view_vars["models"] = const_cast<const PostList*>(&models);
        render("blog/index", view_vars);
      }
    };

    void index()
    {
      InjectableIndex injectable(Super::vars, Super::response);

      injectable.set_accepted_formats(Super::get_accept_header());
      injectable.run_with_paginator(Super::params.as_data(), paginator);
    }

    void show()
    {
      using namespace std;
      shared_ptr<Post> model, previous_model, next_model;

      if (Super::params["slug"].exists())
        Super::database.find_one(model, odb::query<Post>::slug == Super::params["slug"].template as<string>());
      else if (Super::params["id"].exists())
        Super::database.find_one(model, Super::params["id"].template as<Crails::Odb::id_type>());
      if (model)
      {
        Super::database.find_one(previous_model, Post::template make_previous_query<odb::query<Post>>(*model));
        Super::database.find_one(next_model, Post::template make_next_query<odb::query<Post>>(*model));
        add_model_to_vars("previous_model", previous_model);
        add_model_to_vars("next_model", next_model);
        Super::prepare_open_graph(*model);
        Super::render(get_view_scope() + "/show", {
          {"model", reinterpret_cast<const Crails::Cms::BlogPost*>(model.get())}
        });
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

    void add_model_to_vars(const char* key, const std::shared_ptr<Post>& model)
    {
      Super::vars[key] = reinterpret_cast<const Crails::Cms::BlogPost*>(model.get());
    }

    void preview()
    {
      Post model;

      model.edit(Super::params[Post::scope]);
      Super::prepare_open_graph(model);
      Super::vars["preview"] = true;
      Super::render(get_view_scope() + "/show", {
        {"model", reinterpret_cast<const Crails::Cms::BlogPost*>(&model)}
      });
    }

  protected:
    Crails::Paginator paginator;
  };
}
