Template.addItemRemark.rendered = function() {


  $("#remark").focus();
}

Template.addItemRemark.events({
  	'submit form': function(e) {
	    e.preventDefault();  

	    var remarkAttributes = {
    	  remark: $("#remark").val(),
          routeId: Router.current().params._id,
          serialNoClicked: Session.get("serialNoClicked"),
          itemIdClicked: Session.get("itemIdClicked")
	    };

	    IonModal.close();
    	IonKeyboard.close();
      		
    	console.log(remarkAttributes);

	    Meteor.call('addItemRemark', remarkAttributes, function(error, result) {
	    });
  	}
});

Template.addItemRemark.helpers({
 
});