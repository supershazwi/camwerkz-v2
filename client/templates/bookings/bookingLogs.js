Template.bookingLogs.created = function () {
	this.subscribe("logsByBooking", Router.current().params._id);
	this.subscribe('bookingstatusesbybooking', Router.current().params._id);
};

Template.bookingLogs.rendered = function () {

};

Template.bookingLogs.helpers({
  bookingLogs: function () {
    var bookingLogs = BookingLogs.findOne({invoiceId: Router.current().params._id});
    return bookingLogs.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  },
  thisIsBooking: function() {
    if(BookingStatuses.findOne({invoiceId: Router.current().params._id}) != undefined) {
      if(BookingStatuses.findOne({invoiceId: Router.current().params._id}).type == "Booking") {
        return true;
      }
    }
  },
  thisIsQuotation: function() {
    if(BookingStatuses.findOne({invoiceId: Router.current().params._id}) != undefined) {
      if(BookingStatuses.findOne({invoiceId: Router.current().params._id}).type == "Quotation") {
        return true;
      }
    }
  }
});

Template.bookingLogs.events({
 
});