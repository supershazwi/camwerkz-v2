Template.uncollectedBookingsTemplate.created = function () {
 this.subscribe("uncollectedBookings");
 this.subscribe("uncollectedBookingCustomersByBookings");
 this.subscribe("uncollectedCustomersByBookings");
};

Template.uncollectedBookingsTemplate.rendered = function () {
};

Template.uncollectedBookingsTemplate.helpers({
  uncollectedBookings: function() {
    return BookingStatuses.find({type: "Booking", status: {$ne: "Void"}, uncollected: true}).fetch();
  },
  uncollectedGroupId: function() {
    return (parseInt(this.id) + 1);
  },
   bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
  uncollectedPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});