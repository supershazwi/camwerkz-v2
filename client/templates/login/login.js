Template.login.events({
	'click #signIn': function(e) {
	    e.preventDefault();

	    var username = $("#username").val();
	    var password = $("#password").val();

	    //if (errors.name || errors.description || errors.location || errors.startDate)
	      //return Session.set('eventCreateErrors', errors);

	    var user = Meteor.loginWithPassword(username, password, function (err, result) {
	        if (err) {
	        	console.log(err);
	        }
	        else {
	        	console.log("ok");
	            Router.go("home");
	        }
	    });
  	}
});



Template.login.created = function () {
	this.subscribe('meteorUsers');
	console.log("login created");
	console.log(Meteor.user());
	if(Meteor.user()) {
		Router.go("home");
	}
};