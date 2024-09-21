#include "sitemap.hpp"
#include "../plugins.hpp"
#include <crails/logger.hpp>

using namespace std;
using namespace Crails;
using namespace Crails::Cms::SiteMap;

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
    context.response.set_status_code(HttpStatus::not_found);
    logger << Logger::Info << "Request for sitemap, but Cms::SiteMap::Controller singleton is not initialized" << Logger::endl;
  }
  context.response.send();
  callback();
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
    context.response.set_status_code(HttpStatus::not_found);
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
