Template.privilegeSearch.rendered = function() {
  Session.setTemp('searchPrivilegeQuery', '');
}

Tracker.autorun(function() {
  if (Session.get('searchPrivilegeQuery')) {
    Meteor.subscribe('privilegesSearch', Session.get('searchPrivilegeQuery'));
  }
});

Template.privilegeSearch.events({
  'keyup input': function (event, template) {
    Session.setTemp('searchPrivilegeQuery', event.target.value);
  },

  'click a': function (event, template) {
    IonModal.close();
  }
});

Template.privilegeSearch.helpers({
  privileges: function() {
    return Privileges.search(Session.get('searchPrivilegeQuery'));
  },
  searchPrivilegeQuery: function() {
    return Session.get('searchPrivilegeQuery');
  }
});
