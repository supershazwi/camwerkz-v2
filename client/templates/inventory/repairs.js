Template.repairs.created = function () {
  Meteor.subscribe('repairs');
};

Template.repairs.rendered = function () {
};

Template.repairs.events({
  'click #items': function(event, template) {
    Router.go('inventory');
  },
  'click #packages': function(event, template) {
    Router.go('packages');
  },
  'click .inventoryItem': function(event, template) {
    var string = event.currentTarget.id.split("_");
    Router.go('inventoryItem.show', {_id: string[0]}, {});
  }
});

Template.repairs.helpers({
  repairs: function () {
    return Repairs.find({}, {sort: {createdAt: 1}});
  },
  repairsExist: function() {
    if(Repairs.find().fetch().length == 0)
      return true;
    else
      return false;
  },
  sentForRepairsExist: function() {
    return (Repairs.find({status: "Sent For Repair"}).fetch().length > 0);
  },
  sentForRepairs: function() {
    return Repairs.find({status: "Sent For Repair"});
  },
  damagedExist: function() {
    return (Repairs.find({status: "Damaged"}).fetch().length > 0);
  },
  damaged: function() {
    return Repairs.find({status: "Damaged"});
  },
  missingExist: function() {
    return (Repairs.find({status: "Missing"}).fetch().length > 0);
  },
  missing: function() {
    return Repairs.find({status: "Missing"});
  }
});