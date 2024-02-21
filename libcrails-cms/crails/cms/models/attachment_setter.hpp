#pragma once
#include <memory>
#include <string_view>
#include <filesystem>
#include <crails/odb/connection.hpp>

template<typename MODEL>
void set_attachment_from_url(std::shared_ptr<MODEL>& model, const std::string_view url)
{
  using namespace std;

  if (!model || url != model->as_attachment().get_url())
  {
    Crails::Odb::ConnectionHandle database;
    filesystem::path filename = filesystem::path(url).filename().stem();

    if (filename.empty())
      model = nullptr;
    else
      database.find_one(model, odb::query<MODEL>::resource.like(filename.string() + '%'));
  }
}
