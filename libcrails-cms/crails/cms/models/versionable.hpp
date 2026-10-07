#pragma once
namespace odb { class access; }

namespace Crails::Cms
{
  /*
   * Mixin that makes an Editable versionable:
   *
   *   class Page : public Editable, public Versionable { ... };
   *
   * The columns of the versioned model always hold the content that is visible
   * to visitors (the "current" version), so public controllers, queries and
   * sitemaps keep working untouched. Older (and newer) states live in a
   * Version table, see version.hpp and versioning.hpp.
   *
   * Version numbers start at 1. 0 means "no version recorded yet", which is
   * the state of every object created before versioning was enabled.
   */
  #pragma db object abstract
  class Versionable
  {
    friend class odb::access;
  public:
    virtual ~Versionable() = default;

    bool has_versions() const { return last_version > 0; }

    // The version visible to visitors
    unsigned int get_current_version() const { return current_version; }
    void set_current_version(unsigned int value) { current_version = value; }

    unsigned int get_last_version() const { return last_version; }
    unsigned int allocate_version_number() { return ++last_version; }

  protected:
    unsigned int current_version = 0;
    unsigned int last_version = 0;
  };
}
