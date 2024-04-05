#pragma once
#include <crails/odb/connection.hpp>
#include <crails/params.hpp>

namespace Crails::Cms
{
  template<typename MODEL>
  bool sort_model_action(Crails::Params& params, odb::query<MODEL> criteria = odb::query<MODEL>(true))
  {
    Crails::Odb::ConnectionHandle database;
    std::shared_ptr<MODEL> model;

    if (database.find_one(model, criteria && odb::query<MODEL>::id == params["row-id"].as<Crails::Odb::id_type>()))
    {
      unsigned int current_position = model->get_order();
      unsigned int new_position = params["position"].defaults_to<unsigned int>(0);
      odb::result<MODEL> to_move;

      if (current_position > new_position)
      {
        database.find<MODEL>(to_move, criteria && odb::query<MODEL>::order >= new_position && odb::query<MODEL>::order < current_position);
        for (MODEL moving_model : to_move)
        {
          moving_model.set_order(moving_model.get_order() + 1);
          database.save(moving_model);
        }
      }
      else if (current_position < new_position)
      {
        database.find<MODEL>(to_move, criteria && odb::query<MODEL>::order > current_position && odb::query<MODEL>::order <= new_position);
        for (MODEL moving_model : to_move)
        {
          moving_model.set_order(moving_model.get_order() - 1);
          database.save(moving_model);
        }
      }
      else
      {
        return true;
      }
      model->set_order(new_position);
      database.save(*model);
      database.commit();
      return true;
    }
    return false;
  };
}
