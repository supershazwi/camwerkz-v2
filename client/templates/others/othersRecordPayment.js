
Template.othersRecordPayment.created = function () {
  this.subscribe('meteorUsers');
  this.subscribe('invoiceNeedingUpdateByOther', Router.current().params._id);
  this.subscribe('other', Router.current().params._id);
  this.subscribe('logsByOther', Router.current().params._id);
  this.subscribe('customerByOther', Router.current().params._id);
};

Template.othersRecordPayment.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');

  Session.setTemp("other", Others.findOne({_id: Router.current().params._id}));
  Session.setTemp("balanceLeft", Session.get("other").balanceDue);
  document.getElementById("netsReceiptNo").value = "";
  document.getElementById("chequeSerialNo").value = "";
};

Template.othersRecordPayment.helpers({
  balanceLeft: function() {
    return accounting.formatMoney(Session.get("balanceLeft"));
  },
  amountWo: function() {
    return accounting.formatMoney(Session.get("originalBalanceDue"));
  },
  bankTransferClicked: function() {
    return (Session.get("paymentType") == "Bank Transfer");
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
  },
  quickbooksInvoiceId: function() {
    return Others.findOne({_id: Router.current().params._id}).quickbooksInvoiceId;
  },
});

Template.othersRecordPayment.events({
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
  'keyup #amount': function(e) {    
    if($("#amount").val() == "") {
      Session.setTemp("balanceLeft", Session.get("other").balanceDue);
    } else {
      Session.setTemp("balanceLeft", Session.get("other").balanceDue - parseFloat($("#amount").val()));
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

    var attributes2;
    if(serialNo == undefined) {
      attributes2 = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " added " + Session.get("paymentType") + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + ".",
        universalContent: Meteor.user().username + " added " + Session.get("paymentType") + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + " to invoice " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: "Others",
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };
    } else {
      attributes2 = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " added " + Session.get("paymentType") + " serial no: " + serialNo + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + ".",
        universalContent: Meteor.user().username + " added " + Session.get("paymentType") + " serial no: " + serialNo + " payment of " + accounting.formatMoney(parseFloat($("#amount").val())) + " to invoice " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: "Others",
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };
    }

    Meteor.call("insertOtherLog", attributes2);
    Meteor.call("insertUniversalLog", attributes2);

    Meteor.call('payForOther', attributes, function(error, result) {
      Router.go('others.show', {_id: Router.current().params._id}, {});
    });
  }
});

