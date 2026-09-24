#include "injectable.hpp"
#include <crails/http.hpp>
#include <crails/logger.hpp>

using namespace std;
using namespace Crails;
using namespace Crails::Cms;
    
Injectable::Injectable(Crails::Odb::Connection& database, const Crails::SharedVars& vars, Crails::RenderTarget& sink) : vars(vars), sink(sink), database(database)
{
  this->vars.erase("layout");
}

void Injectable::render(const std::string_view view, Crails::SharedVars local_vars)
{
  local_vars = Crails::merge(local_vars, vars);
  renderer = Crails::Renderer::pick_renderer(string(view), formats);
  if (renderer)
    renderer->render_template(string(view), sink, local_vars);
  else
  {
    logger << Logger::Debug << "Injectable::render failed: no renderer found for " << view << " with format " << formats << Logger::endl;
    render_text("<!-- injectable: no suitable renderer not found -->");
  }
}

void Injectable::render_text(const std::string_view text)
{
  sink.set_header("Content-Type", "text/plain");
  sink.set_body(text);
}
