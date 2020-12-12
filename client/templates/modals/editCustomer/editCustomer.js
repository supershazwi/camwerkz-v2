Template.editCustomer.rendered = function() {
	var customer = Customers.findOne({_id: Router.current().params._id});
	Session.setTemp("currentCustomerName", customer.name);
	Session.setTemp("currentCustomerEmail", customer.email);
	if(Session.get("emailDuplicate")) {
		Session.clear("emailDuplicate");
	}
	if(Session.get("nameDuplicate")) {
		Session.clear("nameDuplicate");
	}
}

AutoForm.hooks({
  'customers-edit-form': {
    onSuccess: function (operation, result, template) {
      IonModal.close();
      IonKeyboard.close();
      Router.go('customers.show', {_id: result});
    }
  }
});

Template.editCustomer.helpers({
  customer: function () {
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
  updatedAt: function() {
  	return moment(this.updatedAt).format('Do MMMM YYYY, h:mma')
  },
  isDisabled:function() {
    if(Session.get("emailDuplicate") || Session.get("nameDuplicate")) {
      return "disabled";
    }
  }
});

Template.editCustomer.events({
	'keyup #name': function(e) {
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
  	'keyup #email': function(e) {
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
  	'click [data-action="showDeleteConfirm"]': function(event, template) {
		IonPopup.confirm({
		  title: 'Delete Customer',
		  template: 'Are you <strong>really</strong> sure?',
		  onOk: function() {
		  	console.log("inside delete customer");

		    Meteor.call('deleteCustomer', Router.current().params._id, function(error, result) {
	  			Router.go('customers'); 
		    });
		  },
		  onCancel: function() {
		    console.log('Cancelled');
		  }
		});
	},
  	'submit form': function(e) {
	    e.preventDefault();

	    var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
      	var company = $("#company").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
      	var email = $("#email").val().toLowerCase();

	    var customerAttributes = {
	    	_id: $("#id").val(),
	    	name: name,
	      	email: email,
	      	company: company,
	      	contact: $("#contact").val(),
	      	quickbooksId: $("#quickbooksId").val(),
	      	customer: Session.get('customer')
	    };
      	
	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('updateCustomer', customerAttributes, function(error, result) {
	    });
  	}
});