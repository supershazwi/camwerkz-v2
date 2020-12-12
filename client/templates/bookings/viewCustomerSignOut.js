Template.viewCustomerSignOut.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
};

Template.viewCustomerSignOut.events({
	'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  }
});

Template.viewCustomerSignOut.helpers({
  pendingItems: function() {
    var bookingSignOuts = BookingSignOuts.findOne({invoiceId: Router.current().params._id});
    return bookingSignOuts.customerSignOut[Session.get("remarkSignOutClicked")].items;
  }
});

