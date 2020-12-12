CustomerLogs = new Mongo.Collection('customerlogs');

Meteor.methods({
	insertCustomerLog: function(details) {

		console.log("inside insertCustomerLog");

		this.unblock();

		var customerLog = CustomerLogs.findOne({customerId: details['_id']});

		console.log("customerLog");
		console.log(customerLog);

		var logObject = new Object();

		logObject.content = details['content'];
		logObject.owner = details['ownerUsername'];
		logObject.dateTime = new Date();

		customerLog.logs.push(logObject);

		delete customerLog._id;
		CustomerLogs.update({customerId: details['_id']}, {$set: customerLog});
	}
})
