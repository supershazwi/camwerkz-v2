  var wrapper,
    clearButton ,
    saveButton,
    canvas,
    signaturePad;

Template.bookingsCustomerSign.created = function () {
  this.subscribe('bookingcustomersByBooking', Router.current().params._id);
  this.subscribe('bookingcustomersByBooking2', Router.current().params._id);
  this.subscribe('bookingsignoutsbybooking', Router.current().params._id);
  this.subscribe('bookingstatusesbybooking', Router.current().params._id);
  this.subscribe('logsByBooking', Router.current().params._id);
  this.subscribe('bookingacknowledgeremarksByBooking', Router.current().params._id);
};

Template.bookingsCustomerSign.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  wrapper = document.getElementById("signature-pad");
  canvas = wrapper.querySelector("canvas");

  var bookingSignOut = BookingSignOuts.findOne({invoiceId: Router.current().params._id});
  var customer = Customers.findOne({_id: BookingCustomers.findOne({invoiceId: Router.current().params._id}).customerId});

  document.getElementById("name").value = customer.name;
  document.getElementById("ic").value = customer.ic;
  document.getElementById("number").value = customer.contact;

  // Adjust canvas coordinate space taking into account pixel ratio,
  // to make it look crisp on mobile devices.
  // This also causes canvas to be cleared.
  function resizeCanvas() {
      // When zoomed out to less than 100%, for some very strange reason,
      // some browsers report devicePixelRatio as less than 1
      // and only part of the canvas is cleared then.
      var ratio =  Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.getContext("2d");
  }

  window.onresize = resizeCanvas;
  resizeCanvas();

  signaturePad = new SignaturePad(canvas);
};

Template.bookingsCustomerSign.helpers({
  checkboxClicked: function() {
    return Session.get('checkboxClicked');
  },
});

Template.bookingsCustomerSign.events({
  'click #checkbox': function (event, template) {
    Session.setTemp('checkboxClicked', $("#checkbox").prop('checked'));
  },
  "click #clear": function() {
    signaturePad.clear();
  },
  'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  },
  "click #submit": function() {
    signaturePad.removeBlanks()
    if (signaturePad.isEmpty()) {
        alert("Please provide signature first.");
    } else {
     var attributes = {
        _id: Router.current().params._id,
        image: signaturePad.toDataURL(),
        signedBy: $("#name").val(),
        ic: $("#ic").val(),
        number: $("#number").val(),

      };

      Meteor.call('signCustomerSignOutRemarks', attributes, function(error, result) {
        Meteor.call("updateBookingStatus", Router.current().params._id);
        Router.go('bookings.show', {_id: Router.current().params._id}, {});

        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var attributes = {
          _id: Router.current().params._id,
          content: $("#name").val() + " signed out for: " + result.join() + ".",
          universalContent: Meteor.user().username + " signed out for: " + result.join() + " for " + bookingStatus.type + " " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
      });
    }
  },
});