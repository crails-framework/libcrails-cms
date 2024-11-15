#include "html_excerpt.hpp"
#include <regex>

using namespace std;

static string trim_unfinished_words(string source)
{
  for (auto it = source.rbegin() ; it != source.rend() ; ++it)
  {
    if (*it == ' ')
      break ;
    source.erase(--(it.base()));
  }
  return source;
}

namespace Crails::Cms
{
  void generate_translated_excerpts_from_html(i18n::String& target, const i18n::String& html, size_t max_length)
  {
    for (const string& locale : html.as_data().get_keys())
    {
      Data translation = target[locale];

      if (translation.is_blank())
        translation = generate_excerpt_from_html(html[locale].as<string>(), max_length);
    }
  }

  string generate_excerpt_from_html(const string& html, size_t max_length)
  {
    string excerpt;
    regex paragraph_regex("<p>(.*?)</p>", regex_constants::ECMAScript | regex_constants::icase);
    auto match = std::sregex_iterator(html.begin(), html.end(), paragraph_regex);

    if (match != sregex_iterator())
    {
      size_t starts_at = 3;
      size_t to_trim = 4 + starts_at;

      excerpt = match->str();
      if (excerpt.length() - to_trim > max_length)
      {
        excerpt = excerpt.substr(starts_at, max_length);
        excerpt = trim_unfinished_words(excerpt) + "[…]";
      }
      else
        excerpt = excerpt.substr(starts_at, excerpt.length() - to_trim);
    }
    return excerpt;
  }
}
