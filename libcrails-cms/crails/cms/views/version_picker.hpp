#pragma once
#include <string>
#include <crails/shared_vars.hpp>
#include "../models/version_summary.hpp"

namespace Crails::Cms
{
  struct VersionPickerData
  {
    VersionSummaries versions; // newest first
    unsigned int     current = 0;
    unsigned int     selected = 0;
    std::string      route;
  };

  std::string render_version_picker(const Crails::SharedVars& vars);
}
