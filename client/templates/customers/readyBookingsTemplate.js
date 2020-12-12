Template.readyBookingsTemplate.created = function () {
 this.subscribe("readyBookings");
 this.subscribe("readyBookingCustomersByBookings");
 this.subscribe("readyCustomersByBookings");
};

Template.readyBookingsTemplate.rendered = function () {
};

Template.readyBookingsTemplate.helpers({
  readyBookings: function() {
    return BookingStatuses.find({type: "Booking", status: {$ne: "Void"}, packed: true, collected: false}).fetch();
  },
   bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
  readyGroupId: function() {
    return (parseInt(this.id) + 1);
  },
  readyPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});