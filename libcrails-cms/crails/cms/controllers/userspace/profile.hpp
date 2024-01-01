#pragma once
#include "../userspace.hpp"

namespace Crails::Cms::Userspace
{
  template<typename TRAITS, typename SUPER>
  class ProfileController : public UserspaceController<TRAITS, SUPER>
  {
    typedef UserspaceController<TRAITS, SUPER> Super;
    typedef typename TRAITS::UserModel USER;
  public:
    ProfileController(Crails::Context& context) : Super(context)
    {
    }

    void initialize()
    {
      Super::initialize();
      if (!require_logged_user() && Super::get_current_user() != nullptr)
        Super::redirect_to_userspace_home();
    }

    void show()
    {
      Crails::Odb::id_type user_id = Super::params["id"];
      std::shared_ptr<USER> user;

      Super::database.find_one(user, odb::query<USER>::id == user_id);
      if (user)
      {
        Super::render("userspace/profile/show", {
          {"model", reinterpret_cast<const Crails::Cms::User*>(user.get())}
        });
      }
      else
        Super::respond_with(Crails::HttpStatus::not_found);
    }

    void self()
    {
      Super::render("userspace/profile/show", {
        {"model", Super::get_current_user()},
        {"is_current_user", true},
        {"edit_path", std::string(TRAITS::profile_root) + "/edit"}
      });
    }

    void new_()
    {
      USER user;

      render_register_form(user);
    }

    void create()
    {
      USER user;

      if (initialize_new_user(user))
      {
        Super::user_session.set_current_user(user); // also persists the user
        Super::redirect_to_userspace_home();
      }
      else
        render_register_form(user);
    }

    void edit()
    {
      Super::render("userspace/profile/edit", {
        {"model", Super::get_current_user()}
      });
    }

    void update()
    {
      Crails::Odb::id_type user_id = Super::params["id"];
      auto model = Super::user_session.get_current_user();

      if (user_id == model->get_id())
      {
        if (edit_user(*model))
        {
          Super::database.save(*model);
          Super::redirect_to(TRAITS::profile_root);
        }
      }
      else
        Super::respond_with(Crails::HttpStatus::forbidden);
    }

  protected:
    virtual bool require_logged_user() const override
    {
      std::string action = Super::params["controller-data"]["action"];

      return action != "new_" && action != "create";
    }

    virtual void render_register_form(const USER& user)
    {
      Super::render("userspace/profile/new", {
        {"model", reinterpret_cast<const Crails::Cms::User*>(&user)}
      });
    }

    virtual bool initialize_new_user(USER& user)
    {
      return edit_user(user);
    }

    virtual bool edit_user(USER& user)
    {
      const auto* avatar = Super::params.get_upload("user[avatar]");

 
      if (avatar)
        initialize_avatar(user, avatar);
      user.edit(Super::params[USER::scope]);
      return true;
    }

    virtual void initialize_avatar(USER& user, const Crails::Params::File* file)
    {
      Crails::BasicImage source, resized;

      source.use_uploaded_file(file);
      resized = source.resized(200, 200, Crails::BasicImage::PreserveAspectRatio);
      user.set_attached_avatar(resized);
    }
  };
}

