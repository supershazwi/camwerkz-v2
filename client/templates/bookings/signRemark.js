  var wrapper,
    clearButton ,
    saveButton,
    canvas,
    signaturePad;

Template.signRemark.created = function () {
};

Template.signRemark.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  wrapper = document.getElementById("signature-pad");
  canvas = wrapper.querySelector("canvas");

  var bookingCustomer = BookingCustomers.findOne({invoiceId: Router.current().params._id});

  document.getElementById("name").value = Customers.findOne({_id: bookingCustomer.customerId}).name;

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

Template.signRemark.events({
  "click #clear": function() {
    signaturePad.clear();
  },
  "click #submit": function() {
    if (signaturePad.isEmpty()) {
        alert("Please provide signature first.");
    } else {
     var attributes = {
        _id: Router.current().params._id,
        image: signaturePad.toDataURL(),
        signedBy: $("#name").val(),
        acknowledgeId: Session.get("remarksAcknowledgeId")
      };

      console.log(Session.get("remarksAcknowledgeId"));

      var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});

      console.log(bookingAcknowledgeRemark);

      var remarkArray = Session.get("remarksAcknowledgeId");

      var lineItemArray = [];

      for(x in remarkArray) {
        lineItemArray.push(bookingAcknowledgeRemark.remarksRequiringAcknowledgement[remarkArray[x]].remark);
      }

      console.log(lineItemArray);

      Meteor.call('signRemarks', attributes, function(error, result) {
        Meteor.call("updateBookingStatus", Router.current().params._id);

        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var attributes = {
          _id: Router.current().params._id,
          content: $("#name").val() + " signed for " + lineItemArray.join() + ".",
          ownerUsername: $("#name").val(),
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
      });
    }
  },
});