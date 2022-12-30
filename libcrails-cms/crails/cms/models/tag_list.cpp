#include "tag_list.hpp"

using namespace Crails::Cms;

std::vector<std::string> TagList::to_vector() const
{
  std::string item;
  std::vector<std::string> result;
  unsigned int last_item_at = 2;

  for (unsigned int i = last_item_at ; i < length() ; ++i)
  {
    if (operator[](i) == '%' && operator[](i + 1) == '%')
    {
      item = substr(last_item_at, i - last_item_at);
      result.push_back(item);
      last_item_at = i + 2;
    }
  }
  if (last_item_at < length())
    result.push_back(substr(last_item_at));
  return result;
}

TagList& TagList::from_vector(const std::vector<std::string>& source)
{
  clear();
  for (auto it = source.begin() ; it != source.end() ; ++it)
    (*this) += "%%" + *it;
  (*this) += "%%";
  return *this;
}
