#include "controller.hpp"
#include "../views/layout.hpp"

using namespace Crails;
using namespace Crails::Cms;
using namespace std;

static string find_scheme(const HttpRequest& request)
{
  HttpRequest::const_iterator header;

  header = request.find("HTTP_X_FORWARDED_PROTO");
  if (header != request.end())
    return header->value().data();
  else
  {
    header = request.find("HTTP_X_FORWARDED_SSL");
    if (header != request.end())
      return header->value() == "on" ? "https" : "http";
  }
  return "http";
}

static const map<HttpStatus, string> views{
  {HttpStatus::not_found,    "errors/not_found"},
  {HttpStatus::forbidden,    "errors/forbidden"},
  {HttpStatus::unauthorized, "errors/unauthorized"}
};

void Crails::Cms::Controller::respond_with(HttpStatus status)
{
  auto view = views.find(status);

  if (view != views.end())
  {
    response.set_status_code(status);
    render(view->second);
  }
  else
    Super::respond_with(status);
}

void Crails::Cms::Controller::initialize()
{
  Super::initialize();
  find_settings();
  if (settings)
  {
    const string& public_url = settings->get_public_url();
    const string target(request.target().data(), request.target().length());

    vars["settings"] = const_cast<const Cms::Settings*>(settings.get());
    if (public_url.length())
      vars["canonical_url"] = "https://" + public_url + target;
  }
  vars["render_footer"] = true;
}

void Crails::Cms::Controller::prepare_open_graph()
{
  vars["open_graph"] = const_cast<const Crails::Cms::OpenGraph*>(&open_graph);
  if (settings)
  {
    open_graph.site_name = settings->get_title();
    open_graph.url = settings->get_public_url();
    open_graph.locales.push_back(settings->get_default_locale());
  }
}

void Crails::Cms::Controller::prepare_open_graph(const Crails::Cms::Editable& editable)
{
  string scheme = find_scheme(request);

  prepare_open_graph();
  open_graph.type = Crails::Cms::OpenGraph::ArticleType;
  open_graph.title = editable.get_title();
  open_graph.description = editable.get_description();
  open_graph.url = scheme + "://" + open_graph.url + params["uri"].as<std::string>();
  open_graph.image = editable.get_thumbnail_url();
  if (settings && open_graph.image.length() && open_graph.image[0] == '/')
    open_graph.image = scheme + "://" + settings->get_public_url() + open_graph.image;
}
