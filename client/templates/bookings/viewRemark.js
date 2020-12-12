  var wrapper,
    clearButton ,
    saveButton,
    canvas,
    signaturePad;

Template.viewRemark.created = function () {
};

Template.viewRemark.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  wrapper = document.getElementById("signature-pad");
  canvas = wrapper.querySelector("canvas");

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

  var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});

  signaturePad = new SignaturePad(canvas);
  signaturePad.fromDataURL(bookingAcknowledgeRemark.remarksRequiringAcknowledgement[Session.get("remarkAcknowledgeClicked")].image);
  signaturePad.off();
};

Template.viewRemark.events({
});

Template.viewRemark.helpers({
  signedBy: function() {
    return BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id}).remarksRequiringAcknowledgement[Session.get("remarkAcknowledgeClicked")].signedBy;
  },
  signedAt: function() {
    return moment(BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id}).remarksRequiringAcknowledgement[Session.get("remarkAcknowledgeClicked")].signedAt).format('Do MMMM YYYY, h:mma');
  }
});