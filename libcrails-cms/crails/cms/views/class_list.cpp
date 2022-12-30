#include <crails/utils/join.hpp>
#include "class_list.hpp"

using namespace Crails::Cms;
using namespace std;

ostream& operator<<(ostream& stream, const Crails::Cms::ClassList& list)
{
  stream << list.to_string();
  return stream;
}

string ClassList::to_string() const
{
  return Crails::join(begin(), end(), ' ');
}

ClassList ClassList::operator+(const string& classname) const
{
  ClassList result(*this);

  result.insert(classname);
  return result;
}

ClassList ClassList::operator+(ClassList other) const
{
  copy(begin(), end(), inserter(other, other.begin()));
  return other;
}

ClassList ClassList::operator-(const string& classname) const
{
  ClassList result(*this);
  auto it = result.find(classname);

  if (it != result.end())
    result.erase(it);
  return result;
}
