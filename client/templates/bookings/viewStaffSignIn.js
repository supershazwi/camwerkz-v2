Template.viewStaffSignIn.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
};

Template.viewStaffSignIn.events({
	'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  }
});

Template.viewStaffSignIn.helpers({
  pendingItems: function() {
    var bookingSignIns = BookingSignIns.findOne({invoiceId: Router.current().params._id});
    return bookingSignIns.staffSignIn[Session.get("remarkSignInClicked")].items;
  }
});

