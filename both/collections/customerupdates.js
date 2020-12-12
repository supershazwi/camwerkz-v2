CustomerUpdates = new Mongo.Collection('customerupdates');

Meteor.methods({
	updatecustomerupdate: function(details) {
		this.unblock();

		var customerUpdate = CustomerUpdates.findOne({customerId: details['_id']});


		//status -> ok, updating, not ok
		customerUpdate.status = details['status'];

		delete customerUpdate._id;
		CustomerUpdates.update({customerId: details['_id']}, {$set: customerUpdate});
	}
})
