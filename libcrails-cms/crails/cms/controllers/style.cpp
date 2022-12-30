#include "style.hpp"
#include "../views/style.hpp"

using namespace Crails::Cms;

StyleController::StyleController(Crails::Context& context) : Crails::Controller(context)
{
}

void StyleController::show()
{
  const auto* style = Style::singleton::get();

  if (style)
    render(JSON, style->as_data());
  else
    respond_with(Crails::HttpStatus::internal_server_error);
}
