Template.viewOtherCustomerSignOut.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
};

Template.viewOtherCustomerSignOut.events({
	'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  }
});

Template.viewOtherCustomerSignOut.helpers({
  pendingItems: function() {
    var other = Others.findOne({_id: Router.current().params._id});
    return other.customerSignOut[Session.get("remarkSignOutClicked")].items;
  }
});

