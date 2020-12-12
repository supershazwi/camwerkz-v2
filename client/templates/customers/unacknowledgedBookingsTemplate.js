Template.unacknowledgedBookingsTemplate.created = function () {
 this.subscribe("unacknowledgedBookings");
 this.subscribe("unacknowledgedBookingCustomersByBookings");
 this.subscribe("unacknowledgedCustomersByBookings");
};

Template.unacknowledgedBookingsTemplate.rendered = function () {
};

Template.unacknowledgedBookingsTemplate.helpers({
  bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
 unacknowledgedBookingsExist: function() {
   return (BookingStatuses.findOne({type: "Booking", acknowledged: false, status: {$ne: "Void"}}) != undefined);
 },
 unacknowledgedBookings: function() {
   return BookingStatuses.find({type: "Booking", acknowledged: false, status: {$ne: "Void"}});
 },
unacknowledgedGroupId: function() {
    return (parseInt(this.id) + 1);
  },
unacknowledgedPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});