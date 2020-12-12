Template.repairSearch.rendered = function() {
  Session.setTemp('searchRepairQuery', '');
}

Tracker.autorun(function() {
  if (Session.get('searchRepairQuery')) {
    Meteor.subscribe('repairSearch', Session.get('searchRepairQuery'));
  }
});

Template.repairSearch.events({
  'keyup input': function (event, template) {
    Session.setTemp('searchRepairQuery', event.target.value);
  },

  'click a': function (event, template) {
    IonModal.close();
  }
});

Template.repairSearch.helpers({
  repairs: function() {
    return Repairs.search(Session.get('searchRepairQuery'));
  },
  searchRepairQuery: function() {
    return Session.get('searchRepairQuery');
  }
});
