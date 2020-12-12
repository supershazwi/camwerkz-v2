Template.editCustomerPackageItem.rendered = function() {
}

Template.editCustomerPackageItem.helpers({
  itemClicked: function() {
  	return Session.get("itemClicked");
  }
});

Template.editCustomerPackageItem.events({
  	'click [data-action="showDeleteConfirm"]': function(event, template) {
		IonPopup.confirm({
		  title: 'Delete Package Item',
		  template: 'Are you <strong>really</strong> sure?',
		  onOk: function() {
		  	var packageItem = Session.get("itemClicked");
		  	packageItem.currentPackageId = Router.current().params._id;
		    Meteor.call('deletePackageItem', packageItem, function(error, result) {
				IonModal.close();
				IonKeyboard.close();
		    });
		  },
		  onCancel: function() {

		  }
		});
	},
	'submit form': function(e) {
	    e.preventDefault();

	    var customerPackageAttributes = {
	    	_id: Router.current().params._id,
	  		id: $("#id").val(),
	  		item: $("#item").val(),
    	  	brand: $("#brand").val(), 
    		category: $("#category").val(),
    	  	rate: $("#rate").val(),
    	  	quantity: $("#quantity").val()
	    };

	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('editCustomerPackageItem', customerPackageAttributes, function(error, result) {
	    });
  	}
});