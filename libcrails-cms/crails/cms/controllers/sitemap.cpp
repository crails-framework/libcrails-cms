#include "sitemap.hpp"
#include "../plugins.hpp"
#include <crails/logger.hpp>

using namespace std;
using namespace Crails;
using namespace Crails::Cms::SiteMap;

void Cms::SiteMap::Controller::as_json_request(Context& context, function<void()> callback)
{
  Controller* controller = singleton::get();
  std::string body;

  if (controller)
  {
    DataTree response;

    controller->indexes.merge(response.as_data());
    body = response.to_json();
    context.response.set_header("Content-Type", "application/json");
    context.response.set_body(body.c_str(), body.length());
    context.response.set_status_code(HttpStatus::ok);
  }
  else
  {
    context.response.set_body("", 0);
    context.response.set_status_code(HttpStatus::not_found);
  }
  context.response.send();
  callback();
}

void Cms::SiteMap::Controller::handle_request(Context& context, function<void()> callback)
{
  Controller* controller = singleton::get();

  if (controller)
  {
    Data index_param = context.params["index"];

    if (index_param.exists())
      controller->handle_urlset_request(context, index_param.as<string>());
    else
      controller->handle_sitemapindex_request(context);
  }
  else
  {
    context.response.set_body("", 0);
    context.response.set_status_code(HttpStatus::not_found);
    logger << Logger::Info << "Request for sitemap, but Cms::SiteMap::Controller singleton is not initialized" << Logger::endl;
  }
  context.response.send();
  callback();
}

void Cms::SiteMap::Controller::handle_robots_request(Crails::Context& context, const std::string prefix, std::function<void()> callback)
{
  Controller* controller = singleton::get();

  controller->handle_robots(context, prefix);
  context.response.send();
  callback();
}

void Cms::SiteMap::Controller::handle_robots(Crails::Context& context, const string& prefix) const
{
  auto settings = find_settings();
  string robots_txt;

  robots_txt = "Sitemap: https://" + settings->get_public_url() + '/' + prefix;
  context.response.set_status_code(HttpStatus::ok);
  context.response.set_body(robots_txt.c_str(), robots_txt.length());
}

void Cms::SiteMap::Controller::handle_urlset_request(Context& context, const string& index_name) const
{
  auto it = indexes.find(index_name);

  if (it != indexes.end())
  {
    auto settings = find_settings();

    context.response.set_status_code(HttpStatus::ok);
    it->second->render("https://" + settings->get_public_url(), context.response);
  }
  else
  {
    context.response.set_body("", 0);
    context.response.set_status_code(HttpStatus::not_found);
  }
}

void Cms::SiteMap::Controller::handle_sitemapindex_request(Context& context) const
{
  auto settings = find_settings();

  context.response.set_status_code(HttpStatus::ok);
  indexes.render("https://" + settings->get_public_url(), context.response);
}

void Cms::SiteMap::Controller::initialize_plugin_indexes()
{
  const auto* plugins = Plugins::singleton::get();

  if (plugins)
  {
    for (const string& plugin_name : plugins->get_plugin_names())
    {
      Plugin* plugin = plugins->get_plugin(plugin_name);
      unique_ptr<Index> index = plugin->sitemap_index();

      if (index)
        add_index(plugin_name, std::move(index));
    }
  }
}

void Cms::SiteMap::Controller::add_index(const string& name, unique_ptr<Index> index)
{
  indexes.emplace(name, std::move(index));
}
