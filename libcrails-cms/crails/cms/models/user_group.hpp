#pragma once
#include <crails/odb/model.hpp>
#include <crails/datatree.hpp>
#include <crails/utils/arrays.hpp>

namespace Crails::Cms
{
  class GroupUser;

  #pragma db object
  class UserGroup : public Crails::Odb::Model
  {
    friend class odb::access;
    friend class GroupUser;
  public:
    static const std::string scope;
    static const std::string plural_scope;
    static const std::string view;

    template<typename QUERY>
    static QUERY default_order_by(QUERY query) { return query + "ORDER BY" + QUERY::name; }

    virtual void edit(Data);
    void merge_data(Data) const;
    std::string to_json() const;
    void before_save() override;
    void after_destroy() override;

    const std::string& get_name() const { return name; }
    void set_name(const std::string& value) { name = value; }
    unsigned long get_flag() const { return flag; }

  protected:
    virtual unsigned long find_available_flag() const = 0;
    virtual void purge_flag() const = 0;
  private:
    std::string   name;
    unsigned long flag;
  };

  template<typename GROUP_LIST>
  unsigned long permission_flag_for_groups(const GROUP_LIST& list)
  {
    unsigned long result = 0;

    for (unsigned long flag : Crails::collect(list, &UserGroup::get_flag))
      result |= flag;
    return result;
  }

  template<typename GROUP>
  class UserPermissions
  {
    typedef std::vector<std::shared_ptr<GROUP>> List;
    List& groups;

    static bool compare(const UserGroup& group, const std::shared_ptr<UserGroup>& candidate)
    {
      return group.get_id() == candidate->get_id();
    }
  public:
    UserPermissions(List& list) : groups(list) {}

    unsigned long get_group_flag() const
    {
      return permission_flag_for_groups(groups);
    }

    template<typename LIST>
    void set_groups(LIST& list)
    {
      groups.clear();
      for (const auto& group : list)
        groups.push_back(std::make_shared<GROUP>(group));
    }

    void add_group(const std::shared_ptr<GROUP>& group)
    {
      if (!has_group(group))
        groups.push_back(group);
    }

    void remove_group(const std::shared_ptr<GROUP>& group)
    {
      remove_group(*group);
    }

    void remove_group(const GROUP& group)
    {
      auto func = std::bind(&compare, std::ref(group), std::placeholders::_1);
      std::remove_if(groups.begin(), groups.end(), func);
    }

    bool has_group(const std::shared_ptr<GROUP>& group)
    {
      return has_group(*group);
    }

    bool has_group(const GROUP& group) const
    {
      auto func = std::bind(&compare, std::ref(group), std::placeholders::_1);
      return std::find_if(groups.begin(), groups.end(), func) != groups.end();
    }
  };
}
