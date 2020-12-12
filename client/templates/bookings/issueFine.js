Template.issueFine.created = function () {
};

Template.issueFine.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  var array = [];
  Session.setTemp("issueFineArray", array);
};

Template.issueFine.events({
  'click #createInvoice': function() {
    var attributes = {
      _id: Router.current().params._id,
      fineArray: Session.get("issueFineArray")
    };

    Meteor.call('createInvoice', attributes, function(error, result) {
      Router.go('bookings.show', {_id: result}); 
    });
  },
  'click .item': function(e) {
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var issueFineArray = Session.get("issueFineArray");
        issueFineArray.push(e.currentTarget.id);
        Session.setTemp("issueFineArray", issueFineArray);
      } else {
        var issueFineArray = Session.get("issueFineArray");
        for(x in issueFineArray) {
          if(issueFineArray[x] == e.currentTarget.id) {
            issueFineArray.splice(x, 1);
            break;
          }
        }
        Session.setTemp("issueFineArray", issueFineArray);
      }
    }
  }
});

Template.issueFine.helpers({
  unresolved: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    var array = [];

    for(x in booking.remarksRequiringAcknowledgement) {
      if(booking.remarksRequiringAcknowledgement[x].resolved == false) {
        var obj = new Object();
        obj.id = booking.remarksRequiringAcknowledgement[x].id;
        obj.lineItem = booking.remarksRequiringAcknowledgement[x].lineItem;

        array.push(obj);
      }
    }


    return array;
  }
});