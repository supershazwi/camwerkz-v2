BookingOverbooked = new Mongo.Collection('bookingoverbooked');

Meteor.methods({
	overbookedDone: function(invoiceId) {
		console.log("overbookedDone");
		var bookingOverbooked = BookingOverbooked.findOne({invoiceId: invoiceId});

	      bookingOverbooked.status = "Overbooked Checked";

	      var boid = bookingOverbooked._id;
	      delete bookingOverbooked._id;
	      BookingOverbooked.update({_id: boid}, {$set: bookingOverbooked});
	  },
	  overbookedOK: function(invoiceId) {
		console.log("overbookedOK");
		var bookingOverbooked = BookingOverbooked.findOne({invoiceId: invoiceId});

	      bookingOverbooked.status = "OK";

	      var boid = bookingOverbooked._id;
	      delete bookingOverbooked._id;
	      BookingOverbooked.update({_id: boid}, {$set: bookingOverbooked});
	}
})
