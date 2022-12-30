#pragma once
#include <string>
#include <vector>

namespace Crails::Cms
{
  class TagList : public std::string
  {
  public:
    TagList(const std::string& s) : std::string(s) {}
    TagList() {}

    std::vector<std::string> to_vector() const;
    TagList& from_vector(const std::vector<std::string>&);
  };
}
