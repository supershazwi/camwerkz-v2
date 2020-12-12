  var wrapper,
    clearButton ,
    saveButton,
    canvas,
    signaturePad;

Template.othersCustomerSign.created = function () {
  this.subscribe('other', Router.current().params._id);
  this.subscribe('customerByOther', Router.current().params._id);
  this.subscribe('logsByOther', Router.current().params._id);
};

Template.othersCustomerSign.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  wrapper = document.getElementById("signature-pad");
  canvas = wrapper.querySelector("canvas");

  var other = Others.findOne({_id: Router.current().params._id});
  var customer = Customers.findOne({_id: other.customerId});
  document.getElementById("name").value = other.customerName;
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

Template.othersCustomerSign.events({
  "click #clear": function() {
    signaturePad.clear();
  },
  'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  },
  "click #submit": function() {
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

      Meteor.call('signOtherCustomerSignOutRemarks', attributes, function(error, result) {
        var attributes = {
          _id: Router.current().params._id,
          content: $("#name").val() + " signed out for: " + result.join() + ".",
          universalContent: Meteor.user().username + " signed out for: " + result.join() + " for invoice " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: "Others",
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertOtherLog", attributes);

       Router.go('others.show', {_id: Router.current().params._id}, {});
      });
    }
  },
});