Template.items.created = function () {
  Meteor.subscribe('inventoryByCategory', Session.get('category'))
};

Template.items.rendered = function () {
};

Template.items.helpers({
  items: function () {
    return Inventory.find({brand: Session.get('brand'), category: Session.get('category')}, {sort: {item: 1}});
  },
  category: function () {
    return Session.get('category');
  },
  brand: function() {
    return Session.get('brand');
  }
});

Template.items.events({
  
});