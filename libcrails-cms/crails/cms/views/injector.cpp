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

static int find_injection_end(const string_view content)
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

struct InjectionLock
{
  InjectionLock()
  {
    already_locked = injecting;
    injecting = true;
  }

  ~InjectionLock()
  {
    if (!already_locked)
      injecting = false;
  }

  static thread_local bool injecting;
  bool already_locked = false;
};

thread_local bool InjectionLock::injecting = false;

string Injector::inject(const string_view content, Crails::SharedVars vars) const
{
  InjectionLock lock;
  int index = 0;
  int last_index = 0;
  unsigned short injection_count = 0;
  ostringstream output;
  Crails::RenderStream render_target(output);

  vars.erase("layout");
  while ((index = content.find("<inject", index)) >= 0)
  {
    unique_ptr<Injectable> injectable;
    int         end = last_index + find_injection_end(content.substr(last_index));
    string_view element = content.substr(index, end - index);
    int         name_attribute_index = element.find("name=\"") + index + 6;
    string      name = extract_attribute(string_view(&content[name_attribute_index], end - name_attribute_index));

    vars = import_injection_variables(element, vars);
    injectable = generate_injectable(name, vars, render_target);
    output << content.substr(last_index, index - last_index);
    if (!injectable)
    {
      output << "<!-- injectable " << name << " not found !-->";
    }
    else if (!lock.already_locked)
    {
      injectable->run();
    }
    else
    {
      output << "<!-- nested injections are not allowed --!>";
    }
    index = last_index = end;
    if (injection_count++ > 150)
    {
      throw boost_ext::runtime_error("max injection count reached");
    }
  }
  output << content.substr(last_index);
  return output.str();
}

unique_ptr<Injectable> Injector::generate_injectable(const std::string_view name, const Crails::SharedVars& vars, Crails::RenderTarget& sink) const
{
  auto it = find(injectables.begin(), injectables.end(), name);

  if (it != injectables.end())
  {
    auto ptr = it->create(vars, sink);

    ptr->injecting = true;
    return move(ptr);
  }
  return nullptr;
}

string Injector::run(const string_view content, const Crails::SharedVars& vars)
{
  const Injector* injector = Injector::singleton::get();

  if (injector)
    return injector->inject(content, vars);
  return string(content);
}

void Injector::register_injectable(InjectableTraits injectable)
{
  Injector* injector = Injector::singleton::get();

  if (injector)
    injector->add_injectable(injectable);
}

void Injector::add_injectable(InjectableTraits injectable)
{
  injectables.push_back(injectable);
}

vector<string_view> Injector::available_injectors()
{
  vector<InjectableTraits>::const_iterator it;
  vector<string_view> result;
  const Injector* injector = Injector::singleton::get();

  if (injector)
  {
    for (it = injector->injectables.begin() ; it != injector->injectables.end() ; ++it)
      result.push_back(it->name);
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
    return it->param_names;
  return {};
}
