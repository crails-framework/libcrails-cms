#pragma once
#include <vector>
#include <crails/odb/id_type.hpp>

struct PermissionGroupRenderOptions
{
  std::string name;
  bool should_display;
  std::vector<Crails::Odb::id_type> ids;
};
