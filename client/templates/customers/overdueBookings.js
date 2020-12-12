Template.overdueBookingsTemplate.created = function () {
 this.subscribe("overdueBookings");
 this.subscribe("overdueBookingCustomersByBookings");
 this.subscribe("overdueCustomersByBookings");
};

Template.overdueBookingsTemplate.rendered = function () {
};

Template.overdueBookingsTemplate.helpers({
  overdueBookings: function() {
    return BookingStatuses.find({type: "Booking", status: {$ne: "Void"}, overdue: true}).fetch();
  },
  bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
  overdueGroupId: function() {
    return (parseInt(this.id) + 1);
  },
  overduePrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});