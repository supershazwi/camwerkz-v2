Template.customersEditDetails.created = function () {
  this.subscribe('customer', Router.current().params._id);
  this.subscribe('customerUpdate', Router.current().params._id);
};

Template.customersEditDetails.destroyed = function () {
	Meteor.call("okCustomer", Router.current().params._id);
};

var hello;

Template.customersEditDetails.rendered = function () {
	var customer = Customers.findOne({_id: Router.current().params._id});
	Session.setTemp("currentCustomerName", customer.name);
	Session.setTemp("currentCustomerEmail", customer.email);
	if(Session.get("emailDuplicate")) {
		Session.clear("emailDuplicate");
	}
	if(Session.get("nameDuplicate")) {
		Session.clear("nameDuplicate");
	}
        Session.setTemp("firstNameMax", false);
        Session.setTemp("lastNameMax", false);
        Session.setTemp("middleNameMax", false);
        Session.setTemp("emailMax", false);
        Session.setTemp("contactMax", false);

    this.autorun(function () {

  		if(Session.get("check") == true) {
  		  hello = Meteor.setInterval(function () {
  		    console.log("check");
  		    if(CustomerUpdates.findOne({customerId: Router.current().params._id}).status == "OK") {
  		      Session.setTemp("check", false);
  		      Meteor.clearInterval(hello);
  		      Router.go("customers.show", {_id: Router.current().params._id});
  		    }
  		  }, 200);
  		}

    }.bind(this));
};


Template.customersEditDetails.destroyed = function () {
	Meteor.clearInterval(hello);
};

Template.customersEditDetails.helpers({
	pending: function() {
		return (CustomerUpdates.findOne({customerId: Router.current().params._id}).status == "Pending");
	},
	error: function() {
		return (CustomerUpdates.findOne({customerId: Router.current().params._id}).status != "Pending" && CustomerUpdates.findOne({customerId: Router.current().params._id}).status != "OK");
	},
	iferrororpending: function() {
		var status = CustomerUpdates.findOne({customerId: Router.current().params._id}).status;

		if(status != "OK") {
			return "margin-top: 44px;";
		}
	},
	messageError: function() {
		return (CustomerUpdates.findOne({customerId: Router.current().params._id}).status);
	},
	nameMax: function() {
	  return Session.get("nameMax");
	},
	emailMax: function() {
	  return Session.get("emailMax");

	},
	contactMax: function() {
	  return Session.get("contactMax");

	},
	customer: function() {
		return Customers.findOne({_id: Router.current().params._id});
	},
	nameDuplicate: function() {
		return Session.get('nameDuplicate');
	},
	nameStatus: function() {
		if(Session.get('nameDuplicate')) {
			return "red";
		}
	},
	emailDuplicate: function() {
		return Session.get('emailDuplicate');
	},
	emailStatus: function() {
		if(Session.get('emailDuplicate')) {
			return "red";
		}
	},
	isDisabled:function() {
	    if(Session.get("emailDuplicate") || Session.get("nameDuplicate")) {
	      return "disabled";
	  	}
    },
    firstNameMax: function() {
      return Session.get("firstNameMax");
    },
    middleNameMax: function() {
      return Session.get("middleNameMax");
    },
    lastNameMax: function() {
      return Session.get("lastNameMax");
    }
});

Template.customersEditDetails.events({
	'keyup #firstName': function(e) {

      if($("#firstName").val().length == 25) {
        Session.setTemp("firstNameMax", true);
      } else {
        Session.clear("firstNameMax");
      }
      document.getElementById("name").value = ($("#firstName").val() + " " + $("#middleName").val() + " " + $("#lastName").val()).trim();
    },
    'keyup #lastName': function(e) {

      if($("#lastName").val().length == 25) {
        Session.setTemp("lastNameMax", true);
      } else {
        Session.clear("lastNameMax");
      }
      document.getElementById("name").value = ($("#firstName").val() + " " + $("#middleName").val() + " " + $("#lastName").val()).trim();
    },
    'keyup #middleName': function(e) {

      if($("#middleName").val().length == 25) {
        Session.setTemp("middleNameMax", true);
      } else {
        Session.clear("middleNameMax");
      }
      document.getElementById("name").value = ($("#firstName").val() + " " + $("#middleName").val() + " " + $("#lastName").val()).trim();
    },
	'keyup #name': function(e) {
		if($("#name").val().length == 75) {
		  Session.setTemp("nameMax", true);
		} else {
		  Session.clear("nameMax");
		}
		var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
		var customer = Customers.findOne({name: name});
	    if(typeof customer == 'undefined') {
	    	Session.clear('nameDuplicate');
	    }
	    else {
	    	if(name != Session.get("currentCustomerName")) 
	    		Session.setTemp('nameDuplicate', true);
	    	else
	    		Session.clear('nameDuplicate');
	    }
  	},
  	'keyup #contact': function(e) {
  	  if($("#contact").val().length == 21) {
  	    Session.setTemp("contactMax", true);
  	  } else {
  	  Session.clear("contactMax");
  	}
  	},

  	'keyup #email': function(e) {
  		if($("#email").val().length == 100) {
        Session.setTemp("emailMax", true);
      } else {
      Session.clear("emailMax");
    }
   		var email = $("#email").val().toLowerCase();
		var customer = Customers.findOne({email: email});
	    if(typeof customer == 'undefined') {
	    	Session.clear('emailDuplicate');
	    }
	    else {
	    	if(email != Session.get("currentCustomerEmail")) 
	    		Session.setTemp('emailDuplicate', true);
	    	else
	    		Session.clear('emailDuplicate');
	    }
  	},
  	'click #saveCustomerDetails': function(e) {
	    e.preventDefault();

	    var customer = Customers.findOne({_id: Router.current().params._id});

	    var firstName = $("#firstName").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
	    var middleName = $("#middleName").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
	    var lastName = $("#lastName").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
	    var company = $("#company").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
      	var email = $("#email").val().toLowerCase();
      	var ic = $("#ic").val().toUpperCase();
      	var address = $("#address").val();
      	var name = "";
      	if(firstName.length > 0) {
      		name = name.concat(firstName);
      	} 
      	if(middleName.length > 0) {
      		name = name.concat(" " + middleName);
      	} 
      	if(lastName.length > 0) {
      		name = name.concat(" " + lastName);
      	} 
	    var customerAttributes = {
	    	_id: Router.current().params._id,
	    	name: name,
			firstName: firstName,
			middleName: middleName,
			lastName: lastName,
	      	email: email,
	      	ic: ic,
	      	company: company,
	      	address: address,
	      	contact: $("#contact").val(),
	      	customer: Session.get('customer')
	    };
      	
	    IonModal.close();
    	IonKeyboard.close();

    	Session.setTemp("check", true);
    	Meteor.call("pendingCustomer", Router.current().params._id);
    	Meteor.call('updateQuickbooksCustomer', customerAttributes, function(error, result) {
    		
    		console.log(result);

    		// Meteor.call('updateCustomer', customerAttributes, function(error, result) {
    		// 	Router.go('customers.show', {_id: Router.current().params._id}, {});
    		// });
    	});

	    
  	}
});