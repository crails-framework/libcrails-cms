#include "taggable.hpp"

using namespace std;

void Crails::Cms::Taggable::set_tags(const vector<string>& value)
{
  tag_list = Crails::Cms::TagList().from_vector(value);
}
