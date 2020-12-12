BookingProjects = new Mongo.Collection('bookingprojects');

Meteor.methods({
	updateBookingProjectName: function(details) {
		BookingProjects.update({invoiceId: details['_id']}, {$set:{projectName: details['projectName']}});
	}
})