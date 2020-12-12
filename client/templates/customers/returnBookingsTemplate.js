Template.returnBookingsTemplate.created = function () {
 this.subscribe("returnBookings");
 this.subscribe("returnBookingCustomersByBookings");
 this.subscribe("returnCustomersByBookings");
};

Template.returnBookingsTemplate.rendered = function () {
};

Template.returnBookingsTemplate.helpers({
  returnBookings: function() {
    return BookingStatuses.find({type: "Booking", status: {$ne: "Void"}, return: true}).fetch();
  },
  bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
  returnGroupId: function() {
    return (parseInt(this.id) + 1);
  },
  returnPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});