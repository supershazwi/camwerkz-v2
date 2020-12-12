Meteor.methods({
	updatedVerification: function(details) {
		var user = Meteor.users.findOne({_id: details['userId']});
		if(details['verified']) {
			user.profile.verified = true;
		} else {
			user.profile.verified = false;
		}

		delete user._id;
		Meteor.users.update({_id: details['userId']}, {$set: user});
	},
	updatedAdmin: function(details) {
		var user = Meteor.users.findOne({_id: details['userId']});
		if(details['admin']) {
			user.profile.type = "Admin";
		} else {
			user.profile.type = "Non-admin";
		}

		delete user._id;
		Meteor.users.update({_id: details['userId']}, {$set: user});
	}
});