#pragma once
#include "user.hpp"

namespace Crails::Cms
{
  enum Permission
  {
    ReadPermission  = 1,
    WritePermission = 2
  };

  struct PermissionTarget
  {
    virtual bool can(unsigned int permissions, const User* user = nullptr) const { return true; }
    bool can_read(const User* user = nullptr) const { return can(ReadPermission, user); }
    bool can_write(const User* user = nullptr) const { return can(WritePermission, user); }
  };
}
