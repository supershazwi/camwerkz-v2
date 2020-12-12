Template.newInventoryItemRemark.rendered = function() {
	Session.clearTemp();

  $("#remark").focus();
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

Template.newInventoryItemRemark.events({
  	'submit form': function(e) {
	    e.preventDefault();  

	    var remarkAttributes = {
	    	  remark: $("#remark").val(),
          routeId: Router.current().params._id
	    };

	    IonModal.close();
    	IonKeyboard.close();
      	
	    Meteor.call('addInventoryItemRemark', remarkAttributes, function(error, result) {
	    });
  	}
});

Template.newInventoryItemRemark.helpers({
 
});