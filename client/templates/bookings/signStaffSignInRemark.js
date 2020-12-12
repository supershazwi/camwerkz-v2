  var wrapper,
    clearButton ,
    saveButton,
    canvas,
    signaturePad;

Template.signStaffSignInRemark.created = function () {
};

Template.signStaffSignInRemark.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  wrapper = document.getElementById("signature-pad");
  canvas = wrapper.querySelector("canvas");

  document.getElementById("name").value = Meteor.user().username;

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

Template.signStaffSignInRemark.events({
  "click #clear": function() {
    signaturePad.clear();
  },
  'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  },
  "click #submit": function() {
    console.log("submit");
    if (signaturePad.isEmpty()) {
        alert("Please provide signature first.");
    } else {
     var attributes = {
        _id: Router.current().params._id,
        image: signaturePad.toDataURL(),
        signedBy: $("#name").val()
      };

      console.log("call function");

      Meteor.call('signStaffSignInRemarks', attributes, function(error, result) {
        
      });
    }
  },
});