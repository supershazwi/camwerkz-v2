Template.newInventoryCategory.rendered = function() {
	Session.clearTemp();
}

Template.newInventoryCategory.events({
	'keyup #category': function(e) {
		var category = Categories.findOne({name: $("#category").val()});
		console.log($("#category").val());
		console.log(category);
	    if(typeof category == 'undefined') {
	    	Session.clear('categoryDuplicate');
	    }
	    else {
	    	Session.setTemp('categoryDuplicate', true);
	    }
  	},
  	'submit form': function(e) {
	    e.preventDefault();  
	    var categoryAttributes = {
    	  	name: $("#category").val()
	    };

	    IonModal.close();
    	IonKeyboard.close();
      	
	    Meteor.call('addInventoryCategory', categoryAttributes, function(error, result) {
	    });
  	}
});

Template.newInventoryCategory.helpers({
  categoryDuplicate: function() {
  	return Session.get('categoryDuplicate');
  },
  categoryStatus: function() {
  	if(Session.get('categoryDuplicate')) {
  		return "red";
  	}
  },
});