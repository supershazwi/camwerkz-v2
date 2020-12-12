Template.statusSelect.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
};

Template.statusSelect.events({
  'click .status': function (event, template) {

  	var obj = new Object();
	obj.selectedId = Session.get("itemSelected");
	obj.bookingId = Router.current().params._id;
	obj.newState = event.target.id;

   	Meteor.call('changeStatus', obj, function(error, result) {
  	});
   	IonModal.close();
  }
});

