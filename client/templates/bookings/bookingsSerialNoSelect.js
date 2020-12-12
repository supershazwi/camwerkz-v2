Template.bookingsSerialNoSelect.created = function () {
  this.subscribe('inventoryItemByBookingLineItem', Session.get("bookingLineItemSelected"));
  this.subscribe('bookingcustomersByBooking2', Router.current().params._id);
  this.subscribe('customerByBooking', Router.current().params._id);
  this.subscribe('specificBookingLineItem', Session.get("bookingLineItemSelected"));
  this.subscribe('bookingstatusesbybooking', Router.current().params._id);
  this.subscribe('bookingacknowledgeremarksByBooking', Router.current().params._id);
  this.subscribe('bookingsigninsbybooking', Router.current().params._id);
  this.subscribe('bookingsignoutsbybooking', Router.current().params._id);
  this.subscribe('bookinggroupsByBooking', Router.current().params._id);
  this.subscribe('bookingpricesByBooking', Router.current().params._id);
  this.subscribe('bookinggrouppricesByBooking', Router.current().params._id);
  this.subscribe('equipmentcalendarsbybooking', Router.current().params._id);
  this.subscribe('clashbookinglineitembybooking', Router.current().params._id);
  this.subscribe('logsByBooking', Router.current().params._id);

  this.autorun(function () {
    var bookingLineItem = BookingLineItems.findOne({_id: Session.get("bookingLineItemSelected")});

    Session.setTemp("equipmentSelectedId", bookingLineItem.itemId);

    var serialNoArray = [];

    serialNoArray = serialNoArray.concat(bookingLineItem.unclashableSerialNumbers);
    serialNoArray = serialNoArray.concat(bookingLineItem.clashableSerialNumbers);

    Session.setTemp("serialNoArray", serialNoArray);
  }.bind(this));
};

Template.bookingsSerialNoSelect.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');


};

Template.bookingsSerialNoSelect.helpers({
  selectedEquipment: function() {

    var bookingLineItem = BookingLineItems.findOne({_id: Session.get("bookingLineItemSelected")});

    if(bookingLineItem.category == "Custom Item Rental") {
      return bookingLineItem.item;
    } else {
      return (bookingLineItem.brand + " " + bookingLineItem.item);
    }
  },
  isDamaged: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Damaged");
      }
    }
  },
  isMissing: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Missing");
      }
    }
  },
  isOut: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Out");
      }
    }
  },
  isIn: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "In");
      }
    }
  },
  isPacked: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Packed");
      }
    }
  },
  isNA: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "N/A");
      }
    }
  },
  serialNumbers: function() {
    var item = Inventory.findOne({_id: Session.get("equipmentSelectedId")});
    return item.serialNo;
  },
  remarksExist: function() {
    if(this.remarkCount != 0) {
      return true;
    } else {
      return false;
    }
  },
  remarkOpen: function() {
    if(this.status == "Open") {
      return true;
    } else {
      return false;
    }
  },
  textDecoration: function() {
    if(this.status == "Open") {
      return "";
    } else {
      return "line-through";
    }
  },
  createdAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  checkboxChecked: function() {

  	var bookingLineItem = BookingLineItems.findOne({_id: Session.get("bookingLineItemSelected")});

    for(y in bookingLineItem.clashableSerialNumbers) {
      if(bookingLineItem.clashableSerialNumbers[y].serialNo == this.serialNo) {
        return true;
      }
    }
    for(y in bookingLineItem.unclashableSerialNumbers) {
      if(bookingLineItem.unclashableSerialNumbers[y].serialNo == this.serialNo) {
        return true;
      }
    }

  },
  displayCheckbox: function() {
    var statuses = ["Sent For Repair", "Waiting To Be Sent For Repair", "Missing", "Damaged"];
    if(!(statuses.indexOf(this.status) != -1)) {
      return "visible";
    } else {
      return "hidden";
    }
  }
});

Template.bookingsSerialNoSelect.events({
  'click .status': function(e) {

    if(e.target.localName == "button") {
      var string = e.currentTarget.id.split("_");



      var serialNo = string[0];
      var status = string[1];






      if(status == "Out") {

        if(Session.get("customerAlert") == false || Session.get("customerAlert") == undefined) {


          var customer = Customers.findOne({_id: Bookings.findOne({_id: Router.current().params._id}).customerId});


          var ICfound = false;
          var emailFound = false;
          var contactNoFound = false;


          var string = "";
          var alert = false;

          for(x in customer.images) {
            if(customer.images[x].type == "IC") {
              ICfound = true;
              break;
            }
          }

          if(ICfound == false) {
            string = string.concat("IC");
            alert = true;
          }

          if(customer.contact == "") {
            contactNoFound = false;
            string = string.concat(", contact number");
            alert = true;
          }

          if(customer.email == "") {
            emailFound = false;
            string = string.concat(", email");
            alert = true;
          }



          if(alert) {
            IonPopup.show({
              title: "Warning",
              template: 'Customer has missing attributes: ' + string + '.',
              buttons: [{
                text: 'OK',
                type: 'button-positive',
                onTap: function() {
                  IonPopup.close();
                }
              }
              ]
            });

            Session.setTemp("customerAlert", true);
          }
        }
      }

      var attributes = {
          _id: Router.current().params._id,
          id: Session.get("equipmentGroup") + "_" + Session.get("equipmentSelectedId"),
          serialNo: serialNo,
          status: status
      };

      Meteor.call('changeSerialNoStatus', attributes, function(error, result) {
      });
    }
  },
  'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  },
  'click .removeRemark': function(e) {
    var string = e.currentTarget.id.split("_");
    var attributes = {
        _id: Router.current().params._id,
        remarkId: string[0],
        serialNo: string[1],
        inventoryId: string[2]
    };
    Meteor.call('removeSerialNoRemark', attributes, function(error, result) {
    });
  },
  'click .checkRemark': function(e) {
    var string = e.currentTarget.id.split("_");
    var status;
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        status = "Close";
      } else {
        status = "Open";
      }
      var attributes = {
          _id: Router.current().params._id,
          status: status,
          remarkId: string[0],
          serialNo: string[1],
          inventoryId: string[2]
      };

      Meteor.call('changeRemarkStatus', attributes, function(error, result) {
      });
    }
  },
  'click .addRemark': function(e) {
    document.getElementById("remark_"+e.currentTarget.id).value = "";
    $("#li_"+e.currentTarget.id).css("display", "none");
    $("#addRemark_"+e.currentTarget.id).css("display", "block");
  },
  'click .submitRemark': function(e) {
    $("#addRemark_"+e.currentTarget.id).css("display", "none");
    $("#viewRemarks_"+e.currentTarget.id).css("display", "block");

    //add remarks to inventory item
    var attributes = {
        _id: Router.current().params._id,
        id: Session.get("equipmentGroup") + "_" + Session.get("equipmentSelectedId"),
        serialNo: e.currentTarget.id,
        remark: document.getElementById("remark_"+e.currentTarget.id).value,
        status: "Open"
    };

    Meteor.call('addSerialNoRemark', attributes, function(error, result) {
    });
  },
  'click .viewRemark': function(e) {
    $("#li_"+e.currentTarget.id).css("display", "none");
    $("#viewRemarks_"+e.currentTarget.id).css("display", "block");
  },
  'click .closeRemarks': function(e) {
    $("#li_"+e.currentTarget.id).css("display", "block");
    $("#viewRemarks_"+e.currentTarget.id).css("display", "none");
  },
  'click .cancelRemark': function(e) {
    $("#li_"+e.currentTarget.id).css("display", "block");
    $("#addRemark_"+e.currentTarget.id).css("display", "none");
  },
  'click .checkSerialNo': function(e) {
    var string = e.currentTarget.id.split("_");
    var serialNo = string[1];
    var bookingGroup = parseInt(Session.get("bookingGroupSelected"));
    var bookingLineItemId = Session.get("bookingLineItemSelected");

    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
    var bookingGroup = BookingGroups.findOne({invoiceId: Router.current().params._id, groupId: bookingGroup});

    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var serialNoArray = Session.get('serialNoArray');
        var object = new Object();
        object.serialNo = string[1];
        object.status = "N/A";
        serialNoArray.push(object);
        Session.setTemp('serialNoArray', serialNoArray);

        var attributes = {
          _id: Router.current().params._id,
          bookingLineItemId: bookingLineItemId,
          dates: bookingGroup.dates,
          serialNoArray: Session.get("serialNoArray"),
          serialNoAdded: serialNo
        };

        Meteor.call('addSerialQuantityToBookingItem', attributes, function(error, result) {
          if(result.status == "Overbooked") {
            document.getElementById("checkbox_"+serialNo).checked = false;
            var string = "";
            for(x in result['dates']) {
              string = string.concat("<li>"+result['dates'][x]+"</li>");
            }
            IonPopup.show({
              title: result['inventoryItem'].brand + " " + result['inventoryItem'].item + " maxed out.",
              template: "<div style='width: 100%; text-align: center;'><ul>"+string+"</ul></div>",
              buttons: [{
                text: 'OK',
                type: 'button-stable',
                onTap: function() {
                  IonPopup.close();
                }
              },
              {
                text: 'View Calendar',
                type: 'button-positive',
                onTap: function() {
                  IonPopup.close();
                  var equipments = [];
                  equipments.push(result['inventoryItem']._id);
                  Session.setTemp('dates', result['datesDigits']);
                  Session.setTemp('equipments', equipments);

                  Router.go('overbookedCalendars', {}, {});
                }
              }
              ]
            });
          }

          Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
            Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
          });
          Meteor.call("updateBookingStatus", Router.current().params._id);

          var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
          var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
          var inventoryItem = Inventory.findOne({_id: Session.get("equipmentSelectedId")});

          var attributes;

          if(inventoryItem == undefined) {
            //custom
            attributes = {
              _id: Router.current().params._id,
              content: Meteor.user().username + " added " + bookingLineItem.item + " serial no: " + serialNo + ".",
              universalContent: Meteor.user().username + " added " + bookingLineItem.item + " serial no: " + serialNo + " to " + bookingStatus.type + " " + Router.current().params._id + ".",
              ownerUsername: Meteor.user().username,
              type: bookingStatus.type,
              url: Router.current().params._id,
              ownerId: Meteor.userId()
            };
          } else {
            attributes = {
              _id: Router.current().params._id,
              content: Meteor.user().username + " added " + inventoryItem.brand + " " + inventoryItem.item + " serial no: " + serialNo + ".",
              universalContent: Meteor.user().username + " added " + inventoryItem.brand + " " + inventoryItem.item + " serial no: " + serialNo + " to " + bookingStatus.type + " " + Router.current().params._id + ".",
              ownerUsername: Meteor.user().username,
              type: bookingStatus.type,
              url: Router.current().params._id,
              ownerId: Meteor.userId()
            };
          }

          

          Meteor.call("insertLog", attributes);
          Meteor.call("insertUniversalLog", attributes);
        });


      } else {
        var serialNoArray = Session.get('serialNoArray');
        for(x in serialNoArray) {
          if(serialNoArray[x].serialNo == string[1]) {
            serialNoArray.splice(x, 1);
          }
        }
        Session.setTemp('serialNoArray', serialNoArray);

        var attributes = {
          _id: Router.current().params._id,
          bookingLineItemId: bookingLineItemId,
          dates: bookingGroup.dates,
          serialNoArray: Session.get("serialNoArray"),
          serialNoRemoved: serialNo
        };

        Meteor.call('minusSerialQuantityToBookingItem', attributes, function(error, result) {
          Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
            Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
          });
          Meteor.call("updateBookingStatus", Router.current().params._id);

          var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
          var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
          var inventoryItem = Inventory.findOne({_id: Session.get("equipmentSelectedId")});

          var attributes;

          if(inventoryItem == undefined) {
            //custom
            attributes = {
              _id: Router.current().params._id,
              content: Meteor.user().username + " removed " + bookingLineItem.item + " serial no: " + serialNo + ".",
              universalContent: Meteor.user().username + " removed " + bookingLineItem.item + " serial no: " + serialNo + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
              ownerUsername: Meteor.user().username,
              type: bookingStatus.type,
              url: Router.current().params._id,
              ownerId: Meteor.userId()
            };
          } else {
            attributes = {
              _id: Router.current().params._id,
              content: Meteor.user().username + " removed " + inventoryItem.brand + " " + inventoryItem.item + " serial no: " + serialNo + ".",
              universalContent: Meteor.user().username + " removed " + inventoryItem.brand + " " + inventoryItem.item + " serial no: " + serialNo + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
              ownerUsername: Meteor.user().username,
              type: bookingStatus.type,
              url: Router.current().params._id,
              ownerId: Meteor.userId()
            };
          }

          

          Meteor.call("insertLog", attributes);
          Meteor.call("insertUniversalLog", attributes);
        });

      }
    }
  },
});
