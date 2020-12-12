Template.newCustomer.rendered = function() {
}

AutoForm.hooks({
  'customers-new-form': {
    onSuccess: function (operation, result, template) {
      IonModal.close();
      IonKeyboard.close();
      Router.go('customers.show', {_id: result});
    }
  }
});

Template.newCustomer.events({
	'keyup #name': function(e) {
    var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
		var customer = Customers.findOne({name: name});
	    if(typeof customer == 'undefined') {
	    	Session.clear('nameDuplicate');
	    }
	    else {
	    	Session.setTemp('nameDuplicate', true);
	    }
  	},
  	'keyup #email': function(e) {
    var email = $("#email").val().toLowerCase();
		var customer = Customers.findOne({email: email});
	    if(typeof customer == 'undefined') {
	    	Session.clear('emailDuplicate');
	    }
	    else {
	    	Session.setTemp('emailDuplicate', true);
	    }
  	},
  	'click #addNewCustomer': function(e) {
	    e.preventDefault();  
      var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
      var company = $("#company").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
	   var email = $("#email").val().toLowerCase();

      var customerAttributes = {
	    	  name: name,
	      	email: email,
	      	company: company,
          noOfBookings: 0,
          totalValue: 0,
	      	contact: $("#contact").val()
	    };

	    IonModal.close();
    	IonKeyboard.close();
      	
	    Meteor.call('addCustomer', customerAttributes, function(error, result) {

	    });


      Meteor.call('addQuickbooksCustomer', customerAttributes);
  	},
    'click [data-action="showConfirm"]': function(event, template) {
      console.log(Meteor.user().services);

      console.log(Meteor.users.findOne({_id: "56ccFrer3ABfBQoGj"}));

      event.preventDefault();
      IonPopup.confirm({
        title: 'Add All QuickBooks Customers',
        template: 'Are you <strong>really</strong> sure?',
        onOk: function() {
          Meteor.call('findAllQuickbooksCustomers', function(error, result) {
            IonModal.close();
            IonKeyboard.close();
            console.log(result);
          });
        },
        onCancel: function() {
        }
      });
    }
});

Template.newCustomer.helpers({
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
  }
});