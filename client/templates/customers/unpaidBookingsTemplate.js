Template.unpaidBookingsTemplate.created = function () {
 this.subscribe("unpaidBookings");
 this.subscribe("unpaidBookingCustomersByBookings");
 this.subscribe("unpaidCustomersByBookings");
};

Template.unpaidBookingsTemplate.rendered = function () {
};

Template.unpaidBookingsTemplate.helpers({
  unpaidBookings: function() {
    return BookingStatuses.find({status: {$ne: "Void"}, unpaid: true}).fetch();
  },
  bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
  unpaidGroupId: function() {
    return (parseInt(this.id) + 1);
  },
  unpaidPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});