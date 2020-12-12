Template.bookingsRecordPayment.created = function() {
  this.subscribe('bookingpricesByBooking', Router.current().params._id);
  this.subscribe('bookingstatusesbybooking', Router.current().params._id);
  this.subscribe('logsByBooking', Router.current().params._id);
};

Template.bookingsRecordPayment.rendered = function () {
  Session.setTemp('payDisabled', true);
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');

  this.autorun(function () {

    Session.setTemp("bookingPrice", BookingPrices.findOne({invoiceId: Router.current().params._id}));
    Session.setTemp("balanceLeft", Session.get("bookingPrice").balanceDue);

  }.bind(this));
};

Template.bookingsRecordPayment.helpers({
  payDisabled: function() {
    return Session.get("payDisabled");
  },
  balanceLeft: function() {
    return accounting.formatMoney(Session.get("balanceLeft"));
  },
  amountWo: function() {
    return accounting.formatMoney(Session.get("originalBalanceDue"));
  },
  bankTransferClicked: function() {
    return (Session.get("paymentType") == "Bank Transfer");
  },
  quickbooksInvoiceId: function() {
    return BookingStatuses.findOne({invoiceId: Router.current().params._id}).quickbooksInvoiceId;
  },
  chequeClicked: function() {
    return (Session.get("paymentType") == "Cheque");
  },
  netsClicked: function() {
    return (Session.get("paymentType") == "Nets");
  },
  unionpayClicked: function() {
    return (Session.get("paymentType") == "Unionpay");
  },
  visaClicked: function() {
    return (Session.get("paymentType") == "Visa");
  },
  mastercardClicked: function() {
    return (Session.get("paymentType") == "Mastercard");
  }
});

Template.bookingsRecordPayment.events({
  'click #bankTransfer': function(e) {
    Session.setTemp("paymentType", "Bank Transfer");
    $("#choosePaymentType").css("display", "none");
    $("#enterPaymentAmount").css("display", "block");
    Session.setTemp("paymentType", "Bank Transfer");
  },
  'click #Cheque': function(e) {
    Session.setTemp("paymentType", "Cheque");
    $("#choosePaymentType").css("display", "none");
    $("#enterPaymentAmount").css("display", "block");
    Session.setTemp("paymentType", "Cheque");
  },
  'click #Cash': function(e) {
    Session.setTemp("paymentType", "Cash");
    $("#choosePaymentType").css("display", "none");
    $("#enterPaymentAmount").css("display", "block");
    Session.setTemp("paymentType", "Cash");
  },
  'click #Nets': function(e) {
    Session.setTemp("paymentType", "Nets");
    $("#choosePaymentType").css("display", "none");
    $("#enterPaymentAmount").css("display", "block");
    Session.setTemp("paymentType", "Nets");
  },
  'click #Unionpay': function(e) {
    Session.setTemp("paymentType", "Unionpay");
    $("#choosePaymentType").css("display", "none");
    $("#enterPaymentAmount").css("display", "block");
    Session.setTemp("paymentType", "Unionpay");
  },
  'click #Visa': function(e) {
    Session.setTemp("paymentType", "Visa");
    $("#choosePaymentType").css("display", "none");
    $("#enterPaymentAmount").css("display", "block");
    Session.setTemp("paymentType", "Visa");
  },
  'click #Mastercard': function(e) {
    Session.setTemp("paymentType", "Mastercard");
    $("#choosePaymentType").css("display", "none");
    $("#enterPaymentAmount").css("display", "block");
    Session.setTemp("paymentType", "Mastercard");
  },
  'keyup #bankTransferNo': function(e) {  
    Session.setTemp("payDisabled", true);
    if($("#bankTransferNo").val() == "") {
      Session.setTemp("payDisabled", true);
    } else {
      if($("#amount").val() != "") {
        Session.setTemp("payDisabled", false);
      }
    }
  },
  'keyup #chequeSerialNo': function(e) {  
    Session.setTemp("payDisabled", true);
    if($("#chequeSerialNo").val() == "") {
      Session.setTemp("payDisabled", true);
    } else {
      if($("#amount").val() != "") {
        Session.setTemp("payDisabled", false);
      }
    }
  },
  'keyup #netsReceiptNo': function(e) {  
    Session.setTemp("payDisabled", true);
    if($("#netsReceiptNo").val() == "") {
      Session.setTemp("payDisabled", true);
    } else {
      if($("#amount").val() != "") {
        Session.setTemp("payDisabled", false);
      }
    }
  },
  'keyup #unionpayReceiptNo': function(e) {  
    Session.setTemp("payDisabled", true);
    if($("#unionpayReceiptNo").val() == "") {
      Session.setTemp("payDisabled", true);
    } else {
      if($("#amount").val() != "") {
        Session.setTemp("payDisabled", false);
      }
    }
  },
  'keyup #visaReceiptNo': function(e) {  
    Session.setTemp("payDisabled", true);
    if($("#visaReceiptNo").val() == "") {
      Session.setTemp("payDisabled", true);
    } else {
      if($("#amount").val() != "") {
        Session.setTemp("payDisabled", false);
      }
    }
  },
  'keyup #mastercardReceiptNo': function(e) {  
    Session.setTemp("payDisabled", true);
    if($("#mastercardReceiptNo").val() == "") {
      Session.setTemp("payDisabled", true);
    } else {
      if($("#amount").val() != "") {
        Session.setTemp("payDisabled", false);
      }
    }
  },
  'keyup #amount': function(e) {    
    Session.setTemp("payDisabled", true);
    if($("#amount").val() == "") {
      Session.setTemp("payDisabled", true);
      Session.setTemp("balanceLeft", Session.get("bookingPrice").balanceDue);
    } else {
      if(Session.get("paymentType") == "Bank Transfer" && $("#bankTransferNo").val() != "") {
        Session.setTemp("payDisabled", false);
      } else if (Session.get("paymentType") == "Cheque" && $("#chequeSerialNo").val() != "") {
        Session.setTemp("payDisabled", false);
      } else if (Session.get("paymentType") == "Cash") {
        Session.setTemp("payDisabled", false);
      } else if (Session.get("paymentType") == "Nets" && $("#netsReceiptNo").val() != "") {
        Session.setTemp("payDisabled", false);
      } else if (Session.get("paymentType") == "Unionpay" && $("#unionpayReceiptNo").val() != "") {
        Session.setTemp("payDisabled", false);
      } else if (Session.get("paymentType") == "Visa" && $("#visaReceiptNo").val() != "") {
        Session.setTemp("payDisabled", false);
      } else if (Session.get("paymentType") == "Visa" && $("#mastercardReceiptNo").val() != "") {
        Session.setTemp("payDisabled", false);
      }
      Session.setTemp("balanceLeft", Session.get("bookingPrice").balanceDue - parseFloat($("#amount").val()));
    }
    
  },
  'click #backButton': function(event, template) {
    $("#enterPaymentAmount").css("display", "none");
    $("#choosePaymentType").css("display", "block");
  },
  'click #pay': function(event, template) {
    event.preventDefault();
    var netsReceiptNo;
    var chequeSerialNo;
    var serialNo;
    var bankTransferNo;

    IonModal.close();
    IonKeyboard.close();

    if($("#netsReceiptNo").val() != undefined) {
      serialNo = $("#netsReceiptNo").val();
    }

    if($("#bankTransferNo").val() != undefined) {
      serialNo = $("#bankTransferNo").val();
    }

    if($("#chequeSerialNo").val() != undefined) {
      serialNo = $("#chequeSerialNo").val();
    }

    if($("#unionpayReceiptNo").val() != undefined) {
      serialNo = $("#unionpayReceiptNo").val();
    }

    if($("#visaReceiptNo").val() != undefined) {
      serialNo = $("#visaReceiptNo").val();
    }

    if($("#mastercardReceiptNo").val() != undefined) {
      serialNo = $("#mastercardReceiptNo").val();
    }

    if(serialNo == undefined) {
      var attributes = {
        _id: Router.current().params._id,
        amount: parseFloat($("#amount").val()),
        type: Session.get("paymentType")
      };
    } else {
      var attributes = {
        _id: Router.current().params._id,
        amount: parseFloat($("#amount").val()),
        type: Session.get("paymentType"),
        serialNo: serialNo
      };
    }

    

    Meteor.call('payForBooking', attributes, function(error, result) {

      console.log("INSIDE!");

      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var attributes;
      if(serialNo == undefined) {
        attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " added " + Session.get("paymentType") + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + ".",
          universalContent: Meteor.user().username + " added " + Session.get("paymentType") + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + " to " + bookingStatus.type + " " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };
      } else {
        attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " added " + Session.get("paymentType") + " serial no: " + serialNo + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + ".",
          universalContent: Meteor.user().username + " added " + Session.get("paymentType") + " serial no: " + serialNo + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + " to " + bookingStatus.type + " " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };
      }

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);

      Router.go('bookings.show', {_id: Router.current().params._id}, {});

      
    });
  }
});

