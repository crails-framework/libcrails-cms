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

    void fetch()
    {
      Super::database.commit();
      Super::async_http_query(
        Crails::Url::from_string(Super::params["url"]),
	std::bind(&OpenGraphController::fetched, this, std::placeholders::_1, std::placeholders::_2)
      );
    }

  private:
    void fetched(const Crails::HttpResponse& response, boost::beast::error_code)
    {
      Super::render(Super::HTML, response.body());
    }
  };
}
