DuplicateInventory = new Mongo.Collection('duplicateInventory');

Meteor.methods({
	insertDuplicate: function() {
		var duplicate = new Object();
		duplicate.content = "Duplicate found";
		duplicate.dateTime = new Date();

		DuplicateInventory.insert(duplicate);
	}
})