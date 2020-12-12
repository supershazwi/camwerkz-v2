Template.editCustomerPackage.rendered = function() {
}


Template.editCustomerPackage.helpers({
	customerPackage: function() {
		return CustomerPackages.findOne({_id: Router.current().params._id});
	},
	startDate: function() {
		return moment(this.startDate).format('YYYY-MM-DD');
	},
	endDate: function() {
		return moment(this.endDate).format('YYYY-MM-DD');
	}
});

Template.editCustomerPackage.events({
	'click [data-action="showDeleteConfirm"]': function(event, template) {
		console.log("inside delete confirm");
		IonPopup.confirm({
		  title: 'Delete Customer Package',
		  template: 'Are you <strong>really</strong> sure?',
		  onOk: function() {
		    Meteor.call('deleteCustomerPackage', Router.current().params._id, function(error, result) {
				IonModal.close();
				IonKeyboard.close();
				Router.go('customers.show', {_id: result});
		    });
		  },
		  onCancel: function() {

		  }
		});
	},
	'click #submit': function(e) {
      e.preventDefault();  

      var name = $("#name").val();
      var details = $("#details").val();

      name = name.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

	    var customerPackageAttributes = {
    	  name: name,
    	  details: details, 
    	  customerPackage: CustomerPackages.findOne({_id: Router.current().params._id})
	    };

	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('editCustomerPackage', customerPackageAttributes, function(error, result) {
	    });
  	}
});