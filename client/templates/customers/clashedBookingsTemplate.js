Template.clashedBookingsTemplate.created = function () {
 this.subscribe("clashedBookings");
 this.subscribe("clashedBookingCustomersByBookings");
 this.subscribe("clashedCustomersByBookings");
 Session.setTemp("showHidden", false);
};

Template.clashedBookingsTemplate.rendered = function () {
};

Template.clashedBookingsTemplate.helpers({
  clashHidden: function(e) {
    return Session.get("showHidden");
  },
  bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
  clashedBookingsExist: function() {
    if(Session.get("showHidden") == true) {
      return (BookingStatuses.findOne({type: "Booking", status: {$ne: "Void"}, clash: true}) != undefined);
    } else {
      return (BookingStatuses.findOne({type: "Booking", status: {$ne: "Void"}, clash: true, hide: false}) != undefined);
    }
    
  },
  numberOfClashedBookings: function() {
    return (BookingStatuses.find({status: {$ne: "Void"},   clash: true}).count());
  },
  hidden: function(e) {
    
    return this.hide;
  },
  clashedBookings: function() {
     if(Session.get("showHidden") == true) {
      return (BookingStatuses.find({type: "Booking", status: {$ne: "Void"}, clash: true}, {sort: {hide: -1}}));
    } else {
      return (BookingStatuses.find({type: "Booking", status: {$ne: "Void"}, clash: true, hide: false}));
    }
  },  
  redTransparent: function(e) {
    if(this.hide) {
      return "rgba(231, 76, 60, 0.15)";
    }
  },
clashedGroupId: function() {
    return (parseInt(this.id) + 1);
  },
  clashedPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});

Template.notifications.events({
  'click .showClash': function(event) {
    Meteor.call('showClash', event.currentTarget.id, function(error, result) {});
  },
  'click .hideClash': function(event) {
    Meteor.call('hideClash', event.currentTarget.id, function(error, result) {});
  },
});