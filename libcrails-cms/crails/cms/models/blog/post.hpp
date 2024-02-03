#pragma once
#include "../editable.hpp"
#include "../taggable.hpp"

namespace Crails::Cms
{
  class User;

  #pragma db object abstract
  class BlogPost : public Crails::Cms::Editable, public Crails::Cms::Taggable
  {
    friend class odb::access;
  public:
    static const std::string scope;
    static const std::string plural_scope;
    static const std::string view;

    template<typename QUERY>
    static QUERY default_order_by(QUERY query) { return query + "ORDER BY" + QUERY::publication_at; }

    template<typename QUERY>
    static QUERY make_index_query(Data params)
    {
      using namespace std;
      auto tag = params["tag"].template defaults_to<string>("");
      auto search = params["search"].template defaults_to<string>("");
      auto user_id = params["user"].template defaults_to<Crails::Odb::id_type>(ODB_NULL_ID);

      QUERY query(true);
      if (tag.length() && tag != "any")
        query = query && QUERY::tag_list.like("%\\%\\%" + tag + "\\%\\%%");
      if (search.length())
        query = query && (QUERY::title.like("%" + search + "%") || QUERY::description.like("%" + search + "%"));
      if (user_id != ODB_NULL_ID)
        query = query && (QUERY::author_id == user_id);
      return query;
    }

    template<typename QUERY>
    static QUERY make_next_query(const BlogPost& model)
    {
      QUERY query = QUERY::publication_at > model.get_publication_at();

      return query
             + "ORDER BY" + QUERY::publication_at + "ASC"
             + "LIMIT 1";
    }

    template<typename QUERY>
    static QUERY make_previous_query(const BlogPost& model)
    {
      QUERY query = QUERY::publication_at < model.get_publication_at();

      return query
             + "ORDER BY" + QUERY::publication_at + "DESC"
             + "LIMIT 1";
    }

    virtual void edit(Data) override;
    virtual void merge_data(Data) const override;

    void set_published(bool value) { published = value; }
    bool get_published() const { return published; }
    void set_publication_at(const std::time_t value) { publication_at = value; }
    std::time_t get_publication_at() const { return publication_at; }
    void set_author_id(Crails::Odb::id_type value) { author_id = value; }
    Crails::Odb::id_type get_author_id() const { return author_id; }
    std::shared_ptr<Crails::Cms::User> get_author() const { return t_author; }
    void set_author(const std::shared_ptr<Crails::Cms::User>& value);

    std::string slug_from_title(const std::string& title) const override;

  private:
    bool                     published = false;
    std::time_t              publication_at = 0;
    Crails::Odb::id_type     author_id;

    #pragma db transient
    std::shared_ptr<Crails::Cms::User> t_author;
  };
}
