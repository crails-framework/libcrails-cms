#ifndef  LIBCRAILS_CMS_ROUTES_HPP
# define LIBCRAILS_CMS_ROUTES_HPP

# include <crails/router.hpp>
# include <crails/signin/session_controller.hpp>
# include "local_route.hpp"

# define libcrails_cms_admin_crud(path, controller) \
  match_action("GET",    std::string(path), controller, index) \
 .match_action("GET",    std::string(path) + "/new", controller, new_) \
 .match_action("GET",    std::string(path) + "/:id", controller, show) \
 .match_action("POST",   std::string(path), controller, create) \
 .match_action("PUT",    std::string(path) + "/:id", controller, update) \
 .match_action("DELETE", std::string(path) + "/:id", controller, destroy)
# define libcrails_cms_admin_preview(controller) \
  match_action("PUT",  "/preview", controller, preview) \
 .match_action("POST", "/preview", controller, preview)
# define ROUTES_METHOD(NAME, CONTROLLER) \
  std::string get_##NAME##_path() const { return NAME##_path; } \
  std::string get_##NAME##_path(const std::string& suffix) const { return NAME##_path + '/' + suffix; } \
  std::string get_##NAME##_path(unsigned long id) const { return NAME##_path + '/' + std::to_string(id); }

namespace Crails::Cms
{
  void initialize_cms_routes(Crails::Router& router);

  class Routes
  {
    SINGLETON(Routes)
    typedef std::reference_wrapper<const std::type_info> TypeInfoRef;

    std::map<std::size_t, std::string> pathes;
    std::string attachment_admin_path;
  public:
    template<typename CONTROLLER>
    void set_path_for(Crails::Router& router)
    {
      pathes[typeid(CONTROLLER).hash_code()] = router.get_current_scope();
    }

    template<typename CONTROLLER>
    std::string get_path_for() const
    {
      auto it = pathes.find(typeid(CONTROLLER).hash_code());
      if (it == pathes.end())
        throw boost_ext::runtime_error("no path defined for controller");
      return it->second;
    }

    template<typename CONTROLLER>
    static LocalRoute get_local_route_for()
    {
      return LocalRoute(singleton::require().get_path_for<CONTROLLER>());
    }

    template<typename CONTROLLER>
    std::string get_path_for(const std::string& suffix) const
    {
      return get_path_for<CONTROLLER>() + suffix;
    }

    template<typename CONTROLLER>
    std::string get_path_for(unsigned long id) const
    {
      return get_path_for<CONTROLLER>() + std::to_string(id);
    }

    std::string get_attachments_admin_path() const
    {
      return attachment_admin_path;
    }

    void register_sitemap_routes(Crails::Router& router, const std::string& prefix = "/sitemap.xml");

    template<typename CONTROLLER>
    void register_settings_admin_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.match_action("GET",  "/",            CONTROLLER, show);
      router.match_action("PUT",  "/:id",         CONTROLLER, update);
      router.match_action("POST", "/",            CONTROLLER, update);
      router.match_action("GET",  "/layout",      CONTROLLER, show_layout);
      router.match_action("POST", "/layout",      CONTROLLER, update);
      router.match_action("PUT",  "/layout/:id",  CONTROLLER, update);
      router.match_action("GET",  "/plugins",     CONTROLLER, show_plugins);
      router.match_action("POST", "/plugins",     CONTROLLER, update);
      router.match_action("PUT",  "/plugins/:id", CONTROLLER, update);
    }

    template<typename CONTROLLER>
    void register_attachments_admin_routes(Crails::Router& router)
    {
      attachment_admin_path = router.get_current_scope();
      set_path_for<CONTROLLER>(router);
      router.match_action("GET",    "/",             CONTROLLER, index);
      router.match_action("GET",    "/new",          CONTROLLER, new_);
      router.match_action("GET",    "/:id",          CONTROLLER, show);
      router.match_action("PUT",    "/:id",          CONTROLLER, update);
      router.match_action("DELETE", "/:id",          CONTROLLER, destroy);
      router.match_action("GET",    "/:id/reupload", CONTROLLER, show_reupload);
      router.match_action("POST",   "/:id/reupload", CONTROLLER, reupload);
      router.match_action("",       "/reupload",     CONTROLLER, reupload);
      router.match_action("",       "/upload",       CONTROLLER, create);
    }

    template<typename CONTROLLER>
    void register_attachments_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.match_action("GET", "/:id/thumbnail", CONTROLLER, thumbnail);
      router.match_action("GET", "/:id", CONTROLLER, show);
    }

    template<typename CONTROLLER>
    void register_menus_admin_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.libcrails_cms_admin_crud("/", CONTROLLER);
    }

    template<typename CONTROLLER>
    void register_users_admin_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.libcrails_cms_admin_crud("/", CONTROLLER);
    }

    template<typename CONTROLLER>
    void register_user_groups_admin_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.libcrails_cms_admin_crud("/", CONTROLLER);
    }

    template<typename CONTROLLER, typename ADMIN_CONTROLLER>
    void register_page_admin_routes(Crails::Router& router)
    {
      set_path_for<ADMIN_CONTROLLER>(router);
      router.libcrails_cms_admin_preview(CONTROLLER);
      router.libcrails_cms_admin_crud("/", ADMIN_CONTROLLER);
    }

    template<typename CONTROLLER>
    void register_page_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.match_action("GET", "/by-id/:id", CONTROLLER, by_id);
      router.match_action("GET", "/:slug",     CONTROLLER, show);
    }

    template<typename CONTROLLER, typename ADMIN_CONTROLLER>
    void register_blog_admin_routes(Crails::Router& router)
    {
      set_path_for<ADMIN_CONTROLLER>(router);
      router.libcrails_cms_admin_crud("/post", ADMIN_CONTROLLER);
      router.libcrails_cms_admin_preview(CONTROLLER);
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

      set_path_for<CONTROLLER>(router);
      for (const std::string& route : index_routes)
      {
        router.match_action("GET",  route, CONTROLLER, index);
        router.match_action("POST", route, CONTROLLER, index);
      }
      router.match_action("GET", "/by-id/:id", CONTROLLER, show);
      router.match_action("GET", "/:slug",     CONTROLLER, show);
    }

    template<typename CONTROLLER>
    void register_signin_controller(Crails::Router& router)
    {
      router.scope(CONTROLLER::signin_path, [&]()
      {
        set_path_for<CONTROLLER>(router);
        router.signin_actions("/", CONTROLLER)
              .match_action("GET", "/new", CONTROLLER, new_);
      });
    }

    template<typename CONTROLLER>
    void register_opengraph_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.match_action("GET", "/opengraph", CONTROLLER, fetch);
    }

    template<typename CONTROLLER>
    void register_wizard_routes(Crails::Router& router)
    {
      set_path_for<CONTROLLER>(router);
      router.match_action("GET",  "/", CONTROLLER, show);
      router.match_action("POST", "/", CONTROLLER, update);
    }
  };
}

#endif
