Template.othersShow.created = function () {
  this.subscribe('meteorUsers');
  this.subscribe('invoiceNeedingUpdateByOther', Router.current().params._id);
  this.subscribe('other', Router.current().params._id);
  this.subscribe('logsByOther', Router.current().params._id);
  this.subscribe('customerByOther', Router.current().params._id);
  this.subscribe('bookingUpdate', Router.current().params._id);
};

Tracker.autorun(function() {
  if (Session.get('searchCustomerQuery')) {
    Meteor.subscribe('customerSearch', Session.get('searchCustomerQuery'));
  }
  if (Session.get('searchCustomerNumberQuery')) {
    Meteor.subscribe('customerNumberSearch', Session.get('searchCustomerNumberQuery'));
  }
});

Template.othersShow.rendered = function () {

      $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
      Session.setTemp('distinctBrands', []);
      Session.setTemp('remarkButton', 'disabled');
      var array = [];
      Session.setTemp("remarksAcknowledgeId", array);
};

/*Cordova code End*/
Template.othersShow.events({
});


Template.othersShow.helpers({
  syncInvoiceToQb: function() {
    return (InvoiceNeedingUpdate.findOne({otherId: Router.current().params._id}) != undefined && Others.findOne({_id: Router.current().params._id}).quickbooksInvoiceId != "Pending");
  },
  needtoauthenticate: function() {
    return Session.get("needtoauthenticate");
  },
  otherUpdateSyncing: function() {
      return (BookingUpdates.findOne({invoiceId: Router.current().params._id}).status == "Syncing");
  },
  otherUpdateError: function() {
    return (BookingUpdates.findOne({invoiceId: Router.current().params._id}).status != "OK" && BookingUpdates.findOne({invoiceId: Router.current().params._id}).status != "Syncing");
  },
  errorStatus: function() {
    return BookingUpdates.findOne({invoiceId: Router.current().params._id}).status;
  },
  searchedCustomers: function() {
    if(Session.get('searchCustomerQuery')) {
      return Customers.search(Session.get('searchCustomerQuery'));
    } 
    if(Session.get('searchCustomerNumberQuery')) {
      console.log("searchCustomerNumberQuery");
      return Customers.numberSearch(Session.get('searchCustomerNumberQuery'));
    } 
  },
  salesSelected: function() {
    if(this.category == 'SALES') {
      return "Selected";
    }
  },
  srSelected: function() {
    if(this.category == 'Service and Replacement') {
      return "Selected";
    }
  },
  sSelected: function() {
    if(this.category == 'Services') {
      return "Selected";
    }
  },
  serialNoExists: function() {
    if(this.serialNo != undefined) {
      return true;
    }
  },
  subAmount: function() {
    
    return accounting.formatMoney(this.subAmount);
  },
  otherId: function() {
    return Router.current().params._id;
  },
  needUpdate: function() {
    var other = Others.findOne({_id: Router.current().params._id})
    var invoiceNeedingUpdate = InvoiceNeedingUpdate.findOne({otherId: Router.current().params._id});

    return ((invoiceNeedingUpdate != undefined) || BookingUpdates.findOne({invoiceId: Router.current().params._id}).status != "OK");
  },
  quickbooksInvoiceId: function() {
    return Others.findOne({_id: Router.current().params._id}).quickbooksInvoiceId;
  },
  void: function() {
    return (Others.findOne({_id: Router.current().params._id}).status == "Void");
  },
  sales: function() {
    return (Others.findOne({_id: Router.current().params._id}).type == "Sales");
  },
  finalTotal: function() {
    return accounting.formatMoney(this.total);
  },
  differentQuantity: function() {
    if(this.originalPriced > 0 && this.discountPriced > 0) {
      return true;
    }
  },
  icStatus: function() {
    return (Customers.findOne({_id: this.customerId}).icStatus);
  },
  ic: function() {
    return (Customers.findOne({_id: this.customerId}).ic);
  },
  customerAddress: function() {
    return (Customers.findOne({_id: this.customerId}).address);
  },
  projectNameExists: function() {
    var other = Others.findOne({_id: Router.current().params._id});

    if(other.projectName == "") {
      return false;
    } else {
      return true;
    }
  },
  naExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "N/A") {
        return true;    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "N/A") {
        return true;    
      }
    }
  },
  noOfNa: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "N/A") {
        count++    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "N/A") {
        count++    
      }
    }
    return count;
  },
  packedExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Packed") {
        return true;    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Packed") {
        return true;    
      }
    }
  },
  noOfPacked: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Packed") {
        count++    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Packed") {
        count++    
      }
    }
    return count;
  },
  inExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "In") {
        return true;    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "In") {
        return true;    
      }
    }
  },
  noOfIn: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "In") {
        count++    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "In") {
        count++    
      }
    }
    return count;
  },
  outExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Out") {
        return true;    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Out") {
        return true;    
      }
    }
  },
  noOfOut: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Out") {
        count++    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Out") {
        count++    
      }
    }
    return count;
  },
  missingExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Missing") {
        return true;    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Missing") {
        return true;    
      }
    }
  },
  noOfMissing: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Missing") {
        count++    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Missing") {
        count++    
      }
    }
    return count;
  },
  damagedExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Damaged") {
        return true;    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Damaged") {
        return true;    
      }
    }
  },
  noOfDamaged: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Damaged") {
        count++    
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Damaged") {
        count++    
      }
    }
    return count;
  },
  custom: function() {
    return (this.total == -1);
  },
  projectName: function() {
    return Others.findOne({_id: Router.current().params._id}).projectName;
  },
  groupId: function() {
    return this.id + 1;
  },
  totalOriginalPrice: function() {
    return accounting.formatMoney(this.originalPriced * (this.rate + this.discount));
  }, 
  totalDiscountPrice: function() {
    return accounting.formatMoney(this.discountPriced * this.rate);
  },
  finalSubTotal: function() {
    var other = Others.findOne({_id: Router.current().params._id});
    var finalSubTotal = 0;
    for(x in other.equipmentDetails) {
      finalSubTotal = parseFloat(finalSubTotal + other.equipmentDetails[x].subTotal);
    }

    return accounting.formatMoney(finalSubTotal);
  },
  dateTime: function() {
    return moment().format('Do MMMM YYYY, h:mma');
  },
  otherCreatedAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  colorCode: function() {
    if(this.status == "N/A") {
      return "#374140";
    } else if(this.status == "Packed") {
      return "#FFB03B";
    } else if(this.status == "In") {
      return "#468966";
    } else if(this.status == "Out") {
      return "#B64926";
    } else if(this.status == "Missing") {
      return "#EA2E49";
    } else {
      return "#8A0917";
    }
  },
  groups: function() {
    var other = Others.findOne({_id: Router.current().params._id});
    return other.equipmentDetails;
  },
  other: function() {
    return Others.findOne({_id: Router.current().params._id});
  },
  otherRemark: function() {
    var other = Others.findOne({_id: Router.current().params._id});

    for(x in other.remarks) {
      other.remarks[x]['createdAt'] = moment(other.remarks[x]['createdAt']).format('Do MMMM YYYY, h:mma');
    }

    return other.remarks.reverse();
  },
  signed: function() {
    if(this.status == "Signed")
      return true;
  },
  acknowledgeRemarksExist: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    if(booking.remarksRequiringAcknowledgement.length > 0) 
      return true;
    else
      return false;
  },
  customerSignOutExist: function() {
    var other = Others.findOne({_id: Router.current().params._id});
    if(other.customerSignOut.length > 0) 
      return true;
    else
      return false;
  },
  customerSignOutRemark: function() {
    var other = Others.findOne({_id: Router.current().params._id});
    return (this.items.length + " pending items unsigned.");
  },
  staffSignInRemark: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    return (this.items.length + " (out of " + booking.noOfItems + ") pending items unsigned.");
  },
  customerSignOut: function() {
    var other = Others.findOne({_id: Router.current().params._id});

    for(x in other.customerSignOut) {
      other.customerSignOut[x]['createdAt'] = moment(other.customerSignOut[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      other.customerSignOut[x]['signedAt'] = moment(other.customerSignOut[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }


    return other.customerSignOut.reverse();
  },
  staffSignInExist: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    if(booking.staffSignIn.length > 0) 
      return true;
    else
      return false;
  },
  staffSignIn: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    for(x in booking.staffSignIn) {
      booking.staffSignIn[x]['createdAt'] = moment(booking.staffSignIn[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      booking.staffSignIn[x]['signedAt'] = moment(booking.staffSignIn[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }

    return booking.staffSignIn.reverse();
  },
  bookingRemarkRequiringAcknowledgement: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    for(x in booking.remarksRequiringAcknowledgement) {
      booking.remarksRequiringAcknowledgement[x]['createdAt'] = moment(booking.remarksRequiringAcknowledgement[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      booking.remarksRequiringAcknowledgement[x]['signedAt'] = moment(booking.remarksRequiringAcknowledgement[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }

    return booking.remarksRequiringAcknowledgement.reverse();
  },
  remarkChecked: function() {
    if(this['status'] == 'Open') {
      return "remarkOpen";
    } else {
      return "remarkClose";
    }
  },
  remarkAcknowledgeChecked: function() {
    if(this['status'] == 'Unsigned') {
      return "remarkOpen";
    } else {
      return "remarkClose";
    }
  },
  statusColor: function() {
    if (this.booked == 0 || this.days == 0) {
      return "#374140";
    }
    else {
      if(this.clash == false) {
        return "#468966";
      } else {
        return "#E74C3C";
      }
    }
  },
  remarkId: function() {
    var id = this.id;
    id = id + 1;
    return id;
  },
  amount: function() {
    return accounting.formatMoney(this.amount);
  },
  paymentExists: function() {
    return (this.payment.length == 0);
  },  
  totalPrice: function() {
    return accounting.formatMoney(this.total);
  },
  zeroTotal: function() {
    return(this.balanceDue > 0);
  },
  balanceDue: function() {
    return accounting.formatMoney(this.balanceDue);
  },
  items: function() {
    var itemArray = [];
    var counter = -1;
    for (i = 0; i < this.items.length; i++) { 
      if(i == 0) {
        counter++;
      }
      itemArray[i] = this.items[i];
    }
    return itemArray;
  },
  rate: function() {
    return accounting.formatMoney(this.rate);
  },
  price: function() {
    return accounting.formatMoney(this.price);
  },
  discount: function() {
    return accounting.formatMoney(this.discount);
  },
  subTotal: function() {
    return accounting.formatMoney(this.subTotal);
  },
  finalSubTotal: function() {
    return accounting.formatMoney(this.equipmentDetails[0].subTotal);
  },
  total: function() {
    return accounting.formatMoney(this.total);
  },
  totalSubTotal: function() {
    var totalSubTotal = 0;
    console.log("inside totalSubTotal");
    console.log(this.items);
    for(x in this.items) {
      totalSubTotal += (this.items[x].price * this.items[x].quantity);
      console.log(totalSubTotal);
    }

    return accounting.formatMoney(totalSubTotal);
  },
  subDiscount: function() {
    return accounting.formatMoney(this.subDiscount);
  },
  gst: function() {
    return accounting.formatMoney(this.gst);
  },
  extraGroup: function() {
    if(this.id != 0)
      return true;
  },
  otherCreatedBy: function() {
    return Meteor.users.findOne({_id: this.createdBy}).username;
  },
  checkboxChecked: function() {
    if(this['status'] == 'Open') {
      return false;
    } else {
      return true;
    }
  },
  checkboxAcknowledgeChecked: function() {
    if(this['status'] == 'Unsigned') {
      return false;
    } else {
      return true;
    }
  },
  customerSignOutAcknowledged: function() {
    return (this['status'] == "Signed");
  },
  staffSignInAcknowledged: function() {
    return (this['status'] == "Signed");
  },
  resolved: function() {
    return this['resolved'];
  },
  discountExist: function() {
    if(this.discount > 0) 
      return true;
  },
  originalPrice: function() {
    return accounting.formatMoney(this.rate + this.discount); 
  },
  out: function() {
    if(this.availability == "out") 
      return "checked";
  },
  bookingId: function() {
    return Router.current().params._id;
  },
  back: function() {
    if(this.availability == "back") 
      return "checked";
  },
  isBooking: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    if(booking.type =="Booking") {
      return true;
    } else {
      return false;
    }
  },
  addRemarkDisabled: function() {
    if(Session.get("remarkButton") == "disabled") {
      return "disabled";
    }
  },
  customerSignOutAbled: function() {
    var other = Others.findOne({_id: Router.current().params._id});

    for(x in other.customerSignOut) {
      if(other.customerSignOut[x]['status'] == "Unsigned") {
        return "";
        break;
      }
    }

    return "disabled";
  },
  staffSignInAbled: function() {
    var other = Others.findOne({_id: Router.current().params._id});

    
    for(x in other.staffSignIn) {
      
      if(other.staffSignIn[x]['status'] == "Unsigned") {
        return "";
        break;
      }
    }

    return "disabled";
  },
  fineSignAbled: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    for(x in booking.remarksRequiringAcknowledgement) {
      if(booking.remarksRequiringAcknowledgement[x].resolved == false) {
        return "";
      }
    }

    return "disabled";
  },
  signAbled: function() {
    if(Session.get("remarksAcknowledgeId").length == 0) {
      return "disabled";
    }
  }
});




Template.othersShow.events({
   'keyup #customerSearch2': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.clear('searchCustomerNumberQuery');
      Session.setTemp('searchCustomerQuery', event.target.value);
    } else {
      Session.clear('searchCustomerQuery');
    }
  },
  'keyup #customerNumberSearch2': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.clear('searchCustomerQuery');
      Session.setTemp('searchCustomerNumberQuery', event.target.value);
    } else {
      Session.clear('searchCustomerNumberQuery');
    }
  },
  'click #syncOthersWithQuickBooks': function(event, template) {
    var other = Others.findOne({_id: Router.current().params._id});
    var category = false;
    for(x in other.equipmentDetails[0].items) {
      if(other.equipmentDetails[0].items[x].category == "Service and Replacement" || other.equipmentDetails[0].items[x].category == "SALES" || other.equipmentDetails[0].items[x].category == "Services") {

      } else {
        category = true;
        break;
      }
    }
    //check customer first
    if(other.customerId == 0 || other.customerId == null) {
      IonPopup.alert({title: 'NO CUSTOMER FOUND', template: 'Need customer to generate invoice number.'});
    } else if(category == true) {
      IonPopup.alert({title: 'CATEGORIES NOT COMPLETE', template: 'Need all items to have a category selected.'});
    } else {
      var template;
      if(other.quickbooksInvoiceQueryId == "Pending") {
        template = 'You will be creating a new invoice number. Are you <strong>really</strong> sure?';
        IonPopup.confirm({
          title: 'GENERATE INVOICE NUMBER',
          template: template,
          onOk: function() {
            $("#syncWithQuickBooks").css('display', 'none');

        var quickbooksAttributes = {
          _id: Router.current().params._id,
          quickbooksInvoiceQueryId: other.quickbooksInvoiceQueryId
        };

        Meteor.call("pendingInvoiceSync", Router.current().params._id);
        Meteor.call('updateOtherQuickbooksInvoice', quickbooksAttributes, function(error, result) {
          
        });
          },
          onCancel: function() {
          }
        });
      } else {
        $("#syncWithQuickBooks").css('display', 'none');

        var quickbooksAttributes = {
          _id: Router.current().params._id,
          quickbooksInvoiceQueryId: other.quickbooksInvoiceQueryId
        };

        Meteor.call("pendingInvoiceSync", Router.current().params._id);
        Meteor.call('updateOtherQuickbooksInvoice', quickbooksAttributes, function(error, result) {
          
        });
      }
    }
  },
  'click .saveQuantity': function(event, template) {
    console.log("saveQuantity");
    event.preventDefault();

    var string = event.currentTarget.id.split("_");
    var id = string[1]+"_"+string[2];

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        quantity: $("#quantity_"+id).val()
    };

    console.log(attributes);
    Meteor.call('addOtherCustomQuantity', attributes, function(error, result) {
      $(".quantityShow_"+id).css("display", "");
      $(".quantityEdit_"+id).css("display", "none");

      if(result == "Done") {
        var attributes2 = {
            _id: Router.current().params._id,
            id: event.currentTarget.id,
            quantity: $("#quantity_"+id).val()
        };

        Meteor.call('updateOtherLinePrice', attributes2, function(error, result) {
          Meteor.call('updateOverallOtherPrice', Router.current().params._id);
        });

        var other = Others.findOne({_id: Router.current().params._id});
        Meteor.call("checkOtherInvoiceNeedingUpdate", Router.current().params._id);

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " updated quantity of " + $("#item_"+id).val() + " to " + $("#quantity_"+id).val() + ".",
          universalContent: Meteor.user().username + " updated quantity of " + $("#item_"+id).val() + " of Invoice " + Router.current().params._id + " to " + $("#quantity_"+id).val() + ".",
          ownerUsername: Meteor.user().username,
          type: "Others",
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertOtherLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      }
    });


  },
  'click .editQuantity': function(event, template) {

    $(".quantityShow_"+event.currentTarget.id).css("display", "none");
    $(".quantityEdit_"+event.currentTarget.id).css("display", "");

  },
  'click .saveItem': function(event, template) {
    event.preventDefault();

    var string = event.currentTarget.id.split("_");
    var id = string[1]+"_"+string[2];

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        item: $("#item_"+id).val(),
        category: $("#category_"+id).val()
    };

    Meteor.call('addOtherCustomItem', attributes, function(error, result) {
      $(".itemShow_"+id).css("display", "");
      $(".itemEdit_"+id).css("display", "none");

      if(result == "Done") {

        Meteor.call("checkOtherInvoiceNeedingUpdate", Router.current().params._id);

        var attributes = {
                _id: Router.current().params._id,
                content: Meteor.user().username + " updated item name to " + $("#item_"+id).val() + ".",
                universalContent: Meteor.user().username + " updated item name of Invoice " + Router.current().params._id + " to " + $("#item_"+id).val() + ".",
                ownerUsername: Meteor.user().username,
                type: "Others",
                url: Router.current().params._id,
                ownerId: Meteor.userId()
        };

        Meteor.call("insertOtherLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      }
    });
  },
  'click .editItem': function(event, template) {
    
    $(".itemShow_"+event.currentTarget.id).css("display", "none");
    $(".itemEdit_"+event.currentTarget.id).css("display", "");
  },
  'click .goToCustomer': function(event, template) {
    Router.go('customers.show', {_id: event.currentTarget.id}, {});
  },
  'change .categorySelect': function(event, template) {
    event.preventDefault();


    var string = event.currentTarget.id.split("_");
    var id = string[1]+"_"+string[2];

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        item: $("#item_"+id).val(),
        category: $("#category_"+id).val()
    };

    Meteor.call('addOtherCustomItem', attributes, function(error, result) {
      if(result == "Done") {
        var other = Others.findOne({_id: Router.current().params._id});
        Meteor.call("checkOtherInvoiceNeedingUpdate", Router.current().params._id);

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " updated category of " + $("#item_"+id).val() + " to " + $("#category_"+id).val() + ".",
          universalContent: Meteor.user().username + " updated category of " + $("#item_"+id).val() + " of Invoice " + Router.current().params._id + " to " + $("#category_"+id).val() + ".",
          ownerUsername: Meteor.user().username,
          type: "Others",
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertOtherLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      }
    });
  },
  'click #cancelCustomerName': function(e) {
    $("#selectCustomerName").css("display", "none");
    $("#showCustomerName").css("display", "block");
  },
  'click #editCustomerName': function(e) {
    $("#selectCustomerName").css("display", "block");
    $("#showCustomerName").css("display", "none");
  },
  'click .editDiscount': function(e) {
    $(".discountShow_"+e.currentTarget.id).css("display", "none");
    $(".discountEdit_"+e.currentTarget.id).css("display", "block");
  },
  'click .saveDiscount': function(e) {
    $(".discountShow_"+e.currentTarget.id).css("display", "block");
    $(".discountEdit_"+e.currentTarget.id).css("display", "none");

    var attributes = {
      _id: Router.current().params._id,
      id: e.currentTarget.id,
      discount: parseFloat($("#discount_"+e.currentTarget.id).val())
    };

    Meteor.call('updateOtherItemDiscount', attributes, function(error, result) {
      var attributes2 = {
        _id: Router.current().params._id,
        id: e.currentTarget.id,
        discount: parseFloat($("#discount_"+e.currentTarget.id).val())
      };
      Meteor.call('updateOtherLinePrice', attributes2, function(error, result) {
          Meteor.call('updateOverallOtherPrice', Router.current().params._id);
        });
    });

    var item = $("#item_"+e.currentTarget.id).val();

    var attributes = {
      _id: Router.current().params._id,
      content: Meteor.user().username + " updated discount of " + item + " to " + accounting.formatMoney(parseFloat($("#discount_"+e.currentTarget.id).val()).toFixed(2)) + ".",
      universalContent: Meteor.user().username + " updated discount of " + item + " of Invoice " + Router.current().params._id + " to " + accounting.formatMoney(parseFloat($("#discount_"+e.currentTarget.id).val()).toFixed(2)) + ".",
      ownerUsername: Meteor.user().username,
      type: "Others",
      url: Router.current().params._id,
      ownerId: Meteor.userId()
    };

    Meteor.call("insertOtherLog", attributes);
    Meteor.call("insertUniversalLog", attributes);
  },
  'click .editPrice': function(e) {
    $(".priceShow_"+e.currentTarget.id).css("display", "none");
    $(".priceEdit_"+e.currentTarget.id).css("display", "block");
  },
  'click .savePrice': function(e) {
    $(".priceShow_"+e.currentTarget.id).css("display", "block");
    $(".priceEdit_"+e.currentTarget.id).css("display", "none");

    var attributes = {
      _id: Router.current().params._id,
      id: e.currentTarget.id,
      price: parseFloat($("#price_"+e.currentTarget.id).val())
    };

    Meteor.call('updateOtherItemPrice', attributes, function(error, result) {
      var attributes2 = {
        _id: Router.current().params._id,
        id: e.currentTarget.id,
        price: parseFloat($("#price_"+e.currentTarget.id).val())
      };
      Meteor.call('updateOtherLinePrice', attributes2, function(error, result) {
        Meteor.call('updateOverallOtherPrice', Router.current().params._id);
      });
    });

    var item = $("#item_"+e.currentTarget.id).val();

    var attributes = {
      _id: Router.current().params._id,
      content: Meteor.user().username + " updated price of " + item + " to " + accounting.formatMoney(parseFloat($("#price_"+e.currentTarget.id).val()).toFixed(2)) + ".",
      universalContent: Meteor.user().username + " updated price of " + item + " of Invoice " + Router.current().params._id + " to " + accounting.formatMoney(parseFloat($("#price_"+e.currentTarget.id).val()).toFixed(2)) + ".",
      ownerUsername: Meteor.user().username,
      type: "Others",
      url: Router.current().params._id,
      ownerId: Meteor.userId()
    };

    Meteor.call("insertOtherLog", attributes);
    Meteor.call("insertUniversalLog", attributes);
    
  },
  'click [data-action="selectResolve"]': function(event, template) {
    IonPopup.show({
      title: 'What to do?',
      template: '',
      buttons: [{
        text: 'Cancel',
        type: 'button-stable',
        onTap: function() {
          IonPopup.close();
        }
      },
      {
        text: 'Resolve',
        type: 'button-positive',
        onTap: function() {
          IonPopup.close();
          var attributes = {
            _id: Router.current().params._id,
            remarkId: event.currentTarget.id
          };

          Meteor.call('updateResolution', attributes, function(error, result) {
          });
        }
      }
      ]
    });
    $(".popup-body").css("display", "none");
  },
  'click .linkedInvoice': function(e) {
    Router.go('bookings.show', {_id: e.currentTarget.id}, {});
  },
  // 'click #saveCustomerName': function(e) {

  //   var attributes = {
  //     _id: Router.current().params._id,
  //     customerId: $("#customerSearch2").val()
  //   };

  //   Meteor.call('updateInvoiceCustomerName', attributes, function(error, result) {
  //     $("#selectCustomerName").css("display", "none");
  //     $("#showCustomerName").css("display", "block");

  //   });
  // },
  'click .searchedCustomer': function(e) {
    var customer = Customers.findOne({_id: e.currentTarget.id});
    var other = Others.findOne({_id: Router.current().params._id});

    var customerId = e.currentTarget.id;
    var attributes = {
      _id: Router.current().params._id,
      customerId: customerId
    };

    Meteor.call('updateInvoiceCustomerName', attributes, function(error, result) {
      $("#selectCustomerName").css("display", "none");
      $("#showCustomerName").css("display", "block");
      // $("#customerName").css("height", "142px");


      Meteor.call("checkOtherInvoiceNeedingUpdate", Router.current().params._id);

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated customer name to " + customer.name + ".",
        universalContent: Meteor.user().username + " updated customer name of Invoice " + Router.current().params._id + " to " + customer.name + ".",
        ownerUsername: Meteor.user().username,
        type: "Others",
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertOtherLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
      
    });
  },
  'click #confirmBooking': function(e) {

    var booking = Bookings.findOne({_id: Router.current().params._id});
    var customer = Customers.findOne({_id: booking.customerId});
    var invoiceAttributes = {
      _id: Router.current().params._id,
      customerQuickBooksId: customer.quickbooksId
    };

    Meteor.call('createQuickbooksInvoice', invoiceAttributes, function(error, result) {
      IonModal.close();
      IonKeyboard.close();
    });
  },
  'click #editProjectName': function(e) {
    $("#showProjectNameInput").css("display", "block");
    $("#showProjectName").css("display", "none");
  },
  'click #saveProjectName': function(e) {
    e.preventDefault();

    var attributes = {
      _id: Router.current().params._id,
      projectName: $("#projectNameInput").val()
    };

    Meteor.call('updateOtherProjectName', attributes, function(error, result) {
      $("#showProjectNameInput").css("display", "none");
      $("#showProjectName").css("display", "block");

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated project name to " + $("#projectNameInput").val() + ".",
        universalContent: Meteor.user().username + " updated project name of Invoice " + Router.current().params._id + " to " + $("#projectNameInput").val() + ".",
        ownerUsername: Meteor.user().username,
        type: "Others",
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertOtherLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click #recordPayment': function(e) {
    var other = Others.findOne({_id: Router.current().params._id});
    Session.setTemp("balanceDue", other.balanceDue);
    Session.setTemp("originalBalanceDue", other.balanceDue);
  },
  'click #cancelProjectName': function(e) {
    e.preventDefault();
    $("#showProjectNameInput").css("display", "none");
    $("#showProjectName").css("display", "block");
  },
  'click .addOtherItem': function(e) {
    e.preventDefault();
    
    var other = Others.findOne({_id: Router.current().params._id});
    var groupCounter = other.equipmentDetails[0].items.length;

    var ct = 0;
    var ct2 = 0;

    var x2 = 0;

    for(x in other.customerSignOut) {
      if(other.customerSignOut[x].status == "Signed") {
        x2 = parseInt(x)+1;
        ct++;
      }
    }

    if(other.customerSignOut[x2] == undefined) {
      ct2 = 0;
    } else {
      ct2 = other.customerSignOut[x2].items.length;
    }

    var itemAttributes = {
        _id: Router.current().params._id,
        id: ct + "_" + ct2,
        quantity: 0,
        item: "",
        groupCounter: groupCounter,
        category: "",
        subAmount: 0,
        price: 0,
        discount: 0
    };

    console.log(itemAttributes);

    Meteor.call('addOtherItem', itemAttributes, function(error, result) {
    });  
  },
  'click #cancelBooking': function(e) {
    e.preventDefault();
  },
  'click .status': function(e) {
    Session.setTemp("itemSelected", e.currentTarget.id);
  },
  'click [data-action="showAcknowledgeRemarkDeleteConfirm"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Remark',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {

        var attributes = {
          _id: Router.current().params._id,
          remarkId: event.currentTarget.id
        };

        Meteor.call('deleteAcknowledgeRemark', attributes, function(error, result) {
          IonModal.close();
          IonKeyboard.close();
        });
      },
      onCancel: function() {
        IonModal.close();
        IonKeyboard.close();
      }
    });
  },
  'click #createInvoice': function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    var customerDetails = new Object();
    customerDetails.id = booking.customerId;
    customerDetails.name = booking.customerName;
    customerDetails.company = booking.customerCompany; 
    customerDetails.number = booking.customerNumber; 
    customerDetails.email = booking.customerEmail; 



    Meteor.call('addInvoiceBooking', customerDetails, function(error, result) {
      Router.go('bookings.show', {_id: result}); 
    });
  },
  'click [data-action="showDeleteConfirm"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Invoice',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {

        Meteor.call('removeOtherInvoiceNeedingUpdate', Router.current().params._id);

        var other = Others.findOne({_id: Router.current().params._id});
        if(other.quickbooksInvoiceQueryId == "Pending") {
          Meteor.call('deleteOther', Router.current().params._id, function(error, result) {
          });

          Router.go('customers.show', {_id: other.customerId}, {});
        } else if(other.quickbooksInvoiceQueryId != "Pending") {
          Meteor.call('voidOther', Router.current().params._id, function(error, result) {
            if(result) {
              var quickbooksAttributes = {
                _id: Router.current().params._id,
                quickbooksInvoiceQueryId: other.quickbooksInvoiceQueryId
              };

              Meteor.call('updateOtherQuickbooksInvoice', quickbooksAttributes, function(error, result) {
                var attributes = {
                  _id: Router.current().params._id,
                  content: Meteor.user().username + " voided invoice.",
                  universalContent: Meteor.user().username + " voided invoice " + Router.current().params._id + ".",
                  ownerUsername: Meteor.user().username,
                  type: "Others",
                  url: Router.current().params._id,
                  ownerId: Meteor.userId()
                };

                Meteor.call("insertOtherLog", attributes);
                Meteor.call("insertUniversalLog", attributes);

                window.open('http://192.168.1.176:5000/void-other-invoice?id='+other.quickbooksInvoiceQueryId, '_blank');
              });

              Meteor.setTimeout(function(){
                if(document.getElementById("invoicestatus").innerHTML == "Pending") {
                  Session.setTemp("needtoauthenticate", true);
                }
              }, 3500);
            }
            
          });
        }
      },
      onCancel: function() {
      }
    });
  },
  'click .dots': function(e) {
    e.preventDefault();
  },
  'click .equipment' : function(e) {
    var string = e.currentTarget.id.split("_");
    
    Session.setTemp("equipmentSelected", string[2] + " " + string[3]);
    Session.setTemp("equipmentSelectedId", string[1]);
    Session.setTemp("equipmentGroup", string[0]);

    Router.go('othersSerialNoSelect', {_id: Router.current().params._id}, {});
  },
  'click .removePayment': function(e) {
    e.preventDefault();
    var price = Others.findOne({_id: Router.current().params._id}).payment[e.currentTarget.id];
    var obj = new Object();
    obj._id = Router.current().params._id;
    obj.paymentId = e.currentTarget.id;
    Meteor.call('deleteOtherPayment', obj, function(error, result) {
      var attributes;
      if(price.serialNo == undefined) {
        attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " removed " + price.type + " payment of " + accounting.formatMoney(price.amount) + ".",
          universalContent: Meteor.user().username + " removed " + price.type + " payment of " + accounting.formatMoney(price.amount) + " from invoice " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: "Others",
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };
      } else {
        attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " removed " + price.type + " serial no: " + price.serialNo + " payment of " + accounting.formatMoney(price.amount) + ".",
          universalContent: Meteor.user().username + " removed " + price.type + " serial no: " + price.serialNo + " payment of " + accounting.formatMoney(price.amount) + " from invoice " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: "Others",
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };
      }

      Meteor.call("insertOtherLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .removeRemark': function(e) {
    e.preventDefault();
    var obj = new Object();
    obj.current = Router.current().params._id;
    obj.remarkId = e.currentTarget.id;
    var remark = Others.findOne({_id: Router.current().params._id}).remarks[e.currentTarget.id];
    
    console.log("e.currentTarget.id");
    console.log(e.currentTarget.id);

    console.log("remark");
    console.log(remark);

    Meteor.call('deleteOtherRemark', obj, function(error, result) {
      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " removed remark: " + remark.remark + ".",
        universalContent: Meteor.user().username + " removed remark: " + remark.remark + " from invoice " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: "Others",
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertOtherLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .addBookingDates': function(e) {
    e.preventDefault();
    
    Session.setTemp("bookingGroupClicked", e.currentTarget.id);
    Router.go('bookingsAddBookingDates', {_id: Router.current().params._id}, {});
  },
  'click .itemCheckbox': function(e) {
    var string = e.currentTarget.id.split("-");
    if(string[1] == "out") {
      document.getElementById(string[0]+"-back").checked=false;
    } else {
      document.getElementById(string[0]+"-out").checked=false;
    }

    var attributes = {
      _id: Router.current().params._id,
      id: string[0],
      availability: string[1]
    };

    Meteor.call('updateAvailability', attributes, function(error,result) {

    });
  },
  'click #title': function(e) {
    e.preventDefault();
  },
  'keyup #remark': function(e) {
    if($("#remark").val() != "") {
      Session.setTemp("remarkButton", "able");
    } else {
      Session.setTemp("remarkButton", "disabled");
    }
  },
  'click .remove': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    var item = $("#item_"+e.currentTarget.id).val();

    Meteor.call('removeOtherItem', attributes, function(error, result) {
      if(result == "Done") {
        Meteor.call('updateOverallOtherPrice', Router.current().params._id);

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " removed " + item + ".",
          universalContent: Meteor.user().username + " removed " + item + " from Invoice " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: "Others",
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertOtherLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      }
    });
  },
  'click .removeGroup': function(e) {
    e.preventDefault();

    var booking = Bookings.findOne({_id: Router.current().params._id});

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id,
        originalBooking: booking
    };

    Meteor.call('removeBookingGroup', attributes, function(error, result) {
    });
  },
  'click .add': function(e) {
    e.preventDefault();

    var string = e.currentTarget.id.split("_");

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id,
        dates: Bookings.findOne({_id: Router.current().params._id}).equipmentDetails[string[0]].dates
    };

    Meteor.call('addQuantityToBookingItem', attributes, function(error, result) {
    });
    Meteor.call('updatePrice', Router.current().params._id);
    Meteor.call('checkCalendars', Router.current().params._id);
  },
  'click .minus': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    Meteor.call('minusQuantityToBookingItem', attributes, function(error, result) {
    });
    Meteor.call('updatePrice', Router.current().params._id);
  },
  'click #addGroup': function(e) {
    e.preventDefault();

    Meteor.call('addGroup', Router.current().params._id);
  },
  'click #addRemark': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        remark: $("#remark").val()
    };

    var remark = $("#remark").val();

    Meteor.call('addOtherRemark', attributes, function(error, result) {
      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " added remark: " + remark + ".",
        universalContent: Meteor.user().username + " added remark: " + remark + " to invoice " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: "Others",
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertOtherLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });

    $("#remark").val("");
    Session.setTemp("remarkButton", "disabled");
  },
  'click .remark': function(e) {
    var other = Others.findOne({_id: Router.current().params._id});
    var remarks = other.remarks;

    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        remarks[e.currentTarget.id]['status'] = "Close";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateOtherRemark', itemAttributes, function(error, result) {
          var remark = remarks[e.currentTarget.id];

          var attributes = {
            _id: Router.current().params._id,
            content: Meteor.user().username + " updated status of remark: " + remark.remark + " to done.",
            universalContent: Meteor.user().username + " updated status of remark: " + remark.remark + " of invoice " + Router.current().params._id + " to done.",
            ownerUsername: Meteor.user().username,
            type: "Others",
            url: Router.current().params._id,
            ownerId: Meteor.userId()
          };

          Meteor.call("insertOtherLog", attributes);
          Meteor.call("insertUniversalLog", attributes);
        });
      } else {
        remarks[e.currentTarget.id]['status'] = "Open";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateOtherRemark', itemAttributes, function(error, result) {
          var remark = remarks[e.currentTarget.id];

          var attributes = {
            _id: Router.current().params._id,
            content: Meteor.user().username + " updated status of remark: " + remark.remark + " to undone.",
            universalContent: Meteor.user().username + " updated status of remark: " + remark.remark + " of invoice " + Router.current().params._id + " to undone.",
            ownerUsername: Meteor.user().username,
            type: "Others",
            url: Router.current().params._id,
            ownerId: Meteor.userId()
          };

          Meteor.call("insertOtherLog", attributes);
          Meteor.call("insertUniversalLog", attributes);
        });
      }
    }
  },
  'click .remarkSignOut': function(e) {



    Session.setTemp("remarkSignOutClicked", e.currentTarget.id);
  },
  'click .remarkSignIn': function(e) {

    Session.setTemp("remarkSignInClicked", e.currentTarget.id);
  },
  'click .remarkAcknowledge': function(e) {

    Session.setTemp("remarkAcknowledgeClicked", e.currentTarget.id);

    var booking = Bookings.findOne({_id: Router.current().params._id});
    var remarksRequiringAcknowledgement = booking.remarksRequiringAcknowledgement;

    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var remarksAcknowledgeId = Session.get("remarksAcknowledgeId");
        remarksAcknowledgeId.push(e.currentTarget.id);
        Session.setTemp("remarksAcknowledgeId", remarksAcknowledgeId);
      } else {
        var remarksAcknowledgeId = Session.get("remarksAcknowledgeId");
        for(x in remarksAcknowledgeId) {
          if(remarksAcknowledgeId[x] == e.currentTarget.id) {
            remarksAcknowledgeId.splice(x, 1);
          }
        }
        Session.setTemp("remarksAcknowledgeId", remarksAcknowledgeId);
      }
    }
  }
});