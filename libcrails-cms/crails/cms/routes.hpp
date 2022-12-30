#ifndef  LIBCRAILS_CMS_ROUTES_HPP
# define LIBCRAILS_CMS_ROUTER_HPP

# include <crails/router.hpp>

# define libcrails_cms_admin_crud(path, controller) \
  match_action("GET",    std::string(path), controller, index) \
 .match_action("GET",    std::string(path) + "/new", controller, new_) \
 .match_action("GET",    std::string(path) + "/:id", controller, show) \
 .match_action("POST",   std::string(path), controller, create) \
 .match_action("PUT",    std::string(path) + "/:id", controller, update) \
 .match_action("DELETE", std::string(path) + "/:id", controller, destroy)
# define ROUTES_METHOD(NAME) \
  std::string get_##NAME##_path() const { return NAME##_path; } \
  std::string get_##NAME##_path(const std::string& suffix) const { return NAME##_path + '/' + suffix; } \
  std::string get_##NAME##_path(unsigned long id) const { return NAME##_path + '/' + std::to_string(id); }

namespace Crails::Cms
{
  void initialize_cms_routes(Crails::Router& router);

  struct Routes
  {
    SINGLETON(Routes)

    std::string settings_admin_path;
    std::string attachments_admin_path, menus_admin_path, users_admin_path;
    std::string pages_admin_path;
    std::string pages_path;
    std::string blog_admin_path;
    std::string blog_path;
    std::string wizard_path;
  public:
    ROUTES_METHOD(settings_admin)
    ROUTES_METHOD(attachments_admin)
    ROUTES_METHOD(menus_admin)
    ROUTES_METHOD(users_admin)
    ROUTES_METHOD(pages_admin)
    ROUTES_METHOD(pages)
    ROUTES_METHOD(blog_admin)
    std::string get_blog_post_admin_path() const { return get_blog_admin_path("post"); }
    std::string get_blog_post_admin_path(const std::string& suffix) const { return get_blog_admin_path("post/" + suffix); }
    std::string get_blog_post_admin_path(unsigned long id) const { return get_blog_post_admin_path(std::to_string(id)); }
    ROUTES_METHOD(blog)
    ROUTES_METHOD(wizard)

    template<typename CONTROLLER>
    void register_settings_admin_routes(Crails::Router& router)
    {
      settings_admin_path = router.get_current_scope();
      router.match_action("GET",  "/",    CONTROLLER, show);
      router.match_action("PUT",  "/:id", CONTROLLER, update);
      router.match_action("POST", "/",    CONTROLLER, update);
    }

    template<typename CONTROLLER>
    void register_attachments_admin_routes(Crails::Router& router)
    {
      attachments_admin_path = router.get_current_scope();
      router.match_action("GET",    "/",             CONTROLLER, index);
      router.match_action("GET",    "/new",          CONTROLLER, new_);
      router.match_action("GET",    "/:id",          CONTROLLER, show);
      router.match_action("PUT",    "/:id",          CONTROLLER, update);
      router.match_action("DELETE", "/:id",          CONTROLLER, destroy);
      router.match_action("GET",    "/:id/reupload", CONTROLLER, show_reupload);
      router.match_action("",       "/reupload",     CONTROLLER, reupload);
      router.match_action("",       "/upload",       CONTROLLER, create);
    }

    template<typename CONTROLLER>
    void register_menus_admin_routes(Crails::Router& router)
    {
      menus_admin_path = router.get_current_scope();
      router.libcrails_cms_admin_crud("/", CONTROLLER);
    }

    template<typename CONTROLLER>
    void register_users_admin_routes(Crails::Router& router)
    {
      users_admin_path = router.get_current_scope();
      router.libcrails_cms_admin_crud("/", CONTROLLER);
    }

    template<typename CONTROLLER, typename ADMIN_CONTROLLER>
    void register_page_admin_routes(Crails::Router& router)
    {
      pages_admin_path = router.get_current_scope();
      router.match_action("POST", "/preview", CONTROLLER, preview);
      router.match_action("PUT",  "/preview", CONTROLLER, preview);
      router.libcrails_cms_admin_crud("/", ADMIN_CONTROLLER);
    }

    template<typename CONTROLLER>
    void register_page_routes(Crails::Router& router)
    {
      pages_path = router.get_current_scope();
      router.match_action("GET", "/by-id/:id", CONTROLLER, by_id);
      router.match_action("GET", "/:slug",     CONTROLLER, show);
    }

    template<typename CONTROLLER, typename ADMIN_CONTROLLER>
    void register_blog_admin_routes(Crails::Router& router)
    {
      blog_admin_path = router.get_current_scope();
      router.libcrails_cms_admin_crud("/post", ADMIN_CONTROLLER);
      router.match_action("POST", "/preview", CONTROLLER, preview);
      router.match_action("PUT",  "/preview", CONTROLLER, preview);
      router.match_action("", "/", ADMIN_CONTROLLER, index);
    }

    template<typename CONTROLLER>
    void register_blog_routes(Crails::Router& router)
    {
      std::vector<std::string> index_routes{
        "/",
        "/by-user/:user",
        "/by-tag/:tag"
      };

      blog_admin_path = router.get_current_scope();
      for (const std::string& route : index_routes)
      {
        router.match_action("GET",  route, CONTROLLER, index);
        router.match_action("POST", route, CONTROLLER, index);
      }
      router.match_action("GET", "/by-id/:id", CONTROLLER, show);
      router.match_action("GET", "/:slug",     CONTROLLER, show);
    }

    template<typename CONTROLLER>
    void register_opengraph_routes(Crails::Router& router)
    {
      router.match_action("GET", "/opengraph", CONTROLLER, fetch);
    }

    template<typename CONTROLLER>
    void register_wizard_routes(Crails::Router& router)
    {
      wizard_path = router.get_current_scope();
      router.match_action("GET",  "/", CONTROLLER, show);
      router.match_action("POST", "/", CONTROLLER, update);
    }
  };
}

# undef libcrails_cms_admin_crud
#endif
