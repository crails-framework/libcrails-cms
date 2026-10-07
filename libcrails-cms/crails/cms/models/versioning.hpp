#pragma once
#include "versionable.hpp"
#include "version.hpp"

#if !defined(ODB_COMPILER)
# include "user.hpp"
# include <crails/odb/connection.hpp>
# include <ctime>
# include <memory>
# include <vector>
# include <type_traits>

namespace Crails::Cms
{
  /*
   * Database-side operations for versioned resources.
   *
   * MODEL must be an Editable that also inherits Versionable.
   * VERSION must be the concrete Version class of that resource.
   *
   * None of these methods commit anything on their own: the caller decides
   * when the model and its versions get saved.
   */
  template<typename MODEL, typename VERSION>
  class Versioning
  {
    static_assert(std::is_base_of<Versionable, MODEL>::value, "Versioned models must inherit Crails::Cms::Versionable");
    static_assert(std::is_base_of<Version, VERSION>::value, "Version models must inherit Crails::Cms::Version");

    typedef odb::query<VERSION> Query;
  public:
    Versioning(Crails::Odb::Connection& database) : database(database)
    {
    }

    std::shared_ptr<VERSION> find(const MODEL& model, unsigned int number)
    {
      std::shared_ptr<VERSION> version;

      if (number > 0 && model.is_persistent())
        database.find_one(version, Query::resource_id == model.get_id() && Query::number == number);
      return version;
    }

    // Newest first
    VersionSummaries list(const MODEL& model)
    {
      VersionSummaries summaries;

      if (model.is_persistent())
      {
        odb::result<VERSION> results;

        database.template find<VERSION>(
          results,
          (Query::resource_id == model.get_id()) + "ORDER BY" + Query::number + "DESC"
        );
        for (VERSION version : results)
          summaries.push_back(version.summarize());
      }
      return summaries;
    }

    DataTree snapshot(const MODEL& model) const
    {
      DataTree data;

      model.merge_data(data);
      return data;
    }

    // Overwrites the model's content in memory with the version's. Does not save.
    void apply(MODEL& model, const VERSION& version) const
    {
      model.edit(version.get_data());
    }

    /*
     * Allocates a version number for the model's present content and marks it
     * as the current version. Nothing is persisted: save the model first
     * (it needs an id), then call commit() on the returned version.
     */
    std::unique_ptr<VERSION> prepare(MODEL& model, const User* author = nullptr) const
    {
      auto version = std::make_unique<VERSION>();

      version->set_number(model.allocate_version_number());
      version->set_data(snapshot(model));
      version->set_recorded_at(std::time(nullptr));
      if (author)
      {
        version->set_author_id(author->get_id());
        version->set_author_name(author->get_display_name());
      }
      model.set_current_version(version->get_number());
      return version;
    }

    void commit(const MODEL& model, VERSION& version)
    {
      version.set_resource_id(model.get_id());
      database.save(version);
    }

    /*
     * Removes one version. The current version can't be removed: returns false
     * in that case, as well as when the version doesn't exist.
     */
    bool destroy(const MODEL& model, unsigned int number)
    {
      if (number == model.get_current_version())
        return false;

      std::shared_ptr<VERSION> version = find(model, number);

      if (version)
      {
        database.destroy(*version);
        return true;
      }
      return false;
    }

    /*
     * Removes the oldest versions until at most `max` remain, not counting the
     * current version, which is never removed whatever its age.
     * A `max` of 0 means unlimited.
     */
    void prune(const MODEL& model, unsigned int max)
    {
      if (max == 0 || !model.is_persistent())
        return ;

      odb::result<VERSION> results;
      std::vector<VERSION> candidates;

      database.template find<VERSION>(
        results,
        (Query::resource_id == model.get_id() && Query::number != model.get_current_version())
          + "ORDER BY" + Query::number + "ASC"
      );
      for (VERSION version : results)
        candidates.push_back(version);
      for (std::size_t i = 0 ; i + max < candidates.size() ; ++i)
        database.destroy(candidates[i]);
    }

    void destroy_all(const MODEL& model)
    {
      if (model.is_persistent())
      {
        odb::result<VERSION> results;

        database.template find<VERSION>(results, Query::resource_id == model.get_id());
        for (VERSION version : results)
          database.destroy(version);
      }
    }

  private:
    Crails::Odb::Connection& database;
  };
}
#endif
