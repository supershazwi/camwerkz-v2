Template.packBookingsTemplate.created = function () {
 this.subscribe("packBookings");
 this.subscribe("packBookingCustomersByBookings");
 this.subscribe("packCustomersByBookings");
};

Template.packBookingsTemplate.rendered = function () {
};

Template.packBookingsTemplate.helpers({
  packBookings: function() {
    return BookingStatuses.find({type: "Booking", status: {$ne: "Void"}, packed: false}).fetch();
  },
  bookingCustomer: function() {
    return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this.invoiceId}).customerId});
  },
 packGroupId: function() {
    return (parseInt(this.id) + 1);
  },
 packPrintedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  }
});