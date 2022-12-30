#pragma once
#include "user_group.hpp"

namespace Crails::Cms
{
  #pragma db object abstract
  class PermissionRule : public Crails::Odb::Model
  {
    friend class odb::access;
  public:
    template<typename LIST>
    void set_read_groups(const LIST& list)
    {
      read = permission_flag_for_groups(list);
    }

    template<typename LIST>
    void set_write_groups(const LIST& list)
    {
      write = permission_flag_for_groups(list);
    }

    template<typename LIST>
    void set_destroy_groups(const LIST& list)
    {
      destroy = permission_flag_for_groups(list);
    }

    template<typename USER>
    bool can_read(const USER& user) const { return can(read, user); }

    template<typename USER>
    bool can_write(const USER& user) const { return can(write, user); }

    template<typename USER>
    bool can_destroy(const USER& user) const { return can(destroy, user); }

    void purge_flag(unsigned long);
    unsigned long get_flag() const { return read | write | destroy; }
    unsigned long get_read_flag() const { return read; }
    unsigned long get_write_flag() const { return write; }
    unsigned long get_destroy_flag() const { return destroy; }

  private:
    template<typename USER>
    static bool can(unsigned long flag, const USER& user)
    {
      return (flag & user.get_group_flag()) > 0 || user.is_admin();
    }

    unsigned long read = 0;
    unsigned long write = 0;
    unsigned long destroy = 0;
  };
}
