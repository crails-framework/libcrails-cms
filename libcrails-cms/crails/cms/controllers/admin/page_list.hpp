#pragma once
#include "../admin.hpp"
#include "../../page_list.hpp"

namespace Crails::Cms
{
  template<typename USER, typename SUPER>
  class AdminPageListController : public AdminController<USER, SUPER>
  {
    typedef AdminController<USER, SUPER> Super;
  public:
    AdminPageListController(Crails::Context& context) : Super(context)
    {
    }

    void index()
    {
      using namespace std;
      const PageList* pages = PageList::singleton::get();

      if (page_list)
      {
        DataTree result;

        result.from_map(pages->list());
        render(JSON, result.as_data());
      }
    }
  };
}
