Template.bookingLog.created = function () {
};

Template.bookingLog.rendered = function () {
	$('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
};

Template.bookingLog.helpers({
  logs: function () {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    return booking.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.bookingLog.events({
 
});