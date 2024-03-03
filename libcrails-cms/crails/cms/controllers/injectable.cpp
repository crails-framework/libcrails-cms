#include "injectable.hpp"
#include <crails/http.hpp>

using namespace std;
using namespace Crails::Cms;
    
Injectable::Injectable(const Crails::SharedVars& vars, Crails::RenderTarget& sink) : vars(vars), sink(sink)
{
}

void Injectable::render(const std::string_view view, Crails::SharedVars local_vars)
{
  local_vars = Crails::merge(local_vars, vars);
  renderer = Crails::Renderer::pick_renderer(string(view), "text/html");
  renderer->render_template(string(view), sink, local_vars);
}

void Injectable::render_text(const std::string_view text)
{
  sink.set_header("Content-Type", "text/plain");
  sink.set_body(text);
}
