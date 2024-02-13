#include "time.hpp"
#include <iomanip>
#include <ctime>
#include <sstream>
#include <crails/logger.hpp>

using namespace std;
using namespace Crails;

// The %F specifier is documented in cplusplus.com, but not
// cppreference.com. It works on cpp.sh, but not with g++12
// or clang++14.
//static const char* form_date_format = "%FT%H:%M";
static const char* form_date_format = "%Y-%m-%dT%H:%M";

string time_to_string(std::time_t value, const string& format)
{
  return time_to_string(value, format.c_str());
}

string time_to_string(std::time_t value, const char* format)
{
  std::tm tmdata;
  stringstream stream;

  localtime_r(&value, &tmdata);
  stream << put_time(&tmdata, format ? format : "%d-%m-%y");
  return stream.str();
}

time_t string_to_time(std::time_t value, const string& format) { return string_to_time(value, format.c_str()); }

time_t string_to_time(const std::string& value, const char* format)
{
  std::istringstream stream(value.c_str());
  std::tm tm{0};

  stream >> std::get_time(&tm, format);
  if (stream.fail())
  {
    logger << Logger::Debug << "Failed to parse date `" << value << "` using format `" << format << '`' << Logger::endl;
    return 0;
  }
  return mktime(&tm);
}

string time_to_form_value(time_t value)
{
  return time_to_string(value, form_date_format);
}

time_t time_from_form_value(const string& value)
{
  return string_to_time(value, form_date_format);
}
