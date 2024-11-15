#include <string>
#include <crails/i18n_string.hpp>

namespace Crails::Cms
{
  void generate_translated_excerpts_from_html(i18n::String& target, const i18n::String& html, std::size_t max_length = 315);
  std::string generate_excerpt_from_html(const std::string& html, std::size_t max_length = 315);
}
