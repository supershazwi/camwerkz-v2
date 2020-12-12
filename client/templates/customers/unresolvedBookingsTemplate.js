Template.unresolvedBookingsTemplate.created = function () {
 this.subscribe("unresolvedBookings");
 this.subscribe("unresolvedBookingCustomersByBookings");
 this.subscribe("unresolvedCustomersByBookings");
};

Template.unresolvedBookingsTemplate.rendered = function () {
};

Template.unresolvedBookingsTemplate.helpers({
  unresolvedBookingsExist: function() {
    return (BookingStatuses.findOne({type: "Booking", resolved: false, status: {$ne: "Void"}}) != undefined);
  },
   bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
  unresolvedBookings: function() {
    return BookingStatuses.find({type: "Booking", resolved: false, status: {$ne: "Void"}});
  },
  unresolvedGroupId: function() {
    return (parseInt(this.id) + 1);
  },
  unresolvedPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});