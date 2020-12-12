OtherLogs = new Mongo.Collection('otherlogs');

Meteor.methods({
	insertOtherLog: function(details) {
		this.unblock();

		var otherLog = OtherLogs.findOne({invoiceId: details['_id']});

		var logObject = new Object();

		logObject.content = details['content'];
		logObject.owner = details['ownerUsername'];
		logObject.dateTime = new Date();

		otherLog.logs.push(logObject);

		delete otherLog._id;
		OtherLogs.update({invoiceId: details['_id']}, {$set: otherLog});
	}
})
