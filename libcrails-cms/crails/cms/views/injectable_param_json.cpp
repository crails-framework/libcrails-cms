#include "injector.hpp"
#include <sstream>
#include <iomanip>

using namespace std;

namespace Crails::Cms
{
  static const char* param_type_name(InjectableParamType type)
  {
    switch (type)
    {
      case InjectableParamType::Number:    return "number";
      case InjectableParamType::Boolean:   return "boolean";
      case InjectableParamType::Color:     return "color";
      case InjectableParamType::Url:       return "url";
      case InjectableParamType::Picture:   return "picture";
      case InjectableParamType::Video:     return "video";
      case InjectableParamType::Audio:     return "audio";
      case InjectableParamType::Gallery:   return "gallery";
      case InjectableParamType::Choice:    return "choice";
      case InjectableParamType::Selection: return "selection";
      case InjectableParamType::String:
      default: break ;
    }
    return "string";
  }

  static void options_into_json(ostringstream& out, const vector<InjectableParamOption>& options)
  {
    out << '[';
    for (size_t i = 0 ; i < options.size() ; ++i)
    {
      const InjectableParamOption& option = options[i];

      if (i > 0) out << ',';
      out << "{\"value\":" << std::quoted(option.value)
          << ",\"label\":" << std::quoted(option.label)
          << '}';
    }
    out << ']';
  }

  string params_to_json(const vector<InjectableParamTraits>& params)
  {
    ostringstream out;

    out << '[';
    for (size_t i = 0 ; i < params.size() ; ++i)
    {
      const InjectableParamTraits& param = params[i];

      if (i > 0)
        out << ',';
      out << "{\"name\":" << std::quoted(string(param.name))
          << ",\"type\":\"" << param_type_name(param.type) << '"'
          << ",\"optional\":" << (param.optional ? "true" : "false");
      if (param.type == InjectableParamType::Choice)
      {
        out << ",\"options\":";
        options_into_json(out, param.options);
      }
      else if (param.type == InjectableParamType::Selection)
      {
        out << ",\"dynamic\":" << (param.list_options ? "true" : "false");
      }
      out << '}';
    }
    out << ']';
    return out.str();
  }

  string options_to_json(const vector<InjectableParamOption>& options)
  {
    ostringstream out;

    options_into_json(out, options);
    return out.str();
  }
}
