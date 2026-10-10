#include "script_initializer.hpp"

using namespace std;

namespace Crails::Cms
{
  string inline_script_tag(HtmlTemplate::Yieldable yieldable)
  {
    return "<script>"
           "Cms.onPageLoad(function() {" + yieldable() + "}, { once: true });"
           "</script>";
  }
}
