Template.makeBooking.created = function () {
  this.autorun(function () {
    this.subscription = Meteor.subscribe('customers');
  }.bind(this));
};

Template.makeBooking.rendered = function () {
  this.autorun(function () {
    if (!this.subscription.ready()) {
      IonLoading.show();
    } else {
      IonLoading.hide();
    }
  }.bind(this));
};

Template.makeBooking.helpers({
  customer: function () {
    return Session.get("customer");
  },
  dateTime: function() {
    return moment().format('Do MMMM YYYY, h:mma');
  }
});

Template.makeBooking.events({
  'click #addBookingItem': function(e) {
    e.preventDefault();
  },
  'click .itemCheckbox': function(e) {
    var id = e.currentTarget.id;
    var checkboxClicked = id.slice(-4);
    if(checkboxClicked == "_out") {
      var array = id.split("_");
      document.getElementById("item_"+array[1]+"_back").checked=false;
    } else {
      var array = id.split("_");
      document.getElementById("item_"+array[1]+"_out").checked=false;
    }
  }
});