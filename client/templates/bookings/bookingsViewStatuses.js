var checkbooking;
var idArray;

Template.bookingsViewStatuses.created = function () {
  this.subscribe('inventoriesByBooking', Router.current().params._id);
  this.subscribe('repairs');
  this.subscribe('customerByBooking', Router.current().params._id);
  this.subscribe('booking', Router.current().params._id);
  this.subscribe('bookingpricesByBooking', Router.current().params._id);
  this.subscribe('bookinggroupsByBooking', Router.current().params._id);
  this.subscribe('bookinglineitemsByBooking', Router.current().params._id);
  this.subscribe('bookingcustomersByBooking', Router.current().params._id);
  this.subscribe('bookingcustomersByBooking2', Router.current().params._id);

  this.subscribe('bookingacknowledgeremarksByBooking', Router.current().params._id);
  this.subscribe('bookingstatusesbybooking', Router.current().params._id);
  this.subscribe('bookingsignoutsbybooking', Router.current().params._id);
  this.subscribe('bookingsigninsbybooking', Router.current().params._id);
  this.subscribe('logsByBooking', Router.current().params._id);

  idArray = [];
  Session.setTemp("idArray", idArray);
};

Template.bookingsViewStatuses.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  this.autorun(function () {
    if(Session.get("checkbookingstatus")) {

      console.log("inside session");
      if(checkbooking) {
        Meteor.clearTimeout(checkbooking);
      }



      checkbooking = Meteor.setTimeout(function() {
        console.log("checkbooking launched");
        Meteor.call("updateBookingStatus", Router.current().params._id);

        var toCheck = Session.get("idArray");

        for(t in toCheck) {
          Meteor.call("checkFutureAffectedBookings", toCheck[t]);
        }
      }
        , 5000);
    }
  }.bind(this));
};

Template.bookingsViewStatuses.onDestroyed(function () {
  console.log('destroyed');
  var invoiceId = Router.current().params._id;
  Meteor.clearTimeout(checkbooking);

  Meteor.call("updateBookingStatus", invoiceId);
  // var toCheck = Session.get("idArray");

  // for(t in toCheck) {
  //   Meteor.call("checkFutureAffectedBookings", toCheck[t]);
  // }
});

Template.bookingsViewStatuses.helpers({
  groups: function() {
  if(BookingGroups.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingGroups = BookingGroups.find({invoiceId: Router.current().params._id}, {sort: {groupId: 1}});
      return bookingGroups;
    }
  },
  custom: function() {
    return (this.total == -1);
  },
  bookingLineItems: function() {
    return BookingLineItems.find({invoiceId:Router.current().params._id, groupCounter: this.groupId}, {sort: {sortNumber: 1}});
  },
  groupgroupid: function() {
    return (parseInt(this.groupId) + 1);
  },
  selectedEquipment: function() {
    return Session.get("equipmentSelected");
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
    return Session.get("serialNoArray");
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
  isDamaged: function() {
    return (this.status == "Damaged");
  },
  isMissing: function() {
    return (this.status == "Missing");
  },
  isOut: function() {
    return (this.status == "Out");
  },
  isIn: function() {
    return (this.status == "In");
  },
  isPacked: function() {
    return (this.status == "Packed");
  },
  isNA: function() {
    return (this.status == "N/A");
  },
  groupId: function() {
    return (parseInt(this.groupId));
  },
  groupCounter: function() {
    return (parseInt(this.groupCounter) + 1);
  },
  categoryBackground: function() {
    if(this.category == "Studio Usage") {
      return "#A68B6A";
    }
    if(this.category == "Cameras") {
      return "#B64926";
    }
    if(this.category == "Electronics") {
      return "#225378";
    }
    if(this.category == "Monitors") {
      return "#962D3E";
    }
    if(this.category == "Accessories") {
      return "#2A2C2B";
    }
    if(this.category == "Batteries") {
      return "#7E8AA2";
    }
    if(this.category == "Cards") {
      return "#9967C8";
    }
    if(this.category == "Tripods") {
      return "#723147";
    }
    if(this.category == "Sound") {
      return "#00A388";
    }
    if(this.category == "Lens") {
      return "#2185C5";
    }
    if(this.category == "Filters") {
      return "#FFDC00";
    }
    if(this.category == "Lights") {
      return "#FF9800";
    }
    if(this.category == "Grips") {
      return "#374140";
    }
  },
  noOfItems: function() {
    return this.booked;
  },
  checkboxChecked: function() {

  	var booking = Bookings.findOne({_id: Router.current().params._id});
    for(x in booking.equipmentDetails[Session.get("equipmentGroup")].items) {
      if(booking.equipmentDetails[Session.get("equipmentGroup")].items[x].itemId == Session.get("equipmentSelectedId")) {
        for(y in booking.equipmentDetails[Session.get("equipmentGroup")].items[x].clashableSerialNumbers) {
          if(booking.equipmentDetails[Session.get("equipmentGroup")].items[x].clashableSerialNumbers[y].serialNo == this.serialNo) {
            return true;
          }
        }
        for(y in booking.equipmentDetails[Session.get("equipmentGroup")].items[x].unclashableSerialNumbers) {
          if(booking.equipmentDetails[Session.get("equipmentGroup")].items[x].unclashableSerialNumbers[y].serialNo == this.serialNo) {
            return true;
          }
        }

        break;
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
  },
  serialNo: function() {
    return this.serialNo;
  },
  toSetId: function() {
    var string = this.id.split("_");
    Session.setTemp("groupId", string[0]);
    Session.setTemp("itemId", this.itemId);
  }
});

Template.bookingsViewStatuses.events({
  'click .status': function(e) {
    if(e.target.localName == "button") {
      var string = e.currentTarget.id.split("_");

      

      if(string.length == 4) {
        var serialNo = string[0];
        var status = string[1];
        var itemId = string[2];
        var groupId = string[3];

        if(status == "Out") {
          if(Session.get("customerAlert") == false || Session.get("customerAlert") == undefined) {
            var customer = Customers.findOne({_id: BookingCustomers.findOne({invoiceId: Router.current().params._id}).customerId});
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
            id: groupId + "_" + itemId,
            serialNo: serialNo,
            status: status
        };

        Meteor.call('changeSerialNoStatus', attributes, function(error, result) {
          
          var itemAttributes = {
              _id: itemId,
              serialNo: serialNo,
              status: status
          };

          var idArraySession = Session.get("idArray");
          idArraySession.push(itemAttributes);
          Session.setTemp("idArray", idArraySession);

          // Meteor.call("checkFutureAffectedBookings", itemAttributes);

          Session.setTemp("checkbookingstatus", Math.random());

          // var inventoryItem = Inventory.findOne({_id: itemId});

          // var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

          // if(inventoryItem == undefined) {
          //   var bookingLineItem = BookingLineItems.findOne({_id: itemId});
          //   // custom
          //   var attributes = {
          //     _id: Router.current().params._id,
          //     content: Meteor.user().username + " updated " + bookingLineItem.item + " serial no: " + serialNo + " status to " + status + ".",
          //     universalContent: Meteor.user().username + " updated " + bookingLineItem.item + " serial no: " + serialNo + " of " + bookingStatus.type + " " + Router.current().params._id + " status to " + status + ".",
          //     ownerUsername: Meteor.user().username,
          //     type: bookingStatus.type,
          //     url: Router.current().params._id,
          //     ownerId: Meteor.userId()
          //   };
          // } else {
          //   var attributes = {
          //     _id: Router.current().params._id,
          //     content: Meteor.user().username + " updated " + inventoryItem.brand + " " + inventoryItem.item + " serial no: " + serialNo + " status to " + status + ".",
          //     universalContent: Meteor.user().username + " updated " + inventoryItem.brand + " " + inventoryItem.item + " serial no: " + serialNo + " of " + bookingStatus.type + " " + Router.current().params._id + " status to " + status + ".",
          //     ownerUsername: Meteor.user().username,
          //     type: bookingStatus.type,
          //     url: Router.current().params._id,
          //     ownerId: Meteor.userId()
          //   };
          // }

          

          // Meteor.call("insertLog", attributes);
          // Meteor.call("insertUniversalLog", attributes);
        });
      } 
      //else {
      //   console.log("length != 4");
      //   var serialNo = string[0];
      //   var status = string[1];
      //   var itemId = string[2]+"_"+string[3]+"_"+string[4];
      //   var groupId = string[5];

      //   if(status == "Out") {
      //     if(Session.get("customerAlert") == false || Session.get("customerAlert") == undefined) {
      //       var customer = Customers.findOne({_id: Bookings.findOne({_id: Router.current().params._id}).customerId});
      //       var ICfound = false;
      //       var emailFound = false;
      //       var contactNoFound = false;


      //       var string = "";
      //       var alert = false;
      //       for(x in customer.images) {
      //         if(customer.images[x].type == "IC") {
      //           ICfound = true;
      //           break;
      //         }
      //       }

      //       if(ICfound == false) {
      //         string = string.concat("IC");
      //         alert = true;
      //       }

      //       if(customer.contact == "") {
      //         contactNoFound = false;
      //         string = string.concat(", contact number");
      //         alert = true;
      //       }

      //       if(customer.email == "") {
      //         emailFound = false;
      //         string = string.concat(", email");
      //         alert = true;
      //       }

      //       if(alert) {
      //         IonPopup.show({
      //           title: "Warning",
      //           template: 'Customer has missing attributes: ' + string + '.',
      //           buttons: [{
      //             text: 'OK',
      //             type: 'button-positive',
      //             onTap: function() {
      //               IonPopup.close();
      //             }
      //           }
      //           ]
      //         });

      //         Session.setTemp("customerAlert", true);
      //       }
      //     }
      //   }

      //   var attributes = {
      //       _id: Router.current().params._id,
      //       id: groupId + "_" + itemId,
      //       serialNo: serialNo,
      //       status: status
      //   };

      //   Meteor.call('changeCustomSerialNoStatus', attributes, function(error, result) {
      //     Meteor.call("updateBookingStatus", Router.current().params._id);

      //     var inventoryItem = Inventory.findOne({_id: itemId});

      //     var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      //     var attributes = {
      //       _id: Router.current().params._id,
      //       content: Meteor.user().username + " updated " + inventoryItem.brand + " " + inventoryItem.item + " " + serialNo + " status to " + status + ".",
      //       universalContent: Meteor.user().username + " updated " + inventoryItem.brand + " " + inventoryItem.item + " " + serialNo + " of " + bookingStatus.type + " " + Router.current().params._id + " status to " + status + ".",
      //       ownerUsername: Meteor.user().username,
      //       type: bookingStatus.type,
      //       url: Router.current().params._id,
      //       ownerId: Meteor.userId()
      //     };

      //     Meteor.call("insertLog", attributes);
      //     Meteor.call("insertUniversalLog", attributes);
      //   });
      // }
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
          id: Session.get("equipmentGroup") + "_" + Session.get("equipmentSelectedId") + "_" + Session.get("equipmentGroupCounter"),
          dates: Bookings.findOne({_id: Router.current().params._id}).equipmentDetails[Session.get("equipmentGroup")].dates,
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
          id: Session.get("equipmentGroup") + "_" + Session.get("equipmentSelectedId") + "_" + Session.get("equipmentGroupCounter"),
          dates: Bookings.findOne({_id: Router.current().params._id}).equipmentDetails[Session.get("equipmentGroup")].dates,
          serialNoArray: Session.get("serialNoArray"),
          serialNoRemoved: serialNo
        };

        Meteor.call('minusSerialQuantityToBookingItem', attributes, function(error, result) {
        });

      }
    }
  },
});
