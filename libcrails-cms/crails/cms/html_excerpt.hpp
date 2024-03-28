#include <string>

namespace Crails::Cms
{
  std::string generate_excerpt_from_html(const std::string& html, std::size_t max_length = 315);
}
