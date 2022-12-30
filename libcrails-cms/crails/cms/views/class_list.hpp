#pragma once
#include <set>
#include <string>
#include <ostream>

namespace Crails::Cms
{
  class ClassList : public std::set<std::string>
  {
  public:
    ClassList() {}
    ClassList(const ClassList& copy) : std::set<std::string>(copy) {}
    ClassList(const std::string value) : std::set<std::string>{value} {}
    ClassList(std::initializer_list<std::string> init) : std::set<std::string>(init) {}

    std::string to_string() const;

    ClassList operator+(const char* str) const { return operator+(std::string(str)); }
    ClassList operator+(const std::string&) const;
    ClassList operator+(ClassList) const;
    ClassList operator-(const char* str) const { return operator-(std::string(str)); }
    ClassList operator-(const std::string&) const;

    operator std::string() const { return to_string(); }
  };
}

std::ostream& operator<<(std::ostream&, const Crails::Cms::ClassList&);
