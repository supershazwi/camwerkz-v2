BookingLogs = new Mongo.Collection('bookinglogs');

if (Meteor.isServer) {
	Meteor.methods({
		insertLog: function(details) {
			this.unblock();

			var bookingLog = BookingLogs.findOne({invoiceId: details['_id']});

			var logObject = new Object();

			logObject.content = details['content'];
			logObject.owner = details['ownerUsername'];
			logObject.dateTime = new Date();

			bookingLog.logs.push(logObject);

			delete bookingLog._id;
			BookingLogs.update({invoiceId: details['_id']}, {$set: bookingLog});
		},
		insertUniversalLog: function(details) {
			this.unblock();
			var universalLog = new Object();

			universalLog.content = details['universalContent'];
			if(details['type'] == "Booking") {
				universalLog.type = "bookings";
			} else if(details['type'] == "Quotation") {
				universalLog.type = "quotations";
			} else {
				universalLog.type = "others";
			}
			
			universalLog.url = details['url'];
			universalLog.createdAt = new Date();
			universalLog.owner = details['ownerId'];

			Logs.insert(universalLog);
		}
	})
}

