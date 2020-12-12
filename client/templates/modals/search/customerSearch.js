Template.customerSearch.rendered = function() {
  Session.setTemp('searchCustomerQuery', '');
}

Tracker.autorun(function() {
  if (Session.get('searchCustomerQuery')) {
    Meteor.subscribe('customersSearch', Session.get('searchCustomerQuery'));
  }
});

Template.customerSearch.events({
  'keyup input': function (event, template) {
    Session.setTemp('searchCustomerQuery', event.target.value);
  },

  'click a': function (event, template) {
    IonModal.close();
  }
});

Template.customerSearch.helpers({
  customers: function() {
    return Customers.search(Session.get('searchCustomerQuery'));
  },
  searchCustomerQuery: function() {
    return Session.get('searchCustomerQuery');
  }
});
