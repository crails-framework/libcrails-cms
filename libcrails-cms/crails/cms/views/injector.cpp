#include "injector.hpp"
#include <iostream>

using namespace std;
using namespace Crails::Cms;

static string extract_attribute(const string_view content)
{
  size_t index = 0;
  string result;

  result.reserve(32);
  for (; content[index] != '"' && index < content.length() ; ++index)
    result += content[index];
  return result;
}

static int find_injection_end(const string& content)
{
  int index = content.find("</inject>");
  return index < 0 ? content.find("/>") + 3 : index + 9; 
}

static Crails::SharedVars import_injection_variables(string_view element, Crails::SharedVars vars)
{
  int variable_begin, variable_end;
  int variable_name_end;
  string variable_name, variable_value;

  while ((variable_begin = element.find(" data-")) >= 0)
  {
    element = element.substr(variable_begin + 6);
    variable_name_end = element.find("=\"");
    variable_name = element.substr(0, variable_name_end);
    element = element.substr(variable_name_end + 2);
    variable_end = element.find('"');
    variable_value = element.substr(0, variable_end);
    element = element.substr(variable_end);
    vars[variable_name] = variable_value;
  }
  return vars;
}

string Injector::inject(string content, Crails::SharedVars vars) const
{
  int index;

  while ((index = content.find("<inject")) >= 0)
  {
    int    end = find_injection_end(content);
    string element = content.substr(index, end - index);
    int    name_attribute_index = element.find("name=\"") + index + 6;
    string name = extract_attribute(string_view(&content[name_attribute_index], end - name_attribute_index));
    string injectable_content;

    vars = import_injection_variables(element, vars);
    injectable_content = generate_injection(name, vars);
    cout << "generate injection " << name << ' ' << std::any_cast<std::string>(vars.at("id")) << endl;
    content = content.substr(0, index) + injectable_content + content.substr(end);
    break ;
  }
  return content;
}

string Injector::generate_injection(const string_view name, const Crails::SharedVars& vars) const
{
  for (const auto& injectable : injectables)
  {
    if (injectable.matches(name))
      return injectable.run(vars);
  }
  return "<!-- injector " + string(name) + " not found !-->";
}

string Injector::run(string content, const Crails::SharedVars& vars)
{
  const Injector* injector = Injector::singleton::get();

  if (injector)
    return injector->inject(content, vars);
  return content;
}

void Injector::register_injectable(Injectable injectable)
{
  Injector* injector = Injector::singleton::get();

  if (injector)
    injector->add_injectable(injectable);
}

void Injector::add_injectable(Injectable injectable)
{
  injectables.push_back(injectable);
}

vector<string_view> Injector::available_injectors()
{
  vector<Injectable>::const_iterator it;
  vector<string_view> result;
  const Injector* injector = Injector::singleton::get();

  if (injector)
  {
    for (it = injector->injectables.begin() ; it != injector->injectables.end() ; ++it)
    {
      result.push_back(it->get_name());
    }
  }
  return result;
}

vector<string_view> Injector::find_params_for(const string_view name)
{
  const Injector* injector = Injector::singleton::get();

  if (injector)
    return injector->params_for(name);
  return {};
}

vector<string_view> Injector::params_for(const string_view name) const
{
  auto it = find(injectables.begin(), injectables.end(), name);

  if (it != injectables.end())
    return it->get_param_names();
  return {};
}
