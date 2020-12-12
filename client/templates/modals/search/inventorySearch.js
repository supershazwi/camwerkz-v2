Template.inventorySearch.rendered = function() {
  Session.setTemp('searchInventoryQuery', '');
}

Tracker.autorun(function() {
  if (Session.get('searchInventoryQuery')) {
    Meteor.subscribe('inventorySearch', Session.get('searchInventoryQuery'));
  }
});

Template.inventorySearch.events({
  'keyup input': function (event, template) {
    Session.setTemp('searchInventoryQuery', event.target.value);
  },

  'click a': function (event, template) {
    IonModal.close();
  }
});

Template.inventorySearch.helpers({
  inventory: function() {
    return Inventory.search(Session.get('searchInventoryQuery'));
  },
  searchInventoryQuery: function() {
    return Session.get('searchInventoryQuery');
  }
});
