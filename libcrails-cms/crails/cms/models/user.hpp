#pragma once
#include <crails/signin/password.hpp>
#include <crails/signin/model.hpp>
#include "user_group.hpp"

namespace Crails::Cms
{
  enum UserRole
  {
    AdminRole = 0,
    EditorRole,
    AuthorRole,
    MemberRole,
    VisitorRole
  };

  #pragma db object abstract
  class User : public Crails::Odb::Model, public Crails::AuthenticableModel
  {
    friend class odb::access;
  public:
    static const std::string scope;
    static const std::string plural_scope;
    static const std::string view;

    template<typename QUERY>
    static QUERY default_order_by(QUERY query) { return query; }

    virtual void edit(Data);
    void merge_data(Data) const;
    std::string to_json() const;
    virtual void after_destroy() override;

    bool is_admin() const { return role == AdminRole; }
    void set_email(const std::string& value) { this->email = value; }
    const std::string& get_email() const { return email; }
    void set_password(const std::string& value) { password = Crails::Password(value); }
    const std::string& get_firstname() const { return firstname; }
    void set_firstname(const std::string& value) { firstname = value; }
    const std::string& get_lastname() const { return lastname; }
    void set_lastname(const std::string& value) { lastname = value; }
    const std::string& get_password() const { return password; }
    void set_role(UserRole value) { role = value; }
    UserRole get_role() const { return role; }
    void set_attached_avatar(const std::string& value) { attached_avatar = value; }

    virtual std::string get_display_name() const;
    std::string get_avatar_url() const;

    virtual unsigned long get_group_flag() const = 0;
    virtual std::vector<Crails::Odb::id_type> get_group_ids() const = 0;

  private:
    std::string email;
    std::string password;
    std::string firstname, lastname;
    std::string attached_avatar;
    UserRole    role = VisitorRole;
  };
}
