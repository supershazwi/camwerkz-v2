Template.newCustomerPackage.rendered = function() {
};

Tracker.autorun(function() {
});

Template.newCustomerPackage.events({
  'click a': function (event, template) {
    IonModal.close();
  },
  'submit form': function(e) {
      e.preventDefault();  

      var name = $("#name").val();
      var details = $("#details").val();

      name = name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

	    var customerPackageAttributes = {
    	  name: name,
    	  details: details, 
        noOfItems: 0,
        items: [],
    	  customer: Session.get('customer')
	    };

	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('addCustomerPackage', customerPackageAttributes, function(error, result) {
	    });
  	},
    'keyup #name': function(e) {
    var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
    var customerPackage = CustomerPackages.findOne({name: name});
      if(typeof customerPackage == 'undefined') {
        Session.clear('packageNameDuplicate');
      }
      else {
        Session.setTemp('packageNameDuplicate', true);
      }
    },
});

Template.newCustomerPackage.helpers({
  packageNameDuplicate: function() {
    if(Session.get('packageNameDuplicate')) {
      return true;
    }
  },
  itemStatus: function() {
    if(Session.get('packageNameDuplicate')) {
      return "red";
    }
  },
  isDisabled:function() {
    if(Session.get("packageNameDuplicate")) {
      return "disabled";
    }
  }
});
