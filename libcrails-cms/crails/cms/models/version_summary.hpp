#pragma once
#include <ctime>
#include <string>
#include <vector>

namespace Crails::Cms
{
  // Light-weight description of a version, used by the admin widget
  struct VersionSummary
  {
    unsigned int number = 0;
    std::time_t  recorded_at = 0;
    std::string  author_name;
  };

  typedef std::vector<VersionSummary> VersionSummaries;
}
