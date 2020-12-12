  var wrapper,
    clearButton ,
    saveButton,
    canvas,
    signaturePad;

Template.bookingsViewSignature.created = function () {
};

Template.bookingsViewSignature.rendered = function () {
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

  var bookingSignIn = BookingSignIns.findOne({invoiceId: Router.current().params._id});

  signaturePad = new SignaturePad(canvas);
  signaturePad.fromDataURL(bookingSignIn.staffSignIn[Session.get("remarkSignInClicked")].image);
  signaturePad.off();
};

Template.bookingsViewSignature.events({
});

Template.bookingsViewSignature.helpers({
  signedBy: function() {
    return BookingSignIns.findOne({invoiceId: Router.current().params._id}).staffSignIn[Session.get("remarkSignInClicked")].signedBy;
  },
  signedAt: function() {
    return moment(BookingSignIns.findOne({invoiceId: Router.current().params._id}).staffSignIn[Session.get("remarkSignInClicked")].signedAt).format('Do MMMM YYYY, h:mma');
  }
});