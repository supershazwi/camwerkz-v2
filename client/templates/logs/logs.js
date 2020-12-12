Template.logs.created = function () {
  Meteor.subscribe('logs', Meteor.user()._id);
};

Template.logs.rendered = function () {
};

Template.logs.helpers({
  booking: function() {
    if(this.type == "bookings") {
      return true;
    } else {
      return false;
    }
  },
  other: function() {
    if(this.type == "others") {
      return true;
    } else {
      return false;
    }
  },
  quotation: function() {
    if(this.type == "quotations") {
      return true;
    } else {
      return false;
    }
  },
  customer: function() {
    if(this.type == "customers") {
      return true;
    } else {
      return false;
    }
  },
  privilege: function() {
    if(this.type == "privileges") {
      return true;
    } else {
      return false;
    }
  },
  customerPackage: function() {
    if(this.type == "customerPackages") {
      return true;
    } else {
      return false;
    }
  },
  inventory: function() {
    if(this.type == "inventoryItem") {
      return true;
    } else {
      return false;
    }
  },
  createdAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  logs: function() {
    var logs = Logs.find({}, {sort: {createdAt: -1}}).fetch();
    return logs;
  }
});

Template.logs.events({
});