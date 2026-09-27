#pragma once
#include "../admin.hpp"
#include <crails/controller/query.hpp>

namespace Crails::Cms
{
  template<typename USER, typename SUPER>
  class OpenGraphController : public Crails::QueryController<AdminController<USER, SUPER>>
  {
    typedef Crails::QueryController<AdminController<USER, SUPER>> Super;
  public:
    OpenGraphController(Crails::Context& context) : Super(context)
    {
    }

    boost::asio::awaitable<void> fetch()
    {
      Super::database.commit();
      Crails::ClientInterface::Response response = co_await Super::co_http_query(
        Crails::Url::from_string(Super::params["url"].template as<std::string>())
      );
      Super::render(Super::HTML, response.body());
    }
  };
}
