#include "version.hpp"

Crails::Cms::VersionSummary Crails::Cms::Version::summarize() const
{
  return VersionSummary{number, recorded_at, author_name};
}
