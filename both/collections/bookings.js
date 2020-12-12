Bookings = new Mongo.Collection('bookings');

Bookings.before.insert(function (userId, doc) {
  doc.createdAt = new Date();
  doc.createdBy = userId;
});

Bookings.helpers({
  dateCreated: function () {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mm:ss a');
  },
  employee: function () {
    return Meteor.users.findOne({_id: this.userId});
  },
  customer: function () {
    return Meteor.users.findOne({_id: this.userId});
  }
});

Meteor.methods({
  updateCustomerICStatus: function(id) {
    var booking = Bookings.findOne({_id: id});
    var customer = Customers.findOne({_id: booking.customerId});

    customer.icStatus = !customer.icStatus;

    delete customer._id;
    Customers.update({_id: booking.customerId}, {$set: customer});
  },
  addComment: function(details) {
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: details['_id']});
    var obj = new Object();
    obj.id = bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['id']].comments.length;
    obj.remarkId = parseInt(details['id']);
    obj.comment = details['comment'];
    obj.createdAt = new Date();
    obj.createdBy = Meteor.user().username;

    bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['id']].comments.push(obj);

    delete bookingAcknowledgeRemark._id;
    BookingAcknowledgeRemarks.update({invoiceId: details['_id']}, {$set: bookingAcknowledgeRemark});
  },
  addOtherBulkItems: function(details) {

    var other = Others.findOne({_id: details['_id']});
    var equipmentIds = details['equipmentArray'];

    var groupCounter = other.equipmentDetails[0].items.length;
    groupCounter = parseInt(groupCounter);
    for(x in equipmentIds) {

       var inventoryItem = Inventory.findOne({_id: equipmentIds[x]});

      var item = new Object();
      item.id = 0 + "_" + equipmentIds[x];
      item.item = inventoryItem.item;
      item.groupCounter = groupCounter;
      item.category = inventoryItem.category;
      item.subAmount = 0;
      item.availability = "in";
      item.brand = inventoryItem.brand;
      item.discount = 0;
      item.booked = 0;
      item.total = inventoryItem.bookableQuantity;
      item.itemId = inventoryItem._id;
      item.discountOverwrite = 0;
      item.price = 0;

      other.equipmentDetails[0].items.push(item);
      groupCounter++;
    }



    delete other._id;

    Others.update({_id: details['_id']}, {$set: other});

    return "OK";
  },
  saveBulkItems: function(details) {

    var bookingLineItems;
    var bookingGroup;
    var updatedEquipmentIds = details['equipmentArray'];
    var groupCounter = parseInt(details['id']);
    var invoiceId = details['_id'];

    var existingEquipmentIds = [];

    bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupCounter});
    bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupCounter}).fetch();

    var sortNumberArray = [];

    for(x in bookingLineItems) {
      sortNumberArray.push(bookingLineItems[x].sortNumber);
    }

    // check whether or not items have been removed
    for(x = (bookingLineItems.length -1); x >= 0; x--) {
      if(updatedEquipmentIds.indexOf(bookingLineItems[x].itemId) == -1) {
        // item is missing from updated equipment array
        BookingLineItems.remove(bookingLineItems[x]._id);
      }
    }

    bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupCounter}).fetch();

    for(x in bookingLineItems) {
      existingEquipmentIds.push(bookingLineItems[x].itemId);
    }

    // check whether or not items have been added
    for(x in updatedEquipmentIds) {
      if(existingEquipmentIds.indexOf(updatedEquipmentIds[x]) == -1) {
        var bookingLineItem = new Object();
        var inventoryItem = Inventory.findOne({_id: updatedEquipmentIds[x]});

        var sortNumber;

        if(inventoryItem.category == "Studio Usage") {
          sortNumber = 0;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Cameras") {
          sortNumber = 1;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Electronics") {
          sortNumber = 2;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Monitors") {
          sortNumber = 3;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Accessories") {
          sortNumber = 4;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Batteries") {
          sortNumber = 5;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Cards") {
          sortNumber = 6;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Tripods") {
          sortNumber = 7;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Sound") {
          sortNumber = 8;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Lens") {
          sortNumber = 9;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Filters") {
          sortNumber = 10;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Lights") {
          sortNumber = 11;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else if(inventoryItem.category == "Grips") {
          sortNumber = 12;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        } else {
          sortNumber = 13;
          while(sortNumberArray.indexOf(sortNumber) != -1) {
            sortNumber += 0.0000000001;
          }
        }

        bookingLineItem.id = groupCounter+"_"+updatedEquipmentIds[x];
        bookingLineItem.itemId = updatedEquipmentIds[x];
        bookingLineItem.brand = inventoryItem.brand;
        bookingLineItem.item = inventoryItem.item;
        bookingLineItem.category = inventoryItem.category;
        bookingLineItem.unclashableSerialNumbers = [];
        bookingLineItem.clashableSerialNumbers = [];
        bookingLineItem.groupCounter = groupCounter;
        bookingLineItem.days = bookingGroup.noOfDates;
        bookingLineItem.originalPriced = 0;
        bookingLineItem.discountPriced = 0;
        bookingLineItem.discount = 0;
        bookingLineItem.booked = 0;
        bookingLineItem.rate = inventoryItem.rate;
        bookingLineItem.total = inventoryItem.bookableQuantity;
        bookingLineItem.subAmount = 0;
        bookingLineItem.status = "N/A";
        bookingLineItem.clash = false;
        bookingLineItem.check = false;
        bookingLineItem.invoiceId = invoiceId;
        bookingLineItem.sortNumber = sortNumber;

        sortNumberArray.push(sortNumber);

        BookingLineItems.insert(bookingLineItem);
      }
    }

    return "OK";
  },
  updateInvolvedUsers: function(bookingId) {
    var booking = Bookings.findOne({_id: bookingId});
    if(booking.involvedUsers.indexOf(Meteor.user().username) == -1) {
      booking.involvedUsers.push(Meteor.user().username);
    }

    delete booking._id;
    Bookings.update({_id: bookingId}, {$set: booking});
  },
  saveNormalDiscount: function(details) {

    var invoiceId = details['_id'];
    var bookingLineItemId = details['id'];
    var originalDiscountOverwrite;

    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});

    if(details['discount'] == "") {
      return;
    }

    if(bookingLineItem.booked != 0) {
      originalDiscountOverwrite = bookingLineItem.discountOverwrite;

      bookingLineItem.discountOverwrite = parseFloat(details['discount']);
      bookingLineItem.subAmount = ((bookingLineItem.rate + bookingLineItem.discount) * bookingLineItem.days * bookingLineItem.booked) - bookingLineItem.discountOverwrite;
    }

    delete bookingLineItem._id;
    BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItem});

    return "Done";
  },
  revertPrivilege: function(details) {
  
    var bookingGroupPrice = BookingGroupPrices.findOne({invoiceId: details['_id'], groupId: parseInt(details['id'])});

    bookingGroupPrice.privilege.value = 0; //temporary
    bookingGroupPrice.privilege.edited = false;
    bookingGroupPrice.privilege.percentage = details['percentage'];

    delete bookingGroupPrice._id;
    BookingGroupPrices.update({invoiceId: details['_id'], groupId: parseInt(details['id'])}, {$set: bookingGroupPrice});

    return "Done";

    // var booking = Bookings.findOne({_id: details['_id']});
    // booking.equipmentDetails[details['id']].privilege.percentage = booking.privileges[0].value;
    // booking.equipmentDetails[details['id']].privilege.edited = false;
    //
    // var cumulatedSubAmount = 0;
    // var cumulatedSubDiscount = 0;
    //
    // for(x in booking.equipmentDetails[details['id']].items) {
    //   if(booking.equipmentDetails[details['id']].items[x].total == -1) {
    //     cumulatedSubAmount += booking.equipmentDetails[details['id']].items[x].booked * booking.equipmentDetails[details['id']].items[x].rate * booking.equipmentDetails[details['id']].items[x].days;
    //     // cumulatedSubAmount += (booking.equipmentDetails[details['id']].items[x].subAmount+booking.equipmentDetails[details['id']].items[x].discountOverwrite);
    //     if(booking.equipmentDetails[details['id']].items[x].discountOverwrite != undefined) {
    //       cumulatedSubDiscount += booking.equipmentDetails[details['id']].items[x].discountOverwrite;
    //     }
    //   } else if(booking.equipmentDetails[details['id']].items[x].packageClicked == undefined) {
    //     cumulatedSubAmount += (((booking.equipmentDetails[details['id']].items[x].rate + booking.equipmentDetails[details['id']].items[x].discount) * booking.equipmentDetails[details['id']].items[x].originalPriced) + ((booking.equipmentDetails[details['id']].items[x].discount) * booking.equipmentDetails[details['id']].items[x].discountPriced));
    //     if(booking.equipmentDetails[details['id']].items[x].discountOverwrite != undefined) {
    //       cumulatedSubDiscount += booking.equipmentDetails[details['id']].items[x].discountOverwrite;
    //     }
    //   } else {
    //     cumulatedSubAmount += (booking.equipmentDetails[details['id']].items[x].discountPriced * booking.equipmentDetails[details['id']].items[x].rate) + (booking.equipmentDetails[details['id']].items[x].originalPriced * (booking.equipmentDetails[details['id']].items[x].rate + booking.equipmentDetails[details['id']].items[x].discount));
    //     cumulatedSubDiscount += (booking.equipmentDetails[details['id']].items[x].discountPriced * booking.equipmentDetails[details['id']].items[x].rate)
    //   }
    // }
    //
    //
    //
    // booking.equipmentDetails[details['id']].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
    // if(booking.equipmentDetails[details['id']].privilege != undefined) {
    //   booking.equipmentDetails[details['id']].privilege.value = parseFloat(booking.equipmentDetails[details['id']].subTotal * booking.equipmentDetails[details['id']].privilege.percentage / 100);
    // booking.equipmentDetails[details['id']].subTotal -= booking.equipmentDetails[details['id']].privilege.value;
    // }
    // booking.equipmentDetails[details['id']].subDiscount = cumulatedSubDiscount;
    //
    // var total = 0;
    // for(x in booking.equipmentDetails) {
    //   total += booking.equipmentDetails[x].subTotal;
    // }
    //
    // booking.gst = total * 0.07;
    // booking.total = total + booking.gst;
    //
    // totalPaid = 0;
    // if(booking.payment.length != 0) {
    //   for(x in booking.payment) {
    //     totalPaid += parseFloat(booking.payment[x].amount);
    //   }
    //
    //   booking.balanceDue = parseFloat(booking.total - totalPaid);
    // } else {
    //   booking.balanceDue = parseFloat(booking.total);
    // }
    //
    // delete booking._id;
    // Bookings.update({_id: details['_id']}, {$set: booking});
    //
    // return "Done";
  },
  savePrivilege: function(details) {

    var bookingGroupPrice = BookingGroupPrices.findOne({invoiceId: details['_id'], groupId: parseInt(details['id'])});

    bookingGroupPrice.privilege.value = parseFloat(details['privilegeValue']);
    bookingGroupPrice.privilege.edited = true;
    bookingGroupPrice.privilege.percentage = (bookingGroupPrice.privilege.value / (bookingGroupPrice.subTotal - bookingGroupPrice.subDiscount) * 100);

    delete bookingGroupPrice._id;
    BookingGroupPrices.update({invoiceId: details['_id'], groupId: parseInt(details['id'])}, {$set: bookingGroupPrice});

    return "Done";

    // var booking = Bookings.findOne({_id: details['_id']});
    // var kental = parseFloat(booking.equipmentDetails[details['id']].subTotal) + parseFloat(booking.equipmentDetails[details['id']].privilege.value);
    // booking.equipmentDetails[details['id']].privilege.value = details['privilegeValue'];
    //
    // booking.equipmentDetails[details['id']].privilege.percentage = parseFloat(details['privilegeValue']/kental * 100);
    // booking.equipmentDetails[details['id']].privilege.edited = true;
    //
    // var cumulatedSubAmount = 0;
    // var cumulatedSubDiscount = 0;
    //
    // for(x in booking.equipmentDetails[details['id']].items) {
    //   if(booking.equipmentDetails[details['id']].items[x].total == -1) {
    //     cumulatedSubAmount += booking.equipmentDetails[details['id']].items[x].booked * booking.equipmentDetails[details['id']].items[x].rate * booking.equipmentDetails[details['id']].items[x].days;
    //     // cumulatedSubAmount += (booking.equipmentDetails[details['id']].items[x].subAmount+booking.equipmentDetails[details['id']].items[x].discountOverwrite);
    //     if(booking.equipmentDetails[details['id']].items[x].discountOverwrite != undefined) {
    //       cumulatedSubDiscount += booking.equipmentDetails[details['id']].items[x].discountOverwrite;
    //     }
    //   } else if(booking.equipmentDetails[details['id']].items[x].packageClicked == undefined) {
    //     cumulatedSubAmount += (((booking.equipmentDetails[details['id']].items[x].rate + booking.equipmentDetails[details['id']].items[x].discount) * booking.equipmentDetails[details['id']].items[x].originalPriced) + ((booking.equipmentDetails[details['id']].items[x].discount) * booking.equipmentDetails[details['id']].items[x].discountPriced));
    //     if(booking.equipmentDetails[details['id']].items[x].discountOverwrite != undefined) {
    //       cumulatedSubDiscount += booking.equipmentDetails[details['id']].items[x].discountOverwrite;
    //     }
    //   } else {
    //     cumulatedSubAmount += (booking.equipmentDetails[details['id']].items[x].discountPriced * booking.equipmentDetails[details['id']].items[x].rate) + (booking.equipmentDetails[details['id']].items[x].originalPriced * (booking.equipmentDetails[details['id']].items[x].rate + booking.equipmentDetails[details['id']].items[x].discount));
    //     cumulatedSubDiscount += (booking.equipmentDetails[details['id']].items[x].discountPriced * booking.equipmentDetails[details['id']].items[x].rate)
    //   }
    // }
    //
    //
    //
    // booking.equipmentDetails[details['id']].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
    // // booking.equipmentDetails[details['id']].privilege.value = parseFloat(booking.equipmentDetails[details['id']].subTotal * booking.equipmentDetails[details['id']].privilege.percentage / 100);
    // booking.equipmentDetails[details['id']].subTotal -= booking.equipmentDetails[details['id']].privilege.value;
    // booking.equipmentDetails[details['id']].subDiscount = cumulatedSubDiscount;
    //
    // var total = 0;
    // for(x in booking.equipmentDetails) {
    //   total += booking.equipmentDetails[x].subTotal;
    // }
    //
    // booking.gst = total * 0.07;
    // booking.total = total + booking.gst;
    //
    // totalPaid = 0;
    // if(booking.payment.length != 0) {
    //   for(x in booking.payment) {
    //     totalPaid += parseFloat(booking.payment[x].amount);
    //   }
    //
    //   booking.balanceDue = parseFloat(booking.total - totalPaid);
    // } else {
    //   booking.balanceDue = parseFloat(booking.total);
    // }
    //
    // delete booking._id;
    // Bookings.update({_id: details['_id']}, {$set: booking});
    //
    // return "Done";
  },
  saveDiscount: function(details) {

    var bookingLineItem = BookingLineItems.findOne({_id: details['id']});

    if(details['discount'] == "") {
      return;
    }

    bookingLineItem.discountOverwrite = parseFloat(details['discount']);
    bookingLineItem.subAmount = (bookingLineItem.rate * bookingLineItem.days * bookingLineItem.booked) - bookingLineItem.discountOverwrite;

    delete bookingLineItem._id;
    BookingLineItems.update({_id: details['id']}, {$set: bookingLineItem});
    return "Done";
  },
  saveCustomRate: function(details) {

    var bookingLineItem = BookingLineItems.findOne({_id: details['id']});

    bookingLineItem.rate = parseFloat(details['rate']);
    bookingLineItem.subAmount = (bookingLineItem.rate * bookingLineItem.days * bookingLineItem.booked) - bookingLineItem.discountOverwrite;

    delete bookingLineItem._id;
    BookingLineItems.update({_id: details['id']}, {$set: bookingLineItem});
    return "Done";
  },
  removeCustomBookingItem: function(details) {

    var bookingLineItem = BookingLineItems.findOne({_id: details['id']});

    BookingLineItems.remove(details['id']);

    return bookingLineItem;
  },
  addQuantityToCustomBookingItem: function(details) {



    var bookingLineItem = BookingLineItems.findOne({_id: details['id']});

    var obj = new Object();
    obj.serialNo = parseInt(bookingLineItem.unclashableSerialNumbers.length) + 1;
    obj.status = "N/A";
    obj.groupId = bookingLineItem.groupCounter;
    obj.itemId = bookingLineItem._id;
    obj.type = "Custom";

    bookingLineItem.unclashableSerialNumbers.push(obj);

    var originalLineSubAmount = bookingLineItem.subAmount;

    bookingLineItem.booked += 1;
    bookingLineItem.originalPriced = (bookingLineItem.booked * bookingLineItem.days);
    bookingLineItem.subAmount = (bookingLineItem.booked * bookingLineItem.days * bookingLineItem.rate) - bookingLineItem.discountOverwrite;

    delete bookingLineItem._id;

    BookingLineItems.update({_id: details['id']}, {$set: bookingLineItem});

    return "Done";
  },
  minusQuantityToCustomBookingItem: function(details) {
    
    var bookingLineItem = BookingLineItems.findOne({_id: details['id']});

    var originalLineSubAmount = bookingLineItem.subAmount;

    bookingLineItem.booked -= 1;
    bookingLineItem.originalPriced = (bookingLineItem.booked * bookingLineItem.days);
    bookingLineItem.subAmount = (bookingLineItem.booked * bookingLineItem.days * bookingLineItem.rate) - bookingLineItem.discountOverwrite;

    bookingLineItem.unclashableSerialNumbers.pop();

    delete bookingLineItem._id;

    BookingLineItems.update({_id: details['id']}, {$set: bookingLineItem});

    return "Done";
  },
  addCustomItem: function(details) {

    var bookingLineItem = BookingLineItems.findOne({_id: details['id']});
    bookingLineItem.item = details['item'];
    bookingLineItem.category = details['category'];

    delete bookingLineItem._id;
    BookingLineItems.update({_id: details['id']}, {$set: bookingLineItem});

    return "Done";
  },
  updateCalendars: function(details) {



    // Calendars.remove({invoiceId: details['_id']});

    // var booking = Bookings.findOne({_id: details['_id']});

    // for(x in details.dates) {
    //   for(y in details.dates[x].dateArray) {
    //     var monthArray = [];

    //     var startMonth = moment(details.dates[x].dateArray[y][0]).format('MM YYYY');
    //     var endMonth = moment(details.dates[x].dateArray[y][details.dates[x].dateArray[y].length - 1]).format('MM YYYY');

    //     var startString = startMonth.split(" ");
    //     var endString = endMonth.split(" ");

    //     if(startString[0] > endString[0]) {
    //       //means go to next year
    //       for(r = startString[0]; r <= 12; r++) {
    //         monthArray.push(r + " " + startString[1]);
    //       }
    //       for(r = 1; r <= endString[0]; r++) {
    //         monthArray.push(r + " " + endString[1]);
    //       }
    //     } else {
    //       for(r = startString[0]; r <= endString[0]; r++) {
    //         monthArray.push(r + " " + startString[1]);
    //       }
    //     }




    //     if(details.dates[x].dateArray[y].length == 1) {
    //       var groupId = parseInt(x) + 1;
    //       var calendarAttributes = {
    //           startDate: new Date(moment(details.dates[x].dateArray[y][0]).add(1, "days")),
    //           endDate: new Date(moment(details.dates[x].dateArray[y][details.dates[x].dateArray[y].length - 1])),
    //           invoiceId: details._id,
    //           title: booking.customerName + " Group " + groupId,
    //           customerId: booking.customerId,
    //           url: "bookings/" + details._id,
    //           status: "Pending",
    //           type: "booking",
    //           months: monthArray
    //       };

    //       Calendars.insert(calendarAttributes);

    //       var calendarAttributes = {
    //           startDate: new Date(moment(details.dates[x].dateArray[y][0])),
    //           endDate: new Date(moment(details.dates[x].dateArray[y][0])),
    //           invoiceId: details._id,
    //           title: "Prepare items for " + booking.customerName + " Group " + groupId,
    //           customerId: booking.customerId,
    //           url: "bookings/" + details._id,
    //           status: "Pending",
    //           type: "bookingStartDate",
    //           months: monthArray
    //       };

    //       Calendars.insert(calendarAttributes);

    //       var calendarAttributes = {
    //           startDate: new Date(moment(details.dates[x].dateArray[y][details.dates[x].dateArray[y].length - 1]).add(2, "days")),
    //           endDate: new Date(moment(details.dates[x].dateArray[y][details.dates[x].dateArray[y].length - 1]).add(2, "days")),
    //           invoiceId: details._id,
    //           title: "Prepare to receive items for " + booking.customerName + " Group " + groupId,
    //           customerId: booking.customerId,
    //           url: "bookings/" + details._id,
    //           status: "Pending",
    //           type: "bookingEndDate",
    //           months: monthArray
    //       };

    //       Calendars.insert(calendarAttributes);

    //     } else {
    //       var groupId = parseInt(x) + 1;
    //       var calendarAttributes = {
    //           startDate: new Date(moment(details.dates[x].dateArray[y][0]).add(1, "days")),
    //           endDate: new Date(moment(details.dates[x].dateArray[y][details.dates[x].dateArray[y].length-1]).add(1, "days")),
    //           invoiceId: details._id,
    //           title: booking.customerName + " Group " + groupId,
    //           customerId: booking.customerId,
    //           url: "bookings/" + details._id,
    //           status: "Pending",
    //           type: "booking",
    //           months: monthArray
    //       };

    //       Calendars.insert(calendarAttributes);

    //       var calendarAttributes = {
    //           startDate: new Date(moment(details.dates[x].dateArray[y][0])),
    //           endDate: new Date(moment(details.dates[x].dateArray[y][0])),
    //           invoiceId: details._id,
    //           title: "Prepare items for " + booking.customerName + " Group " + groupId,
    //           customerId: booking.customerId,
    //           url: "bookings/" + details._id,
    //           status: "Pending",
    //           type: "bookingStartDate",
    //           months: monthArray
    //       };

    //       Calendars.insert(calendarAttributes);

    //       var calendarAttributes = {
    //           startDate: new Date(moment(details.dates[x].dateArray[y][details.dates[x].dateArray[y].length-1]).add(2, "days")),
    //           endDate: new Date(moment(details.dates[x].dateArray[y][details.dates[x].dateArray[y].length-1]).add(2, "days")),
    //           invoiceId: details._id,
    //           title: "Prepare to receive items for " + booking.customerName + " Group " + groupId,
    //           customerId: booking.customerId,
    //           url: "bookings/" + details._id,
    //           status: "Pending",
    //           type: "bookingEndDate",
    //           months: monthArray
    //       };

    //       Calendars.insert(calendarAttributes);
    //     }
    //   }
    // }
  },
  updateResolution: function(details) {
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: details['_id']});
    bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['remarkId']].resolved = true;

    // var finalResolved = true;
    // for(s in bookingAcknowledgeRemark.remarksRequiringAcknowledgement) {
    //   if(bookingAcknowledgeRemark.remarksRequiringAcknowledgement[s].resolved == false) {
    //     finalResolved = false;
    //     break;
    //   }
    // }

    // booking.resolved = finalResolved;

    delete bookingAcknowledgeRemark._id;
    BookingAcknowledgeRemarks.update({invoiceId: details['_id']}, {$set: bookingAcknowledgeRemark});
  },
  updateCustomerName: function(details) {
    var booking = Bookings.findOne({_id: details['_id']});
    var customer = Customers.findOne({_id: details['customerId']});

    var arr = [];
    arr.push(details['customerId']);
    var privilege = Privileges.findOne({customerId: {$in: arr}});

    if(privilege != undefined) {
      booking.privileges = [];
      var obj = new Object();
      obj.status = true;
      obj.id = privilege._id;
      obj.value = privilege.discountValue;

      booking.privileges.push(obj);
    } else {
      booking.privileges = [];
    }

    var total = 0;
    for(x in booking.equipmentDetails) {
      if(privilege != undefined) {
        booking.equipmentDetails[x].privilege.value = 0;
        booking.equipmentDetails[x].privilege.percentage = privilege.discountValue;
        booking.equipmentDetails[x].privilege.originalPercentage = privilege.discountValue;
        booking.equipmentDetails[x].privilege.edited = false;
      } else {
        booking.equipmentDetails[x].privilege = new Object();
        booking.equipmentDetails[x].privilege.value = 0;
        booking.equipmentDetails[x].privilege.percentage = 0;
        booking.equipmentDetails[x].privilege.originalPercentage = 0;
        booking.equipmentDetails[x].privilege.edited = false;
      }

      var cumulatedSubAmount = 0;
      var cumulatedSubDiscount = 0;

      for(y in booking.equipmentDetails[x].items) {
        if(booking.equipmentDetails[x].items[y].total == -1) {
          cumulatedSubAmount += booking.equipmentDetails[x].items[y].booked * booking.equipmentDetails[x].items[y].rate * booking.equipmentDetails[x].items[y].days;
          // cumulatedSubAmount += (booking.equipmentDetails[string[0]].items[x].subAmount + booking.equipmentDetails[string[0]].items[x].discountOverwrite);
          if(booking.equipmentDetails[x].items[y].discountOverwrite != undefined) {
            cumulatedSubDiscount += booking.equipmentDetails[x].items[y].discountOverwrite;
          }
        } else if(booking.equipmentDetails[x].items[y].packageClicked == undefined) {
          cumulatedSubAmount += (((booking.equipmentDetails[x].items[y].rate + booking.equipmentDetails[x].items[y].discount) * booking.equipmentDetails[x].items[y].originalPriced) + ((booking.equipmentDetails[x].items[y].discount) * booking.equipmentDetails[x].items[y].discountPriced));
          if(booking.equipmentDetails[x].items[y].discountOverwrite != undefined) {
            cumulatedSubDiscount += booking.equipmentDetails[x].items[y].discountOverwrite;
          }
        } else {
          cumulatedSubAmount += (booking.equipmentDetails[x].items[y].discountPriced * booking.equipmentDetails[x].items[y].rate) + (booking.equipmentDetails[x].items[y].originalPriced * (booking.equipmentDetails[x].items[y].rate + booking.equipmentDetails[x].items[y].discount));

          if(booking.equipmentDetails[x].items[y].discountOverwrite != undefined) {
            cumulatedSubDiscount += (booking.equipmentDetails[x].items[y].discountPriced * booking.equipmentDetails[x].items[y].rate);
          }
        }
      }

      booking.equipmentDetails[x].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
      if(booking.equipmentDetails[x].privilege != undefined) {
        booking.equipmentDetails[x].privilege.value = parseFloat(booking.equipmentDetails[x].subTotal * booking.equipmentDetails[x].privilege.percentage / 100);
      booking.equipmentDetails[x].subTotal -= booking.equipmentDetails[x].privilege.value;
      }
      booking.equipmentDetails[x].subDiscount = cumulatedSubDiscount;

      total += booking.equipmentDetails[x].subTotal;
    }

    booking.gst = parseFloat(total * 0.07);
    booking.total = parseFloat(total + booking.gst);

    var totalPaid = 0;

    if(booking.payment.length != 0) {
      for(y in booking.payment) {
        totalPaid += parseFloat(booking.payment[y].amount);
      }

      booking.balanceDue = parseFloat(booking.total - totalPaid);
    } else {
      booking.balanceDue = parseFloat(booking.total);
    }

    var logAttributes = {
        type: "bookings",
        url: details['_id'],
        content: "Updated customer of Booking #" + details['_id'] + " from " + booking.customerName + " to " + customer.name + ".",
        createdAt: new Date(),
        owner: Meteor.user()._id
    };
    Logs.insert(logAttributes);

    var log = new Object();
    log.content = Meteor.user().username + " updated customer from " + booking.customerName + " to " + customer.name + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    booking.logs.push(log);
    booking.customerId = customer._id;
    booking.customerName = customer.name;
    booking.customerCompany = customer.company;
    booking.customerNumber = customer.contact;
    booking.customerEmail = customer.email;
    booking.customerAddress = customer.address;
    booking.customerIC = customer.ic;

    delete booking._id;
    Bookings.update({_id: details['_id']}, {$set: booking});

    var calendars = Calendars.find({invoiceId: details['_id']}).fetch();

    for(x in calendars) {
      var string = calendars[x].title.split(" ");
      calendars[x].title = string[0] + " " + customer.name + " " + string[string.length-2] + " " + string[string.length - 1];
      calendars[x].customerName = customer.name;

      calendars[x].customerId = customer._id

      var calendarId = calendars[x]._id;
      delete calendars[x]._id;
      Calendars.update({_id: calendarId}, {$set: calendars[x]});
    }

    var equipmentCalendars = EquipmentCalendars.find({invoiceId: details['_id']}).fetch();
    for(x in equipmentCalendars) {
      var string = equipmentCalendars[x].title.split(":");

      equipmentCalendars[x].title = customer.name + " " + string[1];
      equipmentCalendars[x].customerName = customer.name;
      equipmentCalendars[x].customerId = customer._id

      var equipmentCalendarId = equipmentCalendars[x]._id;
      delete equipmentCalendars[x]._id;
      EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: equipmentCalendars[x]});
    }
  },
  deleteAcknowledgeRemark: function(details) {
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: details['_id']});

    // var logAttributes = {
    //     type: "bookings",
    //     url: details['_id'],
    //     content: "Removed Remark " + parseInt(booking.remarksRequiringAcknowledgement[details['remarkId']].id + 1) + " - " + booking.remarksRequiringAcknowledgement[details['remarkId']].remark + ".",
    //     createdAt: new Date(),
    //     owner: Meteor.user()._id
    // };
    // Logs.insert(logAttributes);

    // var log = new Object();
    // log.content = Meteor.user().username + " removed Remark " + parseInt(booking.remarksRequiringAcknowledgement[details['remarkId']].id + 1) + " - " + booking.remarksRequiringAcknowledgement[details['remarkId']].remark + ".";
    // log.owner = Meteor.user().username;
    // log.dateTime = new Date();

    // booking.logs.push(log);
    bookingAcknowledgeRemark.remarksRequiringAcknowledgement.splice(details['remarkId'], 1);
    for(x in bookingAcknowledgeRemark.remarksRequiringAcknowledgement) {
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[x].id = parseInt(x);
    }

    // var acknowledged = true;
    // for(x in booking.staffSignIn) {
    //   if(booking.staffSignIn[x].status == "Unsigned") {
    //     acknowledged = false;
    //     break;
    //   }
    // }

    // if(acknowledged) {
    //   for(x in booking.customerSignOut) {
    //     if(booking.customerSignOut[x].status == "Unsigned") {
    //       acknowledged = false;
    //       break;
    //     }
    //   }
    // }

    // if(acknowledged) {
    //   for(x in booking.remarksRequiringAcknowledgement) {
    //     if(booking.remarksRequiringAcknowledgement[x].status == "Unsigned") {
    //       acknowledged = false;
    //       break;
    //     }
    //   }
    // }

    // var finalResolved = true;
    // for(s in booking.remarksRequiringAcknowledgement) {
    //   if(booking.remarksRequiringAcknowledgement[s].resolved == false) {
    //     finalResolved = false;
    //     break;
    //   }
    // }

    // booking.resolved = finalResolved;

    // booking.acknowledged = acknowledged;

    delete bookingAcknowledgeRemark._id;
    BookingAcknowledgeRemarks.update({invoiceId: details['_id']}, {$set: bookingAcknowledgeRemark});
  },
  deleteComment: function(details) {
      
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: details['_id']});

    // var logAttributes = {
    //     type: "bookings",
    //     url: details['_id'],
    //     content: "Removed Remark " + parseInt(booking.remarksRequiringAcknowledgement[details['remarkId']].id + 1) + " - " + booking.remarksRequiringAcknowledgement[details['remarkId']].remark + ".",
    //     createdAt: new Date(),
    //     owner: Meteor.user()._id
    // };
    // Logs.insert(logAttributes);

    // var log = new Object();
    // log.content = Meteor.user().username + " removed Remark " + parseInt(booking.remarksRequiringAcknowledgement[details['remarkId']].id + 1) + " - " + booking.remarksRequiringAcknowledgement[details['remarkId']].remark + ".";
    // log.owner = Meteor.user().username;
    // log.dateTime = new Date();

    // booking.logs.push(log);
    bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['remarkId']].comments.splice(details['commentId'], 1);
    for(x in bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['remarkId']].comments) {
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['remarkId']].comments[x].id = parseInt(x);
    }

    // var acknowledged = true;
    // for(x in booking.staffSignIn) {
    //   if(booking.staffSignIn[x].status == "Unsigned") {
    //     acknowledged = false;
    //     break;
    //   }
    // }

    // if(acknowledged) {
    //   for(x in booking.customerSignOut) {
    //     if(booking.customerSignOut[x].status == "Unsigned") {
    //       acknowledged = false;
    //       break;
    //     }
    //   }
    // }

    // if(acknowledged) {
    //   for(x in booking.remarksRequiringAcknowledgement) {
    //     if(booking.remarksRequiringAcknowledgement[x].status == "Unsigned") {
    //       acknowledged = false;
    //       break;
    //     }
    //   }
    // }

    // booking.acknowledged = acknowledged;

    delete bookingAcknowledgeRemark._id;
    BookingAcknowledgeRemarks.update({invoiceId: details['_id']}, {$set: bookingAcknowledgeRemark});
  },
  signStaffSignInRemarks: function(details) {



    var bookingSignIn = BookingSignIns.findOne({invoiceId: details['_id']});

    var itemArray = [];

    for(x in bookingSignIn.staffSignIn) {
      if(bookingSignIn.staffSignIn[x].status == "Unsigned") {
        bookingSignIn.staffSignIn[x].image = details['image'];
        bookingSignIn.staffSignIn[x].signedBy = details['signedBy'];
        bookingSignIn.staffSignIn[x].status = "Signed";
        bookingSignIn.staffSignIn[x].signedAt = new Date();
        for(y in bookingSignIn.staffSignIn[x].items) {
          itemArray.push(bookingSignIn.staffSignIn[x].items[y].item);
        }
      }
    }

    delete bookingSignIn._id;
    BookingSignIns.update({invoiceId: details['_id']}, {$set: bookingSignIn});

    return itemArray;
  },
  signCustomerSignOutRemarks: function(details) {
    var bookingSignOut = BookingSignOuts.findOne({invoiceId: details['_id']});

    var itemArray = [];

    for(x in bookingSignOut.customerSignOut) {
      if(bookingSignOut.customerSignOut[x].status == "Unsigned") {
        bookingSignOut.customerSignOut[x].image = details['image'];
        bookingSignOut.customerSignOut[x].signedBy = details['signedBy'];
        bookingSignOut.customerSignOut[x].ic = details['ic'];
        bookingSignOut.customerSignOut[x].number = details['number'];
        bookingSignOut.customerSignOut[x].status = "Signed";
        bookingSignOut.customerSignOut[x].signedAt = new Date();

        for(y in bookingSignOut.customerSignOut[x].items) {
          itemArray.push(bookingSignOut.customerSignOut[x].items[y].item);
        }
      }
    }

    delete bookingSignOut._id;
    BookingSignOuts.update({invoiceId: details['_id']}, {$set: bookingSignOut});

    return itemArray;
  },
  signRemarks: function(details) {

    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: details['_id']});

    for(x in details['acknowledgeId']) {
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['acknowledgeId'][x]].image = details['image'];
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['acknowledgeId'][x]].signedBy = details['signedBy'];
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['acknowledgeId'][x]].status = "Signed";
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[details['acknowledgeId'][x]].signedAt = new Date();
    }

    // var acknowledged = true;
    // for(x in booking.staffSignIn) {
    //   if(booking.staffSignIn[x].status == "Unsigned") {
    //     acknowledged = false;
    //     break;
    //   }
    // }

    // if(acknowledged) {
    //   for(x in booking.customerSignOut) {
    //     if(booking.customerSignOut[x].status == "Unsigned") {
    //       acknowledged = false;
    //       break;
    //     }
    //   }
    // }

    // if(acknowledged) {
    //   for(x in booking.remarksRequiringAcknowledgement) {
    //     if(booking.remarksRequiringAcknowledgement[x].status == "Unsigned") {
    //       acknowledged = false;
    //       break;
    //     }
    //   }
    // }

    // booking.acknowledged = acknowledged;

    delete bookingAcknowledgeRemark._id;
    BookingAcknowledgeRemarks.update({invoiceId: details['_id']}, {$set: bookingAcknowledgeRemark});
  },
  payForBooking: function(details) {
    
    var bookingPrice = BookingPrices.findOne({invoiceId: details['_id']});

    // var log = new Object();
    // log.content = "Payment of " + accounting.formatMoney(details['amount']) + " made.";
    // log.owner = Meteor.user().username;
    // log.dateTime = new Date();

    // booking.logs.push(log);

    var payment = new Object();
    payment.amount = parseFloat(details['amount']);
    payment.type = details['type'];
    payment.status = "Pending";

    if(details['serialNo'] != undefined) {
      payment.serialNo = details['serialNo'];
    }
    payment.id = bookingPrice.payment.length;

    bookingPrice.payment.push(payment);
    bookingPrice.balanceDue -= parseFloat(details['amount']);

    delete bookingPrice._id;
    BookingPrices.update({invoiceId: details['_id']}, {$set: bookingPrice});
  },
  updateProjectName: function(details) {
    var booking = Bookings.findOne({_id: details['_id']});

    var log = new Object();
    log.content = Meteor.user().username + " updated project name to " + details['projectName'] + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    booking.logs.push(log);

    booking.projectName = details['projectName'];

    delete booking._id;
    Bookings.update({_id: details['_id']}, {$set: booking});
  },
  removeSerialNoRemark: function(details) {
    var inventoryItem = Inventory.findOne({_id: details['inventoryId']});
    var changed = false;

    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].serialNo == details['serialNo']) {
        inventoryItem.serialNo[x].remarks.splice(details['remarkId'], 1);
        inventoryItem.serialNo[x].remarkCount -= 1;

        for(y in inventoryItem.serialNo[x].remarks) {
          inventoryItem.serialNo[x].remarks[y].id = parseInt(y);
        }

        break;
      }
    }


    delete inventoryItem._id;
    Inventory.update({_id: details['inventoryId']}, {$set: inventoryItem});
  },
  changeRemarkStatus: function(details) {

    var inventoryItem = Inventory.findOne({_id: details['inventoryId']});

    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].serialNo == details['serialNo']) {
        inventoryItem.serialNo[x].remarks[details['remarkId']].status = details['status'];
        break;
      }
    }

    delete inventoryItem._id;
    Inventory.update({_id: details['inventoryId']}, {$set: inventoryItem});
  },
  addSerialNoRemark: function(details) {
    var string = details['id'].split("_");
    var inventoryItem = Inventory.findOne({_id: string[1]});

    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].serialNo == details['serialNo']) {
        var remarkObject = new Object();
        remarkObject.id = inventoryItem.serialNo[x].remarkCount;
        remarkObject.remark = details['remark'];
        remarkObject.routeId = string[1];
        remarkObject.serialNo = details['serialNo'];
        remarkObject.createdAt = new Date();
        remarkObject.udpatedAt = new Date();
        remarkObject.createdBy = Meteor.user().username;
        remarkObject.updatedBy = Meteor.user().username;
        remarkObject.status = "Open";
        inventoryItem.serialNo[x].remarks.push(remarkObject);

        inventoryItem.serialNo[x].remarkCount += 1;
        break;
      }
    }

    delete inventoryItem._id;
    Inventory.update({_id: string[1]}, {$set: inventoryItem});
  },
  changeCustomSerialNoStatus: function(details) {
    var username = Meteor.user().username;

    var invoiceId = details['_id'];
    var bookingLineItemId = details['bookingLineItemId'];
    var serialNo = details['serialNo'];
    var status =details['status'];
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: invoiceId});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingSignOut = BookingSignOuts.findOne({invoiceId: invoiceId});
    var bookingSignIn = BookingSignIns.findOne({invoiceId: invoiceId});

    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});

    var done = false;

    for(y in bookingLineItem.unclashableSerialNumbers) {
      if(bookingLineItem.unclashableSerialNumbers[y].serialNo == serialNo) {
        var originalStatus = bookingLineItem.unclashableSerialNumbers[y].status;
        bookingLineItem.unclashableSerialNumbers[y].status = details['status'];

        if(status == "Missing" || status == "Damaged") {

          var remarkAcknowledge = new Object();
          remarkAcknowledge.id = bookingAcknowledgeRemark.remarksRequiringAcknowledgement.length;

          remarkAcknowledge.remark = username + " labelled " + bookingLineItem.item + " as " + status + ".";
          remarkAcknowledge.createdAt = new Date();
          remarkAcknowledge.serialNo = serialNo;
          remarkAcknowledge.status = status;
          remarkAcknowledge.item = bookingLineItem.item;
          remarkAcknowledge.lineItem = bookingLineItem.item + " serial no: " + serialNo;
          remarkAcknowledge.createdBy = username;
          remarkAcknowledge.status = "Unsigned";
          remarkAcknowledge.resolved = false;
          remarkAcknowledge.signedAt = null;
          remarkAcknowledge.signedBy = null;
          remarkAcknowledge.image = null;
          remarkAcknowledge.comments = [];
          remarkAcknowledge.test = [];

          bookingAcknowledgeRemark.push(remarkAcknowledge);

          bookingStatus.acknowledged = false;

          var bookingAcknowledgeRemarkId = bookingAcknowledgeRemark._id;

          delete bookingAcknowledgeRemark._id;

          BookingAcknowledgeRemarks.update({_id: bookingAcknowledgeRemarkId}, {$set: bookingAcknowledgeRemark});

          var bookingStatusId = bookingStatus._id;

          delete bookingStatus._id;

          BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

        } else if(status == "Out") {

          var customerSignOut = new Object();
          var exists = false;
          var counter;
          for(z in bookingSignOut.customerSignOut) {
            if(bookingSignOut.customerSignOut[z].status == "Unsigned") {
              counter = z;
              exists = true;
              break;
            }
          }
          if(exists) {
            var push = new Object();
            push.itemId = bookingLineItem.itemId;
            push.serialNo = serialNo;
            push.equipmentGroup = bookingLineItem.groupCounter;
            push.item = bookingLineItem.item + " serial no: " + serialNo;
            bookingSignOut.items.push(push);
            bookingSignOut.status = "Unsigned";
            bookingSignOut.createdAt = new Date();
            bookingSignOut.createdBy = username;
          } else {
            customerSignOut.id = bookingSignOut.customerSignOut.length;
            customerSignOut.items = [];
            var push = new Object();
            push.itemId = bookingLineItem.itemId;
            push.serialNo = serialNo;
            push.equipmentGroup = bookingLineItem.groupCounter;
            push.item = bookingLineItem.item + " serial no: " + serialNo;
            customerSignOut.items.push(push);
            customerSignOut.status = "Unsigned";
            customerSignOut.createdAt = new Date();
            customerSignOut.createdBy = username;
            bookingSignOutcustomerSignOut.push(customerSignOut);
          }

          bookingStatus.acknowledged = false;

          var bookingStatusId = bookingStatus._id;

          delete bookingStatus._id;

          BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

          var bookingSignOutId = bookingSignOut._id;

          delete bookingSignOut._id;

          BookingSignOuts.update({_id: bookingSignOutId}, {$set: bookingSignOut});
        } else if(status == "In") {

          var staffSignIn = new Object();
          var exists = false;
          var counter;
          for(z in bookingSignIn.staffSignIn) {
            if(bookingSignIn.staffSignIn[z].status == "Unsigned") {
              counter = z;
              exists = true;
              break;
            }
          }
          if(exists) {
            var push = new Object();
            push.itemId = bookingLineItem.itemId;
            push.equipmentGroup = bookingLineItem.groupCounter;
            push.serialNo = serialNo;

            push.item = serialNo.item + " serial no:" + serialNo;
            bookingSignIn.staffSignIn[counter].items.push(push);
            bookingSignIn.staffSignIn[counter].status = "Unsigned";
            bookingSignIn.staffSignIn[counter].createdAt = new Date();
            bookingSignIn.staffSignIn[counter].createdBy = username;
          } else {
            staffSignIn.id = bookingSignIn.staffSignIn.length;
            staffSignIn.items = [];
            var push = new Object();
            push.itemId = bookingLineItem.itemId;
            push.serialNo = serialNo;
            push.equipmentGroup = bookingLineItem.groupCounter;
            push.item = bookingLineItem.item + " serial no:" + serialNo;
            staffSignIn.items.push(push);
            staffSignIn.status = "Unsigned";
            staffSignIn.createdAt = new Date();
            staffSignIn.createdBy = username;
            bookingSignIn.staffSignIn.push(staffSignIn);
          }

          bookingStatus.acknowledged = false;

          var bookingStatusId = bookingStatus._id;

          delete bookingStatus._id;

          BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

          var bookingSignInId = bookingSignIn._id;

          delete bookingSignIn._id;

          BookingSignIns.update({_id: bookingSignInId}, {$set: bookingSignIn});
        } else if(status == "N/A") {

          var exists = false;
          var counter;
          for(a in bookingSignOut.customerSignOut) {
            if(bookingSignOut.customerSignOut[a].status == "Unsigned") {
              counter = a;
              exists = true;
              break;
            }
          }
          if(counter != undefined) {
            for(b in bookingSignOut.customerSignOut[counter].items) {
              if(bookingSignOut.customerSignOut[counter].items[b].id == booking.equipmentDetails[string[0]].items[x].id) {
                bookingSignOut.customerSignOut[counter].items.splice(b, 1);
                break;
              }
            }
          }

        } else if(details['status'] == "Packed") {

        }
        done = true;
        break;
      }
    }
  },

  changeSerialNoStatus: function(details) {
    
    var username = Meteor.user().username;

    var invoiceId = details['_id'];
    var string = details['id'].split("_");
    var groupId = parseInt(string[0]);
    var inventoryItemId = string[1];

    var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupId}).fetch();

    var bookingLineItemId = details['bookingLineItemId'];
    var serialNo = details['serialNo'];
    var status = details['status'];
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: invoiceId});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingSignOut = BookingSignOuts.findOne({invoiceId: invoiceId});
    var bookingSignIn = BookingSignIns.findOne({invoiceId: invoiceId});

    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});

    var done = false;
    var packed = true;

    for(x in bookingLineItems) {
      for(y in bookingLineItems[x].unclashableSerialNumbers) {
        if(done == false) {
          if(bookingLineItems[x].unclashableSerialNumbers[y].serialNo == details['serialNo'] && bookingLineItems[x].unclashableSerialNumbers[y].itemId == inventoryItemId && bookingLineItems[x].unclashableSerialNumbers[y].type == "Custom") {
            var originalStatus = bookingLineItems[x].unclashableSerialNumbers[y].status;
            bookingLineItems[x].unclashableSerialNumbers[y].status = details['status'];
            if(details['status'] == "Missing" || details['status'] == "Damaged") {
              bookingStatus.resolved = false;

              var remarkAcknowledge = new Object();
              remarkAcknowledge.id = bookingAcknowledgeRemark.remarksRequiringAcknowledgement.length;

              remarkAcknowledge.remark = username + " labelled " + bookingLineItems[x].item + " as " + details['status'] + ".";
              remarkAcknowledge.createdAt = new Date();
              remarkAcknowledge.serialNo = details['serialNo'];
              remarkAcknowledge.status = details['status'];
              remarkAcknowledge.item = bookingLineItems[x].item;
              remarkAcknowledge.lineItem = bookingLineItems[x].item + " serial no: " + details['serialNo'];
              remarkAcknowledge.createdBy = username;
              remarkAcknowledge.status = "Unsigned";
              remarkAcknowledge.resolved = false;
              remarkAcknowledge.signedAt = null;
              remarkAcknowledge.signedBy = null;
              remarkAcknowledge.image = null;
              remarkAcknowledge.comments = [];
              bookingAcknowledgeRemark.remarksRequiringAcknowledgement.push(remarkAcknowledge);

              bookingStatus.acknowledged = false;

              var bookingAcknowledgeRemarkId = bookingAcknowledgeRemark._id;

              delete bookingAcknowledgeRemark._id;

              BookingAcknowledgeRemarks.update({_id: bookingAcknowledgeRemarkId}, {$set: bookingAcknowledgeRemark});

              var bookingStatusId = bookingStatus._id;

              delete bookingStatus._id;

              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});
            } else if(details['status'] == "Out") {
              var customerSignOut = new Object();
              var exists = false;
              var counter;
              for(z in bookingSignOut.customerSignOut) {
                if(bookingSignOut.customerSignOut[z].status == "Unsigned") {
                  counter = z;
                  exists = true;
                  break;
                }
              }
              if(exists) {
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
                bookingSignOut.customerSignOut[counter].items.push(push);
                bookingSignOut.customerSignOut[counter].status = "Unsigned";
                bookingSignOut.customerSignOut[counter].createdAt = new Date();
                bookingSignOut.customerSignOut[counter].createdBy = username;
              } else {
                customerSignOut.id = bookingSignOut.customerSignOut.length;
                customerSignOut.items = [];
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
                customerSignOut.items.push(push);
                customerSignOut.status = "Unsigned";
                customerSignOut.createdAt = new Date();
                customerSignOut.createdBy = username;
                bookingSignOut.customerSignOut.push(customerSignOut);
              }

              bookingStatus.acknowledged = false;

              var bookingStatusId = bookingStatus._id;

              delete bookingStatus._id;

              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

              var bookingSignOutId = bookingSignOut._id;

              delete bookingSignOut._id;

              BookingSignOuts.update({_id: bookingSignOutId}, {$set: bookingSignOut});
            } else if(details['status'] == "In") {
              

              var staffSignIn = new Object();
              var exists = false;
              var counter;
              for(z in bookingSignIn.staffSignIn) {
                if(bookingSignIn.staffSignIn[z].status == "Unsigned") {
                  counter = z;
                  exists = true;
                  break;
                }
              }
              if(exists) {
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.serialNo = details['serialNo'];

                push.item = bookingLineItems[x].item + " serial no:" + details['serialNo'];
                bookingSignIn.staffSignIn[counter].items.push(push);
                bookingSignIn.staffSignIn[counter].status = "Unsigned";
                bookingSignIn.staffSignIn[counter].createdAt = new Date();
                bookingSignIn.staffSignIn[counter].createdBy = username;
              } else {
                staffSignIn.id = bookingSignIn.staffSignIn.length;
                staffSignIn.items = [];
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.item = bookingLineItems[x].item + " serial no:" + details['serialNo'];
                staffSignIn.items.push(push);
                staffSignIn.status = "Unsigned";
                staffSignIn.createdAt = new Date();
                staffSignIn.createdBy = username;
                bookingSignIn.staffSignIn.push(staffSignIn);
              }

              bookingStatus.acknowledged = false;

              var bookingStatusId = bookingStatus._id;

              delete bookingStatus._id;

              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

              var bookingSignInId = bookingSignIn._id;

              delete bookingSignIn._id;


              BookingSignIns.update({_id: bookingSignInId}, {$set: bookingSignIn});
            } else if(details['status'] == "N/A") {
              var exists = false;
              var counter;
              for(a in bookingSignOut.customerSignOut) {
                if(bookingSignOut.customerSignOut[a].status == "Unsigned") {
                  counter = a;
                  exists = true;
                  break;
                }
              }
              if(bookingSignOut.customerSignOut[counter] != undefined) {
              for(b in bookingSignOut.customerSignOut[counter].items) {
                if(bookingSignOut.customerSignOut[counter].items[b].itemId == bookingLineItems[x].itemId) {
                  bookingSignOut.customerSignOut[counter].items.splice(b, 1);
                  break;
                }
              }

              }

              var bookingSignOutId = bookingSignOut._id;

              delete bookingSignOut._id;

              BookingSignOuts.update({_id: bookingSignOutId}, {$set: bookingSignOut});
            } else if(details['status'] == "Packed") {

            }

            var bookingLineItemId = bookingLineItems[x]._id;

            delete bookingLineItems[x]._id;

            BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItems[x]});
            
            done = true;
            break;
            done = true;
          } else if(bookingLineItems[x].unclashableSerialNumbers[y].serialNo == details['serialNo'] && bookingLineItems[x].unclashableSerialNumbers[y].itemId == inventoryItemId && bookingLineItems[x].unclashableSerialNumbers[y].type == undefined) {
            var originalStatus = bookingLineItems[x].unclashableSerialNumbers[y].status;
            bookingLineItems[x].unclashableSerialNumbers[y].status = details['status'];
            if(details['status'] == "Missing" || details['status'] == "Damaged") {
              bookingStatus.resolved = false;

              if(Repairs.findOne({itemId: bookingLineItems[x].itemId, serialNo: bookingLineItems[x].unclashableSerialNumbers[y].serialNo}) == undefined) {
                Repairs.insert({
                  item: bookingLineItems[x].item,
                  brand: bookingLineItems[x].brand,
                  status: details['status'],
                  queryName: bookingLineItems[x].brand + " " + bookingLineItems[x].item,
                  serialNo: bookingLineItems[x].unclashableSerialNumbers[y].serialNo,
                  itemId: bookingLineItems[x].itemId,
                  createdAt: new Date(),
                  createdBy: Meteor.user().username
                });
              } else {
                Repairs.update({itemId: bookingLineItems[x].itemId, serialNo: bookingLineItems[x].unclashableSerialNumbers[y].serialNo}, {$set: {status: details['status']}});
              }

              var remarkAcknowledge = new Object();
              remarkAcknowledge.id = bookingAcknowledgeRemark.remarksRequiringAcknowledgement.length;

              remarkAcknowledge.remark = username + " labelled " + bookingLineItems[x].brand + " " + bookingLineItems[x].item + " as " + details['status'] + ".";
              remarkAcknowledge.createdAt = new Date();
              remarkAcknowledge.serialNo = details['serialNo'];
              remarkAcknowledge.status = details['status'];
              remarkAcknowledge.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item;
              remarkAcknowledge.lineItem = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
              remarkAcknowledge.createdBy = username;
              remarkAcknowledge.status = "Unsigned";
              remarkAcknowledge.resolved = false;
              remarkAcknowledge.signedAt = null;
              remarkAcknowledge.signedBy = null;
              remarkAcknowledge.image = null;
              remarkAcknowledge.comments = [];
              bookingAcknowledgeRemark.remarksRequiringAcknowledgement.push(remarkAcknowledge);

              bookingStatus.acknowledged = false;

              var bookingAcknowledgeRemarkId = bookingAcknowledgeRemark._id;

              delete bookingAcknowledgeRemark._id;

              BookingAcknowledgeRemarks.update({_id: bookingAcknowledgeRemarkId}, {$set: bookingAcknowledgeRemark});

              var bookingStatusId = bookingStatus._id;

              delete bookingStatus._id;

              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

              var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
              for(k in inventoryItem.serialNo) {
                if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                  if(originalStatus == "N/A" || originalStatus == "Packed" || originalStatus == "In" || originalStatus == "Out") {
                    inventoryItem.bookableQuantity -= 1;
                  }
                  inventoryItem.serialNo[k].status = details['status'];

                  var inventoryItemId = inventoryItem._id;
                  delete inventoryItem._id;
                  Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                  break;
                }
              }
            } else if(details['status'] == "Out") {
              var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
              for(k in inventoryItem.serialNo) {
                if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                  if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                    inventoryItem.bookableQuantity += 1;

                    Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                  }
                  inventoryItem.serialNo[k].status = "Available";

                  var inventoryItemId = inventoryItem._id;
                  delete inventoryItem._id;
                  Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});

                  break;
                }
              }


              


              var customerSignOut = new Object();
              var exists = false;
              var counter;
              for(z in bookingSignOut.customerSignOut) {
                if(bookingSignOut.customerSignOut[z].status == "Unsigned") {
                  counter = z;
                  exists = true;
                  break;
                }
              }
              if(exists) {
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
                bookingSignOut.customerSignOut[counter].items.push(push);
                bookingSignOut.customerSignOut[counter].status = "Unsigned";
                bookingSignOut.customerSignOut[counter].createdAt = new Date();
                bookingSignOut.customerSignOut[counter].createdBy = username;
              } else {
                customerSignOut.id = bookingSignOut.customerSignOut.length;
                customerSignOut.items = [];
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
                customerSignOut.items.push(push);
                customerSignOut.status = "Unsigned";
                customerSignOut.createdAt = new Date();
                customerSignOut.createdBy = username;
                bookingSignOut.customerSignOut.push(customerSignOut);
              }

              bookingStatus.acknowledged = false;

              var bookingStatusId = bookingStatus._id;

              delete bookingStatus._id;

              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

              var bookingSignOutId = bookingSignOut._id;

              delete bookingSignOut._id;

              BookingSignOuts.update({_id: bookingSignOutId}, {$set: bookingSignOut});
            } else if(details['status'] == "In") {
              var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
              

              for(k in inventoryItem.serialNo) {
                if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                  if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                    inventoryItem.bookableQuantity += 1;

                    Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                  }
                  inventoryItem.serialNo[k].status = "Available";

                  var inventoryItemId = inventoryItem._id;
                  delete inventoryItem._id;
                  Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                  break;
                }
              }

              

              var staffSignIn = new Object();
              var exists = false;
              var counter;
              for(z in bookingSignIn.staffSignIn) {
                if(bookingSignIn.staffSignIn[z].status == "Unsigned") {
                  counter = z;
                  exists = true;
                  break;
                }
              }
              if(exists) {
                
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.serialNo = details['serialNo'];
                push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no:" + details['serialNo'];
                bookingSignIn.staffSignIn[counter].items.push(push);
                bookingSignIn.staffSignIn[counter].status = "Unsigned";
                bookingSignIn.staffSignIn[counter].createdAt = new Date();
                bookingSignIn.staffSignIn[counter].createdBy = username;
              } else {


                staffSignIn.id = bookingSignIn.staffSignIn.length;
                staffSignIn.items = [];
                var push = new Object();
                push.itemId = bookingLineItems[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = bookingLineItems[x].groupCounter;
                push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no:" + details['serialNo'];
                staffSignIn.items.push(push);
                staffSignIn.status = "Unsigned";
                staffSignIn.createdAt = new Date();
                staffSignIn.createdBy = username;
                bookingSignIn.staffSignIn.push(staffSignIn);
              }

              bookingStatus.acknowledged = false;

              var bookingStatusId = bookingStatus._id;

              delete bookingStatus._id;

              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

              var bookingSignInId = bookingSignIn._id;

              delete bookingSignIn._id;

              

              BookingSignIns.update({_id: bookingSignInId}, {$set: bookingSignIn});
            } else if(details['status'] == "N/A") {
              var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
              for(k in inventoryItem.serialNo) {
                if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                  if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                    inventoryItem.bookableQuantity += 1;

                    Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                  }
                  inventoryItem.serialNo[k].status = "Available";

                  var inventoryItemId = inventoryItem._id;
                  delete inventoryItem._id;
                  Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                  break;
                }
              }


              


              var exists = false;
              var counter;
              for(a in bookingSignOut.customerSignOut) {
                if(bookingSignOut.customerSignOut[a].status == "Unsigned") {
                  counter = a;
                  exists = true;
                  break;
                } else {
                  counter = 0;
                }
              }

              if(bookingSignOut.customerSignOut[counter] != undefined) {
                for(b in bookingSignOut.customerSignOut[counter].items) {
                  if(bookingSignOut.customerSignOut[counter].items[b].itemId == bookingLineItems[x].itemId) {
                    bookingSignOut.customerSignOut[counter].items.splice(b, 1);
                    break;
                  }
                }
              }
              
              var bookingSignOutId = bookingSignOut._id;

              delete bookingSignOut._id;

              BookingSignOuts.update({_id: bookingSignOutId}, {$set: bookingSignOut});
            } else if(details['status'] == "Packed") {
              
               var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});

                for(k in inventoryItem.serialNo) {
                  if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {

                    if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                      inventoryItem.bookableQuantity += 1;
                      Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                    }
                    inventoryItem.serialNo[k].status = "Available";

                    var inventoryItemId = inventoryItem._id;
                    delete inventoryItem._id;
                    Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                    break;
                  }
                }
            }
          
            done = true;
            break;
            done = true;
          }
        }
        
      }
      if(done == false) {
        for(y in bookingLineItems[x].clashableSerialNumbers) {
          if(done == false) {
            if(bookingLineItems[x].clashableSerialNumbers[y].serialNo == details['serialNo'] && bookingLineItems[x].clashableSerialNumbers[y].itemId == inventoryItemId && bookingLineItems[x].clashableSerialNumbers[y].type == "Custom") {
              done = true;
            } else if(bookingLineItems[x].clashableSerialNumbers[y].serialNo == details['serialNo'] && bookingLineItems[x].clashableSerialNumbers[y].itemId == inventoryItemId && bookingLineItems[x].clashableSerialNumbers[y].type == undefined) {
              var originalStatus = bookingLineItems[x].clashableSerialNumbers[y].status;
              bookingLineItems[x].clashableSerialNumbers[y].status = details['status'];

              if(details['status'] == "Missing" || details['status'] == "Damaged") {
                bookingStatus.resolved = false;

                if(Repairs.findOne({itemId: bookingLineItems[x].itemId, serialNo: bookingLineItems[x].clashableSerialNumbers[y].serialNo}) == undefined) {
                  Repairs.insert({
                    item: bookingLineItems[x].item,
                    brand: bookingLineItems[x].brand,
                    status: details['status'],
                    queryName: bookingLineItems[x].brand + " " + bookingLineItems[x].item,
                    serialNo: bookingLineItems[x].clashableSerialNumbers[y].serialNo,
                    itemId: bookingLineItems[x].itemId,
                    createdAt: new Date(),
                    createdBy: Meteor.user().username
                  });
                } else {
                  Repairs.update({itemId: bookingLineItems[x].itemId, serialNo: bookingLineItems[x].clashableSerialNumbers[y].serialNo}, {$set: {status: details['status']}});
                }

                var remarkAcknowledge = new Object();
                remarkAcknowledge.id = bookingAcknowledgeRemark.remarksRequiringAcknowledgement.length;

                remarkAcknowledge.remark = username + " labelled " + bookingLineItems[x].brand + " " + bookingLineItems[x].item + " as " + details['status'] + ".";
                remarkAcknowledge.createdAt = new Date();
                remarkAcknowledge.serialNo = details['serialNo'];
                remarkAcknowledge.status = details['status'];
                remarkAcknowledge.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item;
                remarkAcknowledge.lineItem = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
                remarkAcknowledge.createdBy = username;
                remarkAcknowledge.status = "Unsigned";
                remarkAcknowledge.resolved = false;
                remarkAcknowledge.signedAt = null;
                remarkAcknowledge.signedBy = null;
                remarkAcknowledge.image = null;
                remarkAcknowledge.comments = [];
                bookingAcknowledgeRemark.remarksRequiringAcknowledgement.push(remarkAcknowledge);

                bookingStatus.acknowledged = false;

                var bookingAcknowledgeRemarkId = bookingAcknowledgeRemark._id;

                delete bookingAcknowledgeRemark._id;

                BookingAcknowledgeRemarks.update({_id: bookingAcknowledgeRemarkId}, {$set: bookingAcknowledgeRemark});

                var bookingStatusId = bookingStatus._id;

                delete bookingStatus._id;

                BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

                var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
                for(k in inventoryItem.serialNo) {
                  if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                    if(originalStatus == "N/A" || originalStatus == "Packed" || originalStatus == "In" || originalStatus == "Out") {
                      inventoryItem.bookableQuantity -= 1;
                    }
                    inventoryItem.serialNo[k].status = details['status'];

                    var inventoryItemId = inventoryItem._id;
                    delete inventoryItem._id;
                    Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                    break;
                  }
                }

              } else if(details['status'] == "Out") {

                var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
                for(k in inventoryItem.serialNo) {
                  if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                    if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                      inventoryItem.bookableQuantity += 1;

                      Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                    }
                    inventoryItem.serialNo[k].status = "Available";

                    var inventoryItemId = inventoryItem._id;
                    delete inventoryItem._id;
                    Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                    break;
                  }
                }


                var customerSignOut = new Object();
                var exists = false;
                var counter;
                for(z in bookingSignOut.customerSignOut) {
                  if(bookingSignOut.customerSignOut[z].status == "Unsigned") {
                    counter = z;
                    exists = true;
                    break;
                  }
                }
                if(exists) {
                  var push = new Object();
                  push.itemId = bookingLineItems[x].itemId;
                  push.serialNo = details['serialNo'];
                  push.equipmentGroup = bookingLineItems[x].groupCounter;
                  push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
                  bookingSignOut.customerSignOut[counter].items.push(push);
                  bookingSignOut.customerSignOut[counter].status = "Unsigned";
                  bookingSignOut.customerSignOut[counter].createdAt = new Date();
                  bookingSignOut.customerSignOut[counter].createdBy = username;
                } else {
                  customerSignOut.id = bookingSignOut.customerSignOut.length;
                  customerSignOut.items = [];
                  var push = new Object();
                  push.itemId = bookingLineItems[x].itemId;
                  push.serialNo = details['serialNo'];
                  push.equipmentGroup = bookingLineItems[x].groupCounter;
                  push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no: " + details['serialNo'];
                  customerSignOut.items.push(push);
                  customerSignOut.status = "Unsigned";
                  customerSignOut.createdAt = new Date();
                  customerSignOut.createdBy = username;
                  bookingSignOut.customerSignOut.push(customerSignOut);
                }

                bookingStatus.acknowledged = false;

                var bookingStatusId = bookingStatus._id;

                delete bookingStatus._id;

                BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

                var bookingSignOutId = bookingSignOut._id;

                delete bookingSignOut._id;

                BookingSignOuts.update({_id: bookingSignOutId}, {$set: bookingSignOut});
              } else if(details['status'] == "In") {
                var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
                for(k in inventoryItem.serialNo) {
                  if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                    if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                      inventoryItem.bookableQuantity += 1;

                      Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                    }
                    inventoryItem.serialNo[k].status = "Available";

                    var inventoryItemId = inventoryItem._id;
                    delete inventoryItem._id;
                    Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                    break;
                  }
                }

                var staffSignIn = new Object();
                var exists = false;
                var counter;
                for(z in bookingSignIn.staffSignIn) {
                  if(bookingSignIn.staffSignIn[z].status == "Unsigned") {
                    counter = z;
                    exists = true;
                    break;
                  }
                }
                if(exists) {
                  var push = new Object();
                  push.itemId = bookingLineItems[x].itemId;
                  push.equipmentGroup = bookingLineItems[x].groupCounter;
                  push.serialNo = details['serialNo'];

                  push.item = bookingLineItems[x].itemId.brand + " " + bookingLineItems[x].itemId.item + " serial no:" + details['serialNo'];
                  bookingSignIn.staffSignIn[counter].items.push(push);
                  bookingSignIn.staffSignIn[counter].status = "Unsigned";
                  bookingSignIn.staffSignIn[counter].createdAt = new Date();
                  bookingSignIn.staffSignIn[counter].createdBy = username;
                } else {
                  staffSignIn.id = bookingSignIn.staffSignIn.length;
                  staffSignIn.items = [];
                  var push = new Object();
                  push.itemId = bookingLineItems[x].itemId;
                  push.serialNo = details['serialNo'];
                  push.equipmentGroup = bookingLineItems[x].groupCounter;
                  push.item = bookingLineItems[x].brand + " " + bookingLineItems[x].item + " serial no:" + details['serialNo'];
                  staffSignIn.items.push(push);
                  staffSignIn.status = "Unsigned";
                  staffSignIn.createdAt = new Date();
                  staffSignIn.createdBy = username;
                  bookingSignIn.staffSignIn.push(staffSignIn);
                }

                bookingStatus.acknowledged = false;

                var bookingStatusId = bookingStatus._id;

                delete bookingStatus._id;

                BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

                var bookingSignInId = bookingSignIn._id;

                delete bookingSignIn._id;

                BookingSignIns.update({_id: bookingSignInId}, {$set: bookingSignIn});
              } else if(details['status'] == "N/A") {
                var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
                for(k in inventoryItem.serialNo) {
                  if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {
                    if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                      inventoryItem.bookableQuantity += 1;

                      Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                    }
                    inventoryItem.serialNo[k].status = "Available";
                    var inventoryItemId = inventoryItem._id;
                    delete inventoryItem._id;
                    Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                    break;
                  }
                }


                var exists = false;
                var counter;
                for(a in bookingSignOut.customerSignOut) {
                  if(bookingSignOut.customerSignOut[a].status == "Unsigned") {
                    counter = a;
                    exists = true;
                    break;
                  } else {
                    counter = 0;
                  }
                }

                if(bookingSignOut.customerSignOut[counter] != undefined) {
                  for(b in bookingSignOut.customerSignOut[counter].items) {
                    if(bookingSignOut.customerSignOut[counter].items[b].itemId == bookingLineItems[x].itemId) {
                      bookingSignOut.customerSignOut[counter].items.splice(b, 1);
                      break;
                    }
                  }
                }
              } else if(details['status'] == "Packed") {

                 var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
                  for(k in inventoryItem.serialNo) {
                    if(inventoryItem.serialNo[k].serialNo == details['serialNo']) {

                      if(inventoryItem.serialNo[k].status != "Available" && (originalStatus == "Missing" || originalStatus == "Damaged")) {
                        inventoryItem.bookableQuantity += 1;
                        Repairs.remove({itemId: inventoryItem._id, serialNo: inventoryItem.serialNo[k].serialNo});
                      }
                      inventoryItem.serialNo[k].status = "Available";
                      var inventoryItemId = inventoryItem._id;
                      delete inventoryItem._id;
                      Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
                      break;
                    }
                  }
              }
              done = true;
              break;
              done = true;
            }
          }
        }
      }
      

      var bookingLineItemId = bookingLineItems[x]._id;

      delete bookingLineItems[x]._id;

      BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItems[x]});

      if(done == true) {
        return;
      }
    }
  },
  addInvoiceBooking: function(customerDetails) {
    var equipmentDetails = [];
    var obj = new Object();
    obj.id = 0;
    obj.dates = [];
    obj.noOfDates = 0;
    obj.items = [];
    obj.subTotal = 0;

    equipmentDetails.push(obj);

    var logs = [];

    var log = new Object();
    log.content = Meteor.user().username + " created booking.";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    logs.push(log);

    var involvedUsers = [];
    involvedUsers.push(Meteor.user().username);

    var bookingId = Bookings.insert({
      customerId: customerDetails.id,
      customerCompany: customerDetails.company,
      customerName: customerDetails.name,
      customerNumber: customerDetails.number,
      customerEmail: customerDetails.email,
      customerAddress: customerDetails.address,
      customerIC: customerDetails.icStatus,
      status: "Unbooked",
      type: "Invoice",
      noOfItems: 0,
      balanceDue: 0,
      total: 0,
      customerPackagesUsed: [],
      payment: [],
      equipmentDetails: equipmentDetails,
      remarks: [],
      remarksRequiringAcknowledgement: [],
      staffSignIn: [],
      customerSignOut: [],
      involvedUsers: involvedUsers,
      logs: logs,
      createdBy: Meteor.user()._id,
      createdAt: new Date()
    });

    return bookingId;
  },
  updateBookingDates: function(invoiceId) {

    
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var allBookingGroups = BookingGroups.find({invoiceId: invoiceId}).fetch();


    var totalDates = [];

    bookingStatus.totalDates = [];

    for(x in allBookingGroups) {
      for(y in allBookingGroups[x].dates) {
        if(totalDates.indexOf(moment(allBookingGroups[x].dates[y]).subtract(1, 'days').format("DD MM YYYY")) == -1) {
          totalDates.push(moment(allBookingGroups[x].dates[y]).subtract(1, 'days').format("DD MM YYYY"));
        }
      }
    }

    bookingStatus.totalDates = totalDates;

    var arrayOfDateArrays = [];
    var counter = 0;
    var arrayOfObjects = [];

    for(x in allBookingGroups) {
      arrayOfDateArrays = [];
      arrayOfDateArrays[counter] = [];

      var obj = new Object();
      obj.id = allBookingGroups[x].groupId;
      if(allBookingGroups[x].dates != undefined) {
        if(allBookingGroups[x].dates.length >0) {

          for(y in allBookingGroups[x].dates) {
            allBookingGroups[x].dates[y] = parseInt(moment(allBookingGroups[x].dates[y]).format("x"));
          }

            allBookingGroups[x].dates.sort();

          for(y in allBookingGroups[x].dates) {
            allBookingGroups[x].dates[y] = new Date(allBookingGroups[x].dates[y]);
          }

          for(y in allBookingGroups[x].dates) {
            var date = moment(allBookingGroups[x].dates[y]);

            if(arrayOfDateArrays[counter].length == 0) {
              var date2 = date.subtract(1, 'days');
              arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
            } else {

              var date2 = date.subtract(1, 'days');

              if(moment(allBookingGroups[x].dates[parseInt(y-1)]).diff(date2) == 0) {

                arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
              } else {
                counter = counter + 1;
                arrayOfDateArrays[counter] = [];
                arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
              }
            }
          }

          obj.dateArray = arrayOfDateArrays;
          arrayOfObjects.push(obj);
        }
      }
    }

    bookingStatus.displayDates = arrayOfObjects;

    delete bookingStatus._id;
    BookingStatuses.update({invoiceId: invoiceId}, {$set: bookingStatus});
  },
  createInvoice: function(details) {
    var booking = Bookings.findOne({_id: details['_id']});

    var equipmentDetails = [];
    var fineArray = details['fineArray'];

    for(x in fineArray) {
      var object = new Object();
      object.id = fineArray[x];
      object.equipment = booking.remarksRequiringAcknowledgement[fineArray[x]].item;
      object.serialNo = booking.remarksRequiringAcknowledgement[fineArray[x]].serialNo;
      object.status = booking.remarksRequiringAcknowledgement[fineArray[x]].status;
      object.cost = 0;
      equipmentDetails.push(object);
    }

    var logs = [];

    var log = new Object();
    log.content = Meteor.user().username + " created invoice.";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    logs.push(log);

    var involvedUsers = [];
    involvedUsers.push(Meteor.user().username);

    var linkedInvoices = [];
    linkedInvoices.push(details['_id']);

    var bookingId = Bookings.insert({
      customerId: booking.customerId,
      customerCompany: booking.customerCompany,
      customerName: booking.customerName,
      customerNumber: booking.customerNumber,
      customerEmail: booking.customerEmail,
      customerAddress: booking.customerAddress,
      customerIC: booking.customerIC,
      status: "Unbooked",
      type: "Invoice",
      noOfItems: 0,
      balanceDue: 0,
      total: 0,
      customerPackagesUsed: [],
      payment: [],
      linkedInvoices: linkedInvoices,
      equipmentDetails: equipmentDetails,
      remarks: [],
      remarksRequiringAcknowledgement: [],
      staffSignIn: [],
      customerSignOut: [],
      involvedUsers: involvedUsers,
      logs: logs,
      createdBy: Meteor.user()._id,
      createdAt: new Date()
    });


    booking.linkedInvoices.push(bookingId);

    var log = new Object();
    log.content = Meteor.user().username + " created invoice #" + bookingId + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    booking.logs.push(log);

    delete booking._id;
    Bookings.update({_id: details['_id']}, {$set: booking});

    return bookingId;
  },
  addBooking: function(customerDetails) {

    
    // bookings
    var bookingObject = new Object();
    var involvedUsers = [];
    involvedUsers.push(Meteor.user().username);

    bookingObject.involvedUsers = involvedUsers;
    bookingObject.createdBy = Meteor.user().username;
    bookingObject.createdAt = new Date();
    bookingObject.displayDates = [];

    

    var bookingId = Bookings.insert(bookingObject);

    // check bookingprivilege

    if(customerDetails.privileges != undefined && customerDetails.privileges.length != 0) {
        var bookingprivilegeObject = new Object();

        var privilege = Privileges.findOne({_id: customerDetails.privileges[0].id});

        bookingprivilegeObject.status = true;
        bookingprivilegeObject.value = parseInt(customerDetails.privileges[0].value);
        bookingprivilegeObject.name = privilege.name;
        bookingprivilegeObject.invoiceId = bookingId;

        BookingPrivileges.insert(bookingprivilegeObject);
    }

    // bookingacknowledgeremarks
    var bookingacknowledgeremarksObject = new Object();

    bookingacknowledgeremarksObject.remarksRequiringAcknowledgement = [];
    bookingacknowledgeremarksObject.invoiceId = bookingId;



    BookingAcknowledgeRemarks.insert(bookingacknowledgeremarksObject);

    // bookingcustomers
    var bookingcustomersObject = new Object();

    bookingcustomersObject.customerId = String(customerDetails.id);
    bookingcustomersObject.invoiceId = bookingId;



    BookingCustomers.insert(bookingcustomersObject);

    // bookinggeneralremarks
    var bookinggeneralremarksObject = new Object();

    bookinggeneralremarksObject.remarks = [];
    bookinggeneralremarksObject.invoiceId = bookingId;


    BookingGeneralRemarks.insert(bookinggeneralremarksObject);

    // bookinggroupprices
    var bookinggrouppricesObject = new Object();

    if(customerDetails.privileges != undefined && customerDetails.privileges.length != 0) {
      var privilege2 = Privileges.findOne({_id: customerDetails.privileges[0].id});
    }

    bookinggrouppricesObject.groupId = 0;
    bookinggrouppricesObject.invoiceId = bookingId;
    bookinggrouppricesObject.subTotal = 0;
    bookinggrouppricesObject.subDiscount = 0;
    bookinggrouppricesObject.afterTotal = 0;
    bookinggrouppricesObject.privilege = new Object();
    bookinggrouppricesObject.privilege.value = 0;
    if(privilege2 != undefined) {
      bookinggrouppricesObject.privilege.percentage = privilege2.discountValue;
      bookinggrouppricesObject.privilege.originalPercentage = privilege2.discountValue;
    } else {
      bookinggrouppricesObject.privilege.percentage = 0;
      bookinggrouppricesObject.privilege.originalPercentage = 0;
    }
    bookinggrouppricesObject.privilege.edited = false;


    BookingGroupPrices.insert(bookinggrouppricesObject);

    // bookinggroups
    var bookinggroupsObject = new Object();

    bookinggroupsObject.groupId = 0;
    bookinggroupsObject.dates = [];
    bookinggroupsObject.noOfDates = 0;
    bookinggroupsObject.invoiceId = bookingId;


    BookingGroups.insert(bookinggroupsObject);

    // bookinglogs
    var bookinglogsObject = new Object();

    bookinglogsObject.invoiceId = bookingId;
    bookinglogsObject.logs = [];

    var logObject = new Object();
    logObject.content = Meteor.user().username + " created invoice.";
    logObject.owner = Meteor.user().username;
    logObject.dateTime = new Date();

    bookinglogsObject.logs.push(logObject);


    BookingLogs.insert(bookinglogsObject);

    // bookingprices
    var bookingpricesObject = new Object();

    bookingpricesObject.gst = 0;
    bookingpricesObject.balanceDue = 0;
    bookingpricesObject.total = 0;
    bookingpricesObject.payment = [];
    bookingpricesObject.invoiceId = bookingId;


    BookingPrices.insert(bookingpricesObject);

    // bookingupdates

    var bookingupdatesObject = new Object();

    bookingupdatesObject.invoiceId = bookingId;
    bookingupdatesObject.status = "OK";

    BookingUpdates.insert(bookingupdatesObject);

    // bookingoverbooked

    var bookingoverbooked = new Object();

    bookingoverbooked.invoiceId = bookingId;
    bookingoverbooked.status = "OK";

    BookingOverbooked.insert(bookingoverbooked);

    // bookingprojects
    var bookingprojectsObject = new Object();

    bookingprojectsObject.projectName = "";
    bookingprojectsObject.invoiceId = bookingId;


    BookingProjects.insert(bookingprojectsObject);

    // bookingsignins
    var bookingsigninsObject = new Object();

    bookingsigninsObject.staffSignIn = [];
    bookingsigninsObject.invoiceId = bookingId;


    BookingSignIns.insert(bookingsigninsObject);

    // bookingsignouts
    var bookingsignoutsObject = new Object();

    bookingsignoutsObject.customerSignOut = [];
    bookingsignoutsObject.invoiceId = bookingId;
    

    BookingSignOuts.insert(bookingsignoutsObject);

    // bookingstatuses
    var bookingstatusesObject = new Object();

    bookingstatusesObject.clash = false;
    bookingstatusesObject.hide = false;
    bookingstatusesObject.acknowledged = true;
    bookingstatusesObject.resolved = true;
    bookingstatusesObject.packed = null;
    bookingstatusesObject.return = null;
    bookingstatusesObject.collected = true;
    bookingstatusesObject.overdue = false;
    bookingstatusesObject.unpaid = false;
    bookingstatusesObject.uncollected = false;
    bookingstatusesObject.quickbooksInvoiceId = "Pending";
    bookingstatusesObject.quickbooksInvoiceQueryId = "Pending";
    bookingstatusesObject.status = "OK";
    bookingstatusesObject.type = customerDetails['bookingType'];
    bookingstatusesObject.totalDates = [];
    bookingstatusesObject.displayDates = [];
    bookingstatusesObject.customerPackagesUsed = [];
    bookingstatusesObject.invoiceId = bookingId;

    
    BookingStatuses.insert(bookingstatusesObject);

    return bookingId;
  },

  addBookingRemark: function(remarkDetails) {

    var bookingGeneralRemarks = BookingGeneralRemarks.findOne({invoiceId: remarkDetails['_id']});
    var remark = new Object();

    if(bookingGeneralRemarks.remarks.length == 0) {
      var remark = new Object();
      remark.id = 0;
      remark.remark = remarkDetails['remark'];
      remark.createdAt = new Date();
      remark.createdBy = Meteor.user().username;
      remark.status = "Open";

      bookingGeneralRemarks.remarks.push(remark);
    } else {
      var remark = new Object();
      remark.id = bookingGeneralRemarks.remarks[bookingGeneralRemarks.remarks.length - 1].id + 1;
      remark.remark = remarkDetails['remark'];
      remark.createdAt = new Date();
      remark.createdBy = Meteor.user().username;
      remark.status = "Open";

      bookingGeneralRemarks.remarks.push(remark);
    }

    // var log = new Object();
    // log.content = Meteor.user().username + " added Remark #" + booking.remarks.length + " - " + remark.remark + ".";
    // log.owner = Meteor.user().username;
    // log.dateTime = new Date();

    // booking.logs.push(log);

    delete bookingGeneralRemarks._id;
    BookingGeneralRemarks.update({invoiceId: remarkDetails['_id']}, {$set: bookingGeneralRemarks});
  },
  showClash: function(id) {
    BookingStatuses.update({_id: id}, {$set: {hide: false}});
  },
  hideClash: function(id) {
    BookingStatuses.update({_id: id}, {$set: {hide: true}});
  },
  deleteBooking: function(id) {
    
    

    var bookingLineItems = BookingLineItems.find({invoiceId: id}).fetch();
    var bookingStatus = BookingStatuses.findOne({invoiceId: id});
    var customerId = BookingCustomers.findOne({invoiceId: id}).customerId;

    for(x in bookingLineItems) {

      var bookingGroup = BookingGroups.findOne({invoiceId: id, groupId: parseInt(bookingLineItems[x].groupCounter)});

      // if(bookingLineItems[x].packageClicked != undefined) { //there's a package
      //   var customerPackage = CustomerPackages.findOne({_id: bookingLineItems[x].packageClicked});
      //     for(z in customerPackage.items) {
      //       if(customerPackage.items[z].id == bookingLineItems[x].itemId) {
      //         customerPackage.items[z].quantity += bookingLineItems[x].discountPriced;
      //       }
      //     }

      //     for(z in customerPackage.bookings) {
      //       if(customerPackage.bookings[z].id == id) {
      //         customerPackage.bookings.splice(z,1);
      //       }
      //     }

      //     delete customerPackage._id;
      //     CustomerPackages.update({_id: bookingLineItems[x].packageClicked}, {$set: customerPackage});
      // }

      var datesArray = bookingGroup.dates;
      var availableEquipments = AvailableEquipments.find({dateTime: {$in: datesArray}}).fetch();
      for(z in availableEquipments) {
        var availableEquipmentId = availableEquipments[z]._id;
        AvailableEquipments.update({_id: availableEquipmentId}, {$inc: {remainingQuantity: bookingLineItems[x].booked}});
      }

      if(bookingLineItems[x].clash == true) {
        for(a in bookingLineItems[x].clashableSerialNumbers) {
          for(b in bookingLineItems[x].clashableSerialNumbers[a].clashCalendars) {

            var originalCalendars = bookingLineItems[x].clashableSerialNumbers[a].originalCalendars;

            var calendar = EquipmentCalendars.findOne({_id: bookingLineItems[x].clashableSerialNumbers[a].clashCalendars[b]});
            var bookingLineItemId = calendar.bookingLineItemId;

            var bookingLineItemToUpdate = BookingLineItems.findOne({_id: bookingLineItemId});

            for(c in bookingLineItemToUpdate.clashableSerialNumbers) {
              if(bookingLineItemToUpdate.clashableSerialNumbers[c].serialNo == bookingLineItems[x].clashableSerialNumbers[a].serialNo) {

                for(d = (originalCalendars.length -1); d >= 0; d--) {
                  if(bookingLineItemToUpdate.clashableSerialNumbers[c].clashCalendars.indexOf(originalCalendars[d]) != -1) {
                    bookingLineItemToUpdate.clashableSerialNumbers[c].clashCalendars.splice(d, 1);
                  }
                }

                if(bookingLineItemToUpdate.clashableSerialNumbers[c].clashCalendars.length == 0) {
                  // shift to unclashable

                  var unclashableObject = new Object();
                  unclashableObject.serialNo = bookingLineItemToUpdate.clashableSerialNumbers[c].serialNo;
                  unclashableObject.status = bookingLineItemToUpdate.clashableSerialNumbers[c].status;
                  unclashableObject.itemId = bookingLineItemToUpdate.clashableSerialNumbers[c].itemId;
                  unclashableObject.groupId = bookingLineItemToUpdate.clashableSerialNumbers[c].groupId;

                  bookingLineItemToUpdate.unclashableSerialNumbers.push(unclashableObject);

                  bookingLineItemToUpdate.clashableSerialNumbers.splice(c, 1);
                }

                break;
              }
            }

            if(bookingLineItemToUpdate.clashableSerialNumbers.length == 0) {
              bookingLineItemToUpdate.clash = false;
            }

            delete bookingLineItemToUpdate._id;
            BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItemToUpdate});
            Meteor.call("updateBookingStatus", bookingLineItemToUpdate.invoiceId);
          }
        }
      }
    }

    
    
    if(bookingStatus.type == "Booking" && bookingStatus.quickbooksInvoiceQueryId != "Pending") {
        bookingStatus.status = "Void";
        delete bookingStatus._id;
        BookingStatuses.update({invoiceId: id}, {$set: bookingStatus});
        return "Void";
      } else {
        

        BookingAcknowledgeRemarks.remove({invoiceId: id});
        BookingCustomers.remove({invoiceId: id});
        BookingGeneralRemarks.remove({invoiceId: id});
        BookingGroupPrices.remove({invoiceId: id});
        BookingGroups.remove({invoiceId: id});
        BookingLogs.remove({invoiceId: id});
        BookingPrices.remove({invoiceId: id});
        BookingProjects.remove({invoiceId: id});
        BookingSignIns.remove({invoiceId: id});
        BookingSignOuts.remove({invoiceId: id});
        BookingStatuses.remove({invoiceId: id});
        BookingLineItems.remove({invoiceId: id});
        Bookings.remove({_id: id});

        EquipmentCalendars.remove({invoiceId: id});
        Calendars.remove({invoiceId: id});

        return id;
      }
  },
  updateBookingRemark: function(remarkDetails) {
    var bookingGeneralRemarks = BookingGeneralRemarks.findOne({invoiceId: remarkDetails['_id']});
    bookingGeneralRemarks.remarks = remarkDetails['remarks'];

    // if(remarkDetails['remarks'][remarkDetails['clicked']].status == "Open") {
    //   var log = new Object();
    //   var number = parseInt(remarkDetails['clicked']) + 1;
    //   log.content = Meteor.user().username + " opened Remark #" + number + ".";
    //   log.owner = Meteor.user().username;
    //   log.dateTime = new Date();
    // } else {
    //   var log = new Object();
    //   var number = parseInt(remarkDetails['clicked']) + 1;
    //   log.content = Meteor.user().username + " closed Remark #" + number + ".";
    //   log.owner = Meteor.user().username;
    //   log.dateTime = new Date();
    // }

    // booking.logs.push(log);

    delete bookingGeneralRemarks._id;
    BookingGeneralRemarks.update({invoiceId: remarkDetails['_id']}, {$set: bookingGeneralRemarks});
  },
  addBookingItem: function(itemDetails) {



    var bookingId = itemDetails['_id'];
    var booking = Bookings.findOne({_id: itemDetails['_id']});
    var string = itemDetails['id'].split("_");
    var duplicate = false;

    for (x in booking.equipmentDetails[string[0]].items) {
      if(itemDetails['id'] == booking.equipmentDetails[string[0]].items[x].id) {
        duplicate = true;
      }
    }



    if(!duplicate) {
      delete itemDetails._id;
      delete booking._id;

      var log = new Object();
      log.owner = Meteor.user().username;
      log.dateTime = new Date();

      //search customer packages whether or not customer is entitled to discounts
      if(itemDetails['packageClicked'] != undefined) {
        var customerPackage = CustomerPackages.findOne({_id: itemDetails['packageClicked']});
        for(x in customerPackage.items) {
          if(customerPackage.items[x].id == itemDetails['itemId']) {
            itemDetails['discount'] = itemDetails['rate'] - customerPackage.items[x].rate;
            itemDetails['rate'] = customerPackage.items[x].rate;
            log.content = Meteor.user().username + " added " + itemDetails['item'] + " into Group #" + (parseInt(string[0])+1) + " and selected " + customerPackage.name + ".";
          }
        }
      } else {
        log.content = Meteor.user().username + " added " + itemDetails['item'] + " into Group #" + (parseInt(string[0])+1) + ".";
      }

      booking.logs.push(log);

      if(booking.equipmentDetails[string[0]].noOfDates > 0) {
        itemDetails['days'] = booking.equipmentDetails[string[0]].noOfDates;
      }

      itemDetails['discountOverwrite'] = parseInt(0);

      booking.equipmentDetails[string[0]].items.push(itemDetails);

      //check for clashes



      Bookings.update({_id: bookingId}, {$set: booking});
    }
  },
  removeBookingItem: function(details) {

    

    var bookingLineItemId = details['id'];
    var invoiceId = details['_id'];

    var datesArray = [];
    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
    var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: parseInt(bookingLineItem.groupCounter)});
    var availableEquipments;

    // amend available equipments
    for(x in bookingGroup.dates) {
      datesArray.push(moment(bookingGroup.dates[x]).subtract(1, 'days').format("DD MM YYYY"));
    }

    availableEquipments = AvailableEquipments.find({itemId: bookingLineItem.itemId, date: {$in: datesArray}}).fetch();

    for(x in availableEquipments) {
      var availableEquipmentId = availableEquipments[x]._id;
      availableEquipments[x].remainingQuantity += bookingLineItem.booked;

      delete availableEquipments[x]._id;
      AvailableEquipments.update({_id: availableEquipmentId}, {$set: availableEquipments[x]});
    }

    // finally remove database row
    BookingLineItems.remove(details['id']);


  },
  deletePayment: function(details) {
    

    var bookingPrice = BookingPrices.findOne({invoiceId: details['_id']});
    // var booking = Bookings.findOne({_id: details['_id']});

    // var log = new Object();
    // log.content = Meteor.user().username + " removed " + bookingPrice.payment[details['paymentId']].type + " payment of " + accounting.formatMoney(bookingPrice.payment[details['paymentId']].amount) + ".";
    // log.owner = Meteor.user().username;
    // log.dateTime = new Date();
    // booking.logs.push(log);

    // delete booking._id;
    // Bookings.update({_id: details['_id']}, {$set: booking});

    var amount = bookingPrice.payment[details['paymentId']].amount;

    bookingPrice.balanceDue += bookingPrice.payment[details['paymentId']].amount;
    bookingPrice.payment.splice(details['paymentId'], 1);
    for(x in bookingPrice.payment) {
      bookingPrice.payment[x].id = parseInt(x);
    }

    delete bookingPrice._id;
    BookingPrices.update({invoiceId: details['_id']}, {$set: bookingPrice});
  },
  test: function() {
    return true;
  },
  removeBookingGroup: function(details) {
    

    var groupId = parseInt(details['id']);
    var invoiceId = details['_id'];
    var datesArray = [];

    var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupId}).fetch();

    var allBookingLineItems = BookingLineItems.find({invoiceId: invoiceId}, {sort: {groupCounter: 1}}).fetch();

    var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupId});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});

    for(x in bookingGroup.dates) {
      datesArray.push(moment(bookingGroup.dates[x]).subtract(1, 'days').format("DD MM YYYY"))
    }

    var originalCustomerPackagesUsed = bookingStatus.customerPackagesUsed;
    var cleanedOriginalCustomerPackagesUsed = [];

    for(x in originalCustomerPackagesUsed) {
      var string = originalCustomerPackagesUsed[x].split("_");
      var customerPackage = string[1];
      if(cleanedOriginalCustomerPackagesUsed.indexOf(customerPackage) == -1) {
        cleanedOriginalCustomerPackagesUsed.push(customerPackage);
      }
    }

    var amended = false;

    var groupCounter = 0;

    for(i = 0; i < allBookingLineItems.length; i++) {
      if(allBookingLineItems[i].groupCounter == groupId) {

        amended = true;

        if(allBookingLineItems[i].clashableSerialNumbers.length > 0) {
          for(a in allBookingLineItems[i].clashableSerialNumbers) {
            for(b in allBookingLineItems[i].clashableSerialNumbers[a].clashCalendars) {
              var clashedSerialNumber = allBookingLineItems[i].clashableSerialNumbers[a].serialNo;

              

              var clashedEquipmentCalendar = EquipmentCalendars.findOne({_id: allBookingLineItems[i].clashableSerialNumbers[a].clashCalendars[b]});


              var clashedBookingLineItem = BookingLineItems.findOne({_id: clashedEquipmentCalendar.bookingLineItemId});


              for(c in clashedBookingLineItem.clashableSerialNumbers) {
                if(clashedBookingLineItem.clashableSerialNumbers[c].serialNo == clashedSerialNumber) {
                  if(clashedBookingLineItem.clashableSerialNumbers[c].originalCalendars.indexOf(clashedEquipmentCalendar._id) != -1) {
                    clashedBookingLineItem.clashableSerialNumbers[c].originalCalendars.splice(clashedBookingLineItem.clashableSerialNumbers[c].originalCalendars.indexOf(clashedEquipmentCalendar._id), 1);
                  }


                  if(clashedBookingLineItem.clashableSerialNumbers[c].originalCalendars.length == 0) {
                    // shift to unclashable
                    var unclashObject = new Object();
                    unclashObject.serialNo = clashedBookingLineItem.clashableSerialNumbers[c].serialNo;
                    unclashObject.status = clashedBookingLineItem.clashableSerialNumbers[c].status;
                    unclashObject.groupId = clashedBookingLineItem.clashableSerialNumbers[c].groupId;
                    unclashObject.itemId = clashedBookingLineItem.clashableSerialNumbers[c].itemId;

                    clashedBookingLineItem.unclashableSerialNumbers.push(unclashObject);
                    clashedBookingLineItem.clashableSerialNumbers.splice(c, 1);
                  }

                  if(clashedBookingLineItem.clashableSerialNumbers.length == 0) {
                    clashedBookingLineItem.clash = false;
                  }

                  break;
                }
              }

              delete clashedBookingLineItem._id;

              BookingLineItems.update({_id: clashedEquipmentCalendar.bookingLineItemId}, {$set: clashedBookingLineItem});
              Meteor.call("updateBookingStatus", clashedBookingLineItem.invoiceId);
            }
          }
        }

        groupCounter = parseInt(allBookingLineItems[i].groupCounter);

        BookingLineItems.remove({_id: allBookingLineItems[i]._id});

        EquipmentCalendars.remove({bookingLineItemId: allBookingLineItems[i]._id});
      } else {
        if(amended) {
          if((groupCounter + 1) != parseInt(allBookingLineItems[i].groupCounter)) {
            groupCounter += 1;
          }

          if(allBookingLineItems[i].id != undefined) {
            var id = allBookingLineItems[i].id;
            var string = id.split("_");

            allBookingLineItems[i].id = groupCounter + "_" + string[1];
          }
          allBookingLineItems[i].groupCounter = groupCounter;

          var updateId = allBookingLineItems[i]._id;
          delete allBookingLineItems[i]._id;

          BookingLineItems.update({_id: updateId}, {$set: allBookingLineItems[i]});
        }
      }
    }


    var allBookingGroups = BookingGroups.find({invoiceId: invoiceId}, {sort: {groupId: 1}}).fetch();

    
    var amended = false;

    var groupCounter = 0;

    for(i = 0; i < allBookingGroups.length; i++) {
      if(allBookingGroups[i].groupId == groupId) {
        
        amended = true;

        groupCounter = allBookingGroups[i].groupId;

        BookingGroups.remove({_id: allBookingGroups[i]._id});
      } else {
        if(amended) {
          if((groupCounter + 1) != parseInt(allBookingGroups[i].groupId)) {
            groupCounter += 1;
          }

          allBookingGroups[i].groupId = groupCounter;

          var updateId = allBookingGroups[i]._id;
          delete allBookingGroups[i]._id;

          BookingGroups.update({_id: updateId}, {$set: allBookingGroups[i]});
        }
      }
    }

    var allBookingGroupPrices = BookingGroupPrices.find({invoiceId: invoiceId}, {sort: {groupId: 1}}).fetch();

    var amended = false;

    var groupCounter = 0;

    for(i = 0; i < allBookingGroupPrices.length; i++) {
      if(allBookingGroupPrices[i].groupId == groupId) {
        amended = true;

        groupCounter = allBookingGroupPrices[i].groupId;

        BookingGroupPrices.remove({_id: allBookingGroupPrices[i]._id});
      } else {
        if(amended) {
          if((groupCounter + 1) != parseInt(allBookingGroupPrices[i].groupId)) {
            groupCounter += 1;
          }

          allBookingGroupPrices[i].groupId = groupCounter;

          var updateId = allBookingGroupPrices[i]._id;
          delete allBookingGroupPrices[i]._id;

          BookingGroupPrices.update({_id: updateId}, {$set: allBookingGroupPrices[i]});
        }
      }
    }

    // calendars
    

    var calendars = Calendars.find({invoiceId: invoiceId}, {sort: {groupId: 1}}).fetch();

    

    var amended = false;

    for(x in calendars) {
      if(calendars[x].groupId == groupId) {
        amended = true;

        Calendars.remove({_id: calendars[x]._id});
      } else {
        if(amended == true) {
          calendars[x].groupId = parseInt(calendars[x].groupId) - 1;
          calendars[x].title = calendars[x].title.slice(0, -1);
          calendars[x].title = calendars[x].title + (parseInt(calendars[x].groupId) + 1);

          var calendarId = calendars[x]._id;
          delete calendars[x]._id;

          Calendars.update({_id: calendarId}, {$set: calendars[x]});
        }
      }
    }





    // BookingGroups.remove({invoiceId: details['_id'], groupId: parseInt(details['id'])});


  },

  checkGroupClashes: function(details) {
    var booking = Bookings.findOne({_id: details['_id']});

    var individualFormattedDates = [];
    var individualDates = booking.equipmentDetails[details['id']].dates;
    individualDates.unshift(moment(individualDates[0]).subtract(1, 'days')._d);
    individualDates.push(moment(individualDates[individualDates.length - 1]).add(1, 'days')._d);


  },
  checkClashes: function(details) {
    var booking = Bookings.findOne({_id: details['_id']});

    var individualFormattedDates = [];
    var individualDates = booking.equipmentDetails[details['id']].dates;
    individualDates.unshift(moment(individualDates[0]).subtract(1, 'days')._d);
    individualDates.push(moment(individualDates[individualDates.length - 1]).add(1, 'days')._d);

    for(x in individualDates) {
      individualFormattedDates.push(moment(individualDates[x]).format("DD MM YYYY"));
    }

    var equipmentCalendars = EquipmentCalendars.find({dates: {$in: individualFormattedDates}}).fetch();

    for(x in booking.equipmentDetails[details['id']].items) {
      var clashableSerialNumbers = [];
      var unclashableSerialNumbers = [];
      var availableSerialNumbers = [];

      //check available serial numbers
      var inventoryItem = Inventory.findOne({_id: booking.equipmentDetails[details['id']].items[x].itemId});
      var statuses = ["Sent For Repair", "Missing", "Damaged"];
      for(j in inventoryItem.serialNo) {
        if(!(statuses.indexOf(inventoryItem.serialNo[j].status) != -1)) {
          availableSerialNumbers.push(inventoryItem.serialNo[j].serialNo);
        }
      }

      //we wanna find a list of serial numbers that are unclashable and those that are clashable made out of items in availableSerialNumbers
      for(a in availableSerialNumbers) {
        for(b in equipmentCalendars) {
          if(equipmentCalendars[b].serialNumbers.indexOf(availableSerialNumbers[a]) != -1) {
            clashableSerialNumbers.push(availableSerialNumbers[a]);
            availableSerialNumbers.splice(a, 1);
          }
        }
      }

      unclashableSerialNumbers = availableSerialNumbers;
      var spliceArray = [];

      for(t in booking.equipmentDetails[details['id']].items[x].unclashableSerialNumbers) {
        if(clashableSerialNumbers.indexOf(booking.equipmentDetails[details['id']].items[x].unclashableSerialNumbers[t].serialNo) != -1) {
          booking.equipmentDetails[details['id']].items[x].clashableSerialNumbers.push(booking.equipmentDetails[details['id']].items[x].unclashableSerialNumbers[t]);
          spliceArray.push(t);
        }
      }

      spliceArray.sort(function(a, b){return b-a});
      for(u in spliceArray) {
        booking.equipmentDetails[details['id']].items[x].unclashableSerialNumbers.splice(spliceArray[u], 1);
      }
    }

    if(booking.equipmentDetails[details['id']].items[x].clashableSerialNumbers.length > 0) {
      booking.equipmentDetails[details['id']].items[x].clash = true;
    } else {
      booking.equipmentDetails[details['id']].items[x].clash = false;
    }

    var finalClash = false;
    for(s in booking.equipmentDetails) {
      for(d in booking.equipmentDetails[s].items) {
        if(booking.equipmentDetails[s].items[d].clash == true) {
          finalClash = true;
          break;
        }
      }
    }

    booking.clash = finalClash;

    delete booking._id;
    booking.equipmentDetails[details['id']].dates = details['dates'];
    Bookings.update({_id: details['_id']}, {$set: booking});
  },
  addSerialQuantityToBookingItem: function(details) {
    
    var returnObject = new Object();

    var invoiceId = details['_id'];
    var bookingLineItemId = details['bookingLineItemId'];
    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
    var itemId = bookingLineItem.itemId;
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
    var customer = Customers.findOne({_id: bookingCustomer.customerId});
    var dates = details['dates'];
    var serialNoAdded = details['serialNoAdded'];
    var serialNoArray = details['serialNoArray'];
    var dateTimeArray = [];
    var datesArray = [];
    var arrayToBeReturned = [];
    var arrayToBeReturnedDigits = [];
    var inventoryItem = Inventory.findOne({_id: itemId});
    var bookableSerialNumbers = [];
    var equipmentCalendars = [];
    var clashableSerialNumbers = [];
    var unclashableSerialNumbers = [];

    var overbooked = false;

    for(x in dates) {
      datesArray.push(moment(dates[x]).subtract(1,'days').format("DD MM YYYY"));
      dateTimeArray.push(moment(dates[x]).subtract(1,'days')._d);
    }

    

    availableEquipments = AvailableEquipments.find({date: {$in: datesArray}, itemId: itemId}).fetch();

    for(x in availableEquipments) {
      if(availableEquipments[x].remainingQuantity == 0) {
        overbooked = true;
        if(Meteor.absoluteUrl() == 'http://localhost:3000/') {
          arrayToBeReturned.push(moment(availableEquipments[x].dateTime).subtract(1,'days').format("Do MMMM YYYY"));
          arrayToBeReturnedDigits.push(availableEquipments[x].date);
        } else {
          arrayToBeReturned.push(moment(availableEquipments[x].dateTime).format("Do MMMM YYYY"));
          arrayToBeReturnedDigits.push(availableEquipments[x].date);
        }
      }
    }

    if(overbooked) {
      returnObject.status = "Overbooked";
      returnObject.dates = arrayToBeReturned;
      returnObject.datesDigits = arrayToBeReturnedDigits;
      returnObject.inventoryItem = inventoryItem;

      return returnObject;
    }

    

    //NOW POPULATE AVAILABLE SERIAL NUMBERS THAT ARE IN INVENTORY ITEM
    //THIS MAY BE CLASHABLE OR UNCLASHABLE
    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].status != "Sent For Repair" && inventoryItem.serialNo[x].status != "Missing" && inventoryItem.serialNo[x].status != "Damaged") {
        bookableSerialNumbers.push(inventoryItem.serialNo[x].serialNo);
      }
    }

    

    //POPULATE DATES TO QUERY EQUIPMENT CALENDARS
    var dateArray = [];
    var dateArrayMoment = [];
    var counter = 0;
    var booked = 0;
    var monthArray = [];
    dateArray[counter] = [];
    monthArray[counter] = [];
    dateArrayMoment[counter] = [];

    //MAKE THEM INTO INDIVIDUAL DATE GROUPS
    for(x in dateTimeArray) {
      if(dateArray[counter].length == 0) {
        dateArray[counter].push(moment(dateTimeArray[x]).format('DD MM YYYY'));
        dateArrayMoment[counter].push(moment(dateTimeArray[x]));
        if(monthArray[counter].indexOf(moment(dateTimeArray[x]).format('MM YYYY')) == -1) {
          monthArray[counter].push(moment(dateTimeArray[x]).format('MM YYYY'));
        }
      } else {
        var date2 = moment(dateTimeArray[x]).subtract(1, 'days');

        if(date2.format('DD MM YYYY') == dateArray[counter][dateArray[counter].length - 1]) {
          dateArray[counter].push(moment(dateTimeArray[x]).format('DD MM YYYY'));
          dateArrayMoment[counter].push(moment(dateTimeArray[x]));
          if(monthArray[counter].indexOf(moment(dateTimeArray[x]).format('MM YYYY')) == -1) {
            monthArray[counter].push(moment(dateTimeArray[x]).format('MM YYYY'));
          }
        } else {
          counter += 1;
          dateArray[counter] = [];
          dateArray[counter].push(moment(dateTimeArray[x]).format('DD MM YYYY'));

          dateArrayMoment[counter] = [];
          dateArrayMoment[counter].push(moment(dateTimeArray[x]));

          monthArray[counter] = [];
          if(monthArray[counter].indexOf(moment(dateTimeArray[x]).format('MM YYYY')) == -1) {
            monthArray[counter].push(moment(dateTimeArray[x]).format('MM YYYY'));
          }
        }
      }
    }

    

    for(x in dateArrayMoment) {
      dateArrayMoment[x].unshift(moment(dateArrayMoment[x][0]).subtract(1, 'days'));
      dateArrayMoment[x].push(moment(dateArrayMoment[x][dateArrayMoment[x].length - 1]).add(1, 'days'));

      dateArray[x].unshift(moment(dateArrayMoment[x][0]).format("DD MM YYYY"));
      dateArray[x].push(moment(dateArrayMoment[x][dateArrayMoment[x].length - 1]).format("DD MM YYYY"));
    }

    var individualDates = [];
    for(x in dateArray) {
      for(y in dateArray[x]) {
        if(individualDates.indexOf(dateArray[x][y]) == -1) {
          individualDates.push(dateArray[x][y]);
        }
      }
    }

    

    //CHECK EQUIPMENT CALENDARS AND POPULATE CLASHABLE AND UNCLASHABLE SERIAL NUMBERS
    equipmentCalendars = EquipmentCalendars.find({dates: {$in: individualDates}, equipmentId: itemId}).fetch();

    

    for(x in equipmentCalendars) {
      for(y in equipmentCalendars[x].serialNumbers) {
        if(clashableSerialNumbers.indexOf(equipmentCalendars[x].serialNumbers[y]) == -1) {
          clashableSerialNumbers.push(equipmentCalendars[x].serialNumbers[y]);
        }
      }
    }

    for(x in bookableSerialNumbers) {
      if(clashableSerialNumbers.indexOf(bookableSerialNumbers[x]) == -1) {
        if(unclashableSerialNumbers.indexOf(bookableSerialNumbers[x]) == -1) {
          unclashableSerialNumbers.push(bookableSerialNumbers[x]);
        }
      }
    }

    
    //USE CLASHABLE AND UNCLASHABLE SERIAL NUMBERS TO DESIGNATE CLASH OR NO CLASH

    if(unclashableSerialNumbers.indexOf(serialNoAdded) != -1) {
      var currentEquipmentCalendarExists = false;

      for(x in equipmentCalendars) {
        if(equipmentCalendars[x].bookingLineItemId == bookingLineItemId) {
          currentEquipmentCalendarExists = true;
          equipmentCalendars[x].booked += 1;
          equipmentCalendars[x].serialNumbers.push(serialNoAdded);

          var equipmentCalendarId = equipmentCalendars[x]._id;

          delete equipmentCalendars[x]._id;
          EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: equipmentCalendars[x]});
        }
      }

      for(x in dateArrayMoment) {
        dateArray[x].shift();
        dateArray[x].pop();

        dateArrayMoment[x].shift();
        dateArrayMoment[x].pop();
      }

      //if this is a new entry to equipment calendars
      if(currentEquipmentCalendarExists == false) {
        for(x in dateArrayMoment) {
          var serialNumberArray = [];
          serialNumberArray.push(serialNoAdded);

          if(dateArrayMoment[x].length == 1) {
            var equipmentCalendarAttributes = {
              startDate: new Date(dateArrayMoment[x][0].add(1, 'days')),
              endDate: new Date(dateArrayMoment[x][dateArrayMoment[x].length - 1]),
              invoiceId: invoiceId,
              title: customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item,
              customerName: customer.name,
              equipmentBrand: inventoryItem.brand,
              equipmentItem: inventoryItem.item,
              equipmentId: inventoryItem._id,
              type: bookingStatus.type,
              customerId: bookingCustomer.customerId,
              bookingLineItemId: bookingLineItemId,
              url: "bookings/" + invoiceId,
              serialNumbers: serialNumberArray,
              booked: 1,
              months: monthArray[x],
              dates: dateArray[x]
            };

            EquipmentCalendars.insert(equipmentCalendarAttributes);
          } else {
            var equipmentCalendarAttributes = {
              startDate: new Date(dateArrayMoment[x][0].add(1, 'days')),
              endDate: new Date(dateArrayMoment[x][dateArrayMoment[x].length - 1].add(2, 'days')),
              invoiceId: invoiceId,
              title: customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item,
              customerName: customer.name,
              equipmentBrand: inventoryItem.brand,
              equipmentItem: inventoryItem.item,
              equipmentId: inventoryItem._id,
              type: bookingStatus.type,
              customerId: bookingCustomer.customerId,
              bookingLineItemId: bookingLineItemId,
              url: "bookings/" + invoiceId,
              serialNumbers: serialNumberArray,
              booked: 1,
              months: monthArray[x],
              dates: dateArray[x]
            };

            EquipmentCalendars.insert(equipmentCalendarAttributes);
          }
        }
      }

      //AFFECT CURRENT BOOKING
      bookingLineItem.booked += 1;

      var unclashableObject = new Object();
      unclashableObject.status = "N/A";
      unclashableObject.serialNo = serialNoAdded;
      unclashableObject.itemId  = bookingLineItem.itemId;
      unclashableObject.groupId = bookingLineItem.groupCounter;

      bookingLineItem.unclashableSerialNumbers.push(unclashableObject);

      if(bookingLineItem.packageClicked == undefined) {
        bookingLineItem.originalPriced += bookingLineItem.days;
      } else {
        var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});

        for(x in customerPackage.items) {
          if(customerPackage.items[x].id == itemId) {

            if(customerPackage.items[x].quantity > bookingLineItem.days) {
              bookingLineItem.discountPriced += bookingLineItem.days;
              customerPackage.items[x].quantity -= bookingLineItem.days;

              var customerPackageId = customerPackage._id;
              delete customerPackage._id;

              CustomerPackages.update({_id: customerPackageId}, {$set: customerPackage});
            } else {
              bookingLineItem.discountPriced += customerPackage.items[x].quantity;
              bookingLineItem.originalPriced += (bookingLineItem.days - customerPackage.items[x].quantity);
              customerPackage.items[x].quantity  = parseInt(0);

              var customerPackageId = customerPackage._id;
              delete customerPackage._id;

              CustomerPackages.update({_id: customerPackageId}, {$set: customerPackage});
            }

            break;
          }
        }
      }

      //UPDATE AVAILABLE EQUIPMENTS
      //IF DOES NOT EXIST, CREATE NEW
      for(x in dateArray) {
        for(y in dateArray[x]) {
          var availableEquipmentToUpdate = AvailableEquipments.findOne({date: dateArray[x][y], itemId: itemId});
          if(availableEquipmentToUpdate == undefined) {
            var availableEquipmentAttributes = {
                date: dateArray[x][y],
                dateTime: dateArrayMoment[x][y]._d,
                itemId: itemId,
                remainingQuantity: parseInt(inventoryItem.bookableQuantity) - 1
            };
            AvailableEquipments.insert(availableEquipmentAttributes);
          } else {
            var availableEquipmentId = availableEquipmentToUpdate._id;
            delete availableEquipmentToUpdate._id;

            AvailableEquipments.update({_id: availableEquipmentId}, {$inc: {remainingQuantity: -1}});
          }
        }
      }
    } else {
      
      //it exists in clashable serial numbers
      //add to equipment calendar
      //affect all bookings involved

      var equipmentCalendarId;
      var currentEquipmentCalendarExists = false;
      var equipmentCalendarsUpdatedAndCreated = [];
      var includedEquipmentCalendars = [];
      var clashCalendars = [];
      var clashDates = [];
      var originalCalendars = [];

      var includedCalendarId = false;

      for(x in equipmentCalendars) {
        if(equipmentCalendars[x].serialNumbers.indexOf(serialNoAdded) != -1) {
          clashCalendars.push(equipmentCalendars[x]._id);
          for(y in equipmentCalendars[x].dates) {
            if(clashDates.indexOf(equipmentCalendars[x].dates[y]) == -1) {
              clashDates.push(equipmentCalendars[x].dates[y]);
            }
          }
        }
      }

      for(x in dateArrayMoment) {
        for(y in dateArray[x]) {
          if(clashDates.indexOf(dateArray[x][y]) != -1) {
            includedCalendarId = true;
            break;
          }
        }
      }

      for(x in equipmentCalendars) {
        if(equipmentCalendars[x].bookingLineItemId == bookingLineItemId) {

          equipmentCalendarsUpdatedAndCreated.push(equipmentCalendars[x]._id);

          currentEquipmentCalendarExists = true;
          equipmentCalendars[x].booked += 1;
          equipmentCalendars[x].serialNumbers.push(serialNoAdded);

          var equipmentCalendarId = equipmentCalendars[x]._id;

          delete equipmentCalendars[x]._id;
          EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: equipmentCalendars[x]});

          if(includedCalendarId) {
            includedEquipmentCalendars.push(equipmentCalendarId);
          }
        }
      }

      for(x in dateArrayMoment) {
        dateArray[x].shift();
        dateArray[x].pop();

        dateArrayMoment[x].shift();
        dateArrayMoment[x].pop();
      }

      //if this is a new entry to equipment calendars
      if(currentEquipmentCalendarExists == false) {
        for(x in dateArrayMoment) {
          var serialNumberArray = [];
          serialNumberArray.push(serialNoAdded);

          if(dateArrayMoment[x].length == 1) {
            var equipmentCalendarAttributes = {
              startDate: new Date(dateArrayMoment[x][0].add(1, 'days')),
              endDate: new Date(dateArrayMoment[x][dateArrayMoment[x].length - 1]),
              invoiceId: invoiceId,
              title: customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item,
              customerName: customer.name,
              equipmentBrand: inventoryItem.brand,
              equipmentItem: inventoryItem.item,
              equipmentId: inventoryItem._id,
              type: bookingStatus.type,
              customerId: bookingCustomer.customerId,
              bookingLineItemId: bookingLineItemId,
              url: "bookings/" + invoiceId,
              serialNumbers: serialNumberArray,
              booked: 1,
              months: monthArray[x],
              dates: dateArray[x]
            };

            equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);
          } else {
            var equipmentCalendarAttributes = {
              startDate: new Date(dateArrayMoment[x][0].add(1, 'days')),
              endDate: new Date(dateArrayMoment[x][dateArrayMoment[x].length - 1].add(2, 'days')),
              invoiceId: invoiceId,
              title: customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item,
              customerName: customer.name,
              equipmentBrand: inventoryItem.brand,
              equipmentItem: inventoryItem.item,
              equipmentId: inventoryItem._id,
              type: bookingStatus.type,
              customerId: bookingCustomer.customerId,
              bookingLineItemId: bookingLineItemId,
              url: "bookings/" + invoiceId,
              serialNumbers: serialNumberArray,
              booked: 1,
              months: monthArray[x],
              dates: dateArray[x]
            };

            equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);
          }

          if(includedCalendarId) {
            includedEquipmentCalendars.push(equipmentCalendarId);
          }
        }
      }

      //AFFECT CURRENT BOOKING
      bookingLineItem.booked += 1;

      var clashObject = new Object();
      clashObject.serialNo = serialNoAdded;
      clashObject.status = "N/A";
      clashObject.groupId = bookingLineItem.groupCounter;
      clashObject.itemId = bookingLineItem.itemId;
      clashObject.clashCalendars = [];
      clashObject.clashCalendars = clashObject.clashCalendars.concat(clashCalendars);
      clashObject.originalCalendars = [];
      clashObject.originalCalendars = clashObject.originalCalendars.concat(includedEquipmentCalendars);
      bookingLineItem.clashableSerialNumbers.push(clashObject);
      bookingLineItem.clash = true;

      if(bookingLineItem.packageClicked == undefined) {
        bookingLineItem.originalPriced += bookingLineItem.days;
      } else {
        var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});

        for(x in customerPackage.items) {
          if(customerPackage.items[x].id == itemId) {

            if(customerPackage.items[x].quantity > bookingLineItem.days) {
              bookingLineItem.discountPriced += bookingLineItem.days;
              customerPackage.items[x].quantity -= bookingLineItem.days;

              var customerPackageId = customerPackage._id;
              delete customerPackage._id;

              CustomerPackages.update({_id: customerPackageId}, {$set: customerPackage});
            } else {
              bookingLineItem.discountPriced += customerPackage.items[x].quantity;
              bookingLineItem.originalPriced += (bookingLineItem.days - customerPackage.items[x].quantity);
              customerPackage.items[x].quantity  = parseInt(0);

              var customerPackageId = customerPackage._id;
              delete customerPackage._id;

              CustomerPackages.update({_id: customerPackageId}, {$set: customerPackage});
            }

            break;
          }
        }
      }

      
      for(x in clashCalendars) {
        var clashCalendar = EquipmentCalendars.findOne({_id: clashCalendars[x]});




        var clashedBookingLineItem = BookingLineItems.findOne({_id: clashCalendar.bookingLineItemId});

        for(y in clashedBookingLineItem.unclashableSerialNumbers) {
          if(clashedBookingLineItem.unclashableSerialNumbers[y].serialNo == serialNoAdded) {
            var clashObject = new Object();
            clashObject.serialNo = serialNoAdded;
            clashObject.groupId = clashedBookingLineItem.groupCounter;
            clashObject.itemId = clashedBookingLineItem.itemId;
            clashObject.status = clashedBookingLineItem.unclashableSerialNumbers[y].status;
            clashObject.clashCalendars = [];
            clashObject.clashCalendars = clashObject.clashCalendars.concat(includedEquipmentCalendars);
            clashObject.originalCalendars = [];
            clashObject.originalCalendars = clashObject.originalCalendars.concat(clashCalendars);

            clashedBookingLineItem.clashableSerialNumbers.push(clashObject);
            clashedBookingLineItem.unclashableSerialNumbers.splice(y,1);

            clashedBookingLineItem.clash = true;

            var clashedBookingLineItemId = clashedBookingLineItem._id;

            delete clashedBookingLineItem._id;
            BookingLineItems.update({_id: clashedBookingLineItemId}, {$set: clashedBookingLineItem});
          }
        }
      }

      //UPDATE AVAILABLE EQUIPMENTS
      //IF DOES NOT EXIST, CREATE NEW
      for(x in dateArray) {
        for(y in dateArray[x]) {
          var availableEquipmentToUpdate = AvailableEquipments.findOne({date: dateArray[x][y], itemId: itemId});
          if(availableEquipmentToUpdate == undefined) {
            var availableEquipmentAttributes = {
                date: dateArray[x][y],
                dateTime: dateArrayMoment[x][y]._d,
                itemId: itemId,
                remainingQuantity: parseInt(inventoryItem.bookableQuantity) - 1
            };
            AvailableEquipments.insert(availableEquipmentAttributes);
          } else {
            var availableEquipmentId = availableEquipmentToUpdate._id;
            delete availableEquipmentToUpdate._id;

            AvailableEquipments.update({_id: availableEquipmentId}, {$inc: {remainingQuantity: -1}});
          }
        }
      }
    }

    returnObject.status = "Done";

    var bookingLineItemId = bookingLineItem._id;
    delete bookingLineItem._id;

    BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItem});

    return returnObject;
  },
  minusSerialQuantityToBookingItem: function(details) {
    

    var returnObject = new Object();

    var invoiceId = details['_id'];
    var bookingLineItemId = details['bookingLineItemId'];
    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
    var itemId = bookingLineItem.itemId;
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
    var customer = Customers.findOne({_id: bookingCustomer.customerId});
    var dates = details['dates'];
    var serialNoRemoved = details['serialNoRemoved'];
    var serialNoArray = details['serialNoArray'];
    var dateTimeArray = [];
    var datesArray = [];
    var availableEquipments;
    var inventoryItem = Inventory.findOne({_id: itemId});
    var bookableSerialNumbers = [];
    var equipmentCalendars = [];
    var clashableSerialNumbers = [];
    var unclashableSerialNumbers = [];

    for(x in dates) {
      datesArray.push(moment(dates[x]).subtract(1,'days').format("DD MM YYYY"));
      dateTimeArray.push(moment(dates[x]).subtract(1,'days')._d);
    }

    // RETURN TO AVAILABLE EQUIPMENTS

    availableEquipments = AvailableEquipments.find({date: {$in: datesArray}, itemId: itemId}).fetch();

    for(x in availableEquipments) {
      var availableEquipmentId = availableEquipments[x]._id;
      delete availableEquipments[x]._id;

      AvailableEquipments.update({_id: availableEquipmentId}, {$inc: {remainingQuantity: 1}});
    }

    // AFFECT CURRENT BOOKING AND OTHER CLASHED BOOKINGS IF APPLICABLE
    // CHECK IF ITS CLASHABLE SERIAL NUMBER OR UNCLASHABLE SERIAL NUMBER

    bookingLineItem.booked -= 1;

    if(bookingLineItem.clash == false) {
      for(x in bookingLineItem.unclashableSerialNumbers) {
        if(bookingLineItem.unclashableSerialNumbers[x].serialNo == serialNoRemoved) {

          bookingLineItem.unclashableSerialNumbers.splice(x,1);
          break;
        }
      }
    } else {

      var clashCalendars = [];
      var clashBookings = [];
      var clashDates = [];
      var calendarsToDelete = [];

      for(x in bookingLineItem.unclashableSerialNumbers) {
        if(bookingLineItem.unclashableSerialNumbers[x].serialNo == serialNoRemoved) {

          bookingLineItem.unclashableSerialNumbers.splice(x,1);
          break;
        }
      }

      for(x in bookingLineItem.clashableSerialNumbers) {

        var currentBookingCalendars = bookingLineItem.clashableSerialNumbers[x].originalCalendars;

        if(bookingLineItem.clashableSerialNumbers[x].serialNo == serialNoRemoved) {

          

          for(y in bookingLineItem.clashableSerialNumbers[x].clashCalendars) {
            var clashCalendar = EquipmentCalendars.findOne({_id: bookingLineItem.clashableSerialNumbers[x].clashCalendars[y]});
            var clashBookingLineItem = BookingLineItems.findOne({_id: clashCalendar.bookingLineItemId});

            for(z in clashBookingLineItem.clashableSerialNumbers) {
              if(clashBookingLineItem.clashableSerialNumbers[z].serialNo == serialNoRemoved) {

                for(a in currentBookingCalendars) {
                  if(clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.indexOf(currentBookingCalendars[a]) != -1) {
                    clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.splice(clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.indexOf(currentBookingCalendars[a]), 1);
                  }
                }

                if(clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.length == 0) {
                  var unclashableObject = new Object();
                  unclashableObject.serialNo = serialNoRemoved;
                  unclashableObject.status = clashBookingLineItem.clashableSerialNumbers[z].status;
                  unclashableObject.itemId = clashBookingLineItem.itemId;
                  unclashableObject.groupId = clashBookingLineItem.groupCounter;

                  clashBookingLineItem.unclashableSerialNumbers.push(unclashableObject);
                  clashBookingLineItem.clashableSerialNumbers.splice(z,1);
                }

                if(clashBookingLineItem.clashableSerialNumbers.length == 0) {
                  clashBookingLineItem.clash = false;
                }

                var clashBookingLineItemId = clashBookingLineItem._id;

                delete clashBookingLineItem._id;
                BookingLineItems.update({_id: clashBookingLineItemId}, {$set: clashBookingLineItem});

                break;
              }
            }
          }

          bookingLineItem.clashableSerialNumbers.splice(x, 1);

          if(bookingLineItem.clashableSerialNumbers.length == 0) {
            bookingLineItem.clash = false;
          }

          break;
        }
      }
    }

    if(bookingLineItem.packageClicked == undefined) {
      bookingLineItem.originalPriced -= bookingLineItem.days;

      bookingLineItem.subAmount -= (bookingLineItem.rate * bookingLineItem.days);
    } else {
      var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});

      for(x in customerPackage.items) {
        if(customerPackage.items[x].id == itemId) {

          if(bookingLineItem.days > bookingLineItem.discountPriced) {
            customerPackage.items[x].quantity += bookingLineItem.discountPriced;
            bookingLineItem.originalPriced -= (bookingLineItem.days - bookingLineItem.discountPriced);
            bookingLineItem.discountPriced = 0;

            bookingLineItem.subAmount -= ((bookingLineItem.discountPriced * bookingLineItem.rate) + ((bookingLineItem.days - bookingLineItem.discountPriced) * (bookingLineItem.rate + bookingLineItem.discount)));
          } else {
            customerPackage.items[x].quantity += bookingLineItem.days;
            bookingLineItem.discountPriced -= bookingLineItem.days;

            bookingLineItem.subAmount -= (bookingLineItem.days * bookingLineItem.discount);
          }

          var customerPackageId = customerPackage._id;

          delete customerPackage._id;
          CustomerPackages.update({_id: customerPackageId}, {$set: customerPackage});

          break;
        }
      }
    }

    var bookingLineItemId = bookingLineItem._id;
    delete bookingLineItem._id;

    BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItem});

    if(bookingLineItem.booked == 0) {
      EquipmentCalendars.remove({dates: {$in: datesArray}, bookingLineItemId: bookingLineItemId, equipmentId: itemId});
    } else {
      var needToUpdateEquipmentCalendars = EquipmentCalendars.find({dates: {$in: datesArray}, bookingLineItemId: bookingLineItemId, equipmentId: itemId}).fetch();

      for(x in needToUpdateEquipmentCalendars) {
        needToUpdateEquipmentCalendars[x].booked -= 1;

        if(needToUpdateEquipmentCalendars[x].serialNumbers.indexOf(serialNoRemoved) != -1) {
          needToUpdateEquipmentCalendars[x].serialNumbers.splice(needToUpdateEquipmentCalendars[x].serialNumbers.indexOf(serialNoRemoved), 1);
        }

        var calId = needToUpdateEquipmentCalendars[x]._id;
        delete needToUpdateEquipmentCalendars[x]._id;
        EquipmentCalendars.update({_id: calId}, {$set: needToUpdateEquipmentCalendars[x]});
      }
    }

    returnObject.status = "Done";

    return returnObject;
  },
  changeQuantityToBookingItem: function(details) {



    var string = details['id'].split("_");
    var booking = Bookings.findOne({_id: details['_id']});

    var inventoryItem = Inventory.findOne({_id: string[1]});
    var availableSerialNumbers = [];
    var statuses = ["Sent For Repair", "Waiting To Be Sent For Repair", "Missing", "Damaged"];
    for(x in inventoryItem.serialNo) {
      if(!(statuses.indexOf(inventoryItem.serialNo[x].status) != -1)) {
        availableSerialNumbers.push(inventoryItem.serialNo[x].serialNo);
      }
    }

    var individualFormattedDates = [];

    var individualDates = booking.equipmentDetails[string[0]].dates;
    individualDates.unshift(moment(individualDates[0]).subtract(1, 'days')._d);
    individualDates.push(moment(individualDates[individualDates.length - 1]).add(1, 'days')._d);



    for(x in individualDates) {
      individualFormattedDates.push(moment(individualDates[x]).format("DD MM YYYY"));
    }

    var equipmentCalendars = EquipmentCalendars.find({dates: {$in: individualFormattedDates}}).fetch();

    var clashableSerialNumbers = [];
    var unclashableSerialNumbers = [];

    //we wanna find a list of serial numbers that are unclashable and those that are clashable made out of items in availableSerialNumbers
    for(x in availableSerialNumbers) {
      for(y in equipmentCalendars) {
        if(equipmentCalendars[y].serialNumbers.indexOf(availableSerialNumbers[x]) != -1) {
          clashableSerialNumbers.push(availableSerialNumbers[x]);
          availableSerialNumbers.splice(x, 1);
        }
      }
    }

    unclashableSerialNumbers = availableSerialNumbers;

    //delete all unclashable and clashable and add again

    for(x in booking.equipmentDetails[string[0]].items) {
      if(booking.equipmentDetails[string[0]].items[x].id == details["id"]) {
        if(booking.equipmentDetails[string[0]].items[x].packageClicked != undefined) { //there is a package
          var customerPackage = CustomerPackages.findOne({_id: booking.equipmentDetails[string[0]].items[x].packageClicked});

          //add everything back into customer package
          for(y in customerPackage.items) {
            if(customerPackage.items[y].id == booking.equipmentDetails[string[0]].items[x].itemId) {
              customerPackage.items[y].quantity = customerPackage.items[y].quantity + booking.equipmentDetails[string[0]].items[x].discountPriced;
              booking.equipmentDetails[string[0]].items[x].discountPriced = 0;
              booking.equipmentDetails[string[0]].items[x].originalPriced = 0;

              //subtract back
              if(customerPackage.items[y].quantity - (details['serialNoArray'].length * booking.equipmentDetails[string[0]].items[x].days) > 0) { //there is enough items in the customer package
                customerPackage.items[y].quantity = customerPackage.items[y].quantity - (details['serialNoArray'].length * booking.equipmentDetails[string[0]].items[x].days);
                booking.equipmentDetails[string[0]].items[x].discountPriced = details['serialNoArray'].length * booking.equipmentDetails[string[0]].items[x].days;
              } else {
                //not enough in customer package
                booking.equipmentDetails[string[0]].items[x].discountPriced = customerPackage.items[y].quantity;
                booking.equipmentDetails[string[0]].items[x].originalPriced = (details['serialNoArray'].length * booking.equipmentDetails[string[0]].items[x].days) - customerPackage.items[y].quantity;
                customerPackage.items[y].quantity = 0;
              }
            }
          }

          if(booking.equipmentDetails[string[0]].items[x].discountPriced > 0) {
            booking.customerPackagesUsed.push(string[0]+"_"+booking.equipmentDetails[string[0]].items[x].packageClicked);
          } else {
            for(c in booking.customerPackagesUsed) {
              if(booking.customerPackagesUsed[c] == string[0]+"_"+booking.equipmentDetails[string[0]].items[x].packageClicked) {
                booking.customerPackagesUsed.splice(c,1);
              }
            }
          }


          var exists = false;
          var exists2 = false;

          for(a in booking.customerPackagesUsed) {
            var string2 = booking.customerPackagesUsed[a].split("_");
            if(string2[1] == booking.equipmentDetails[string[0]].items[x].packageClicked) {
              exists = true;
            }
          }

          //we know that customer package is still being used

          if(!exists) {
            for(b in customerPackage.bookings) {
              if(customerPackage.bookings[b].id == details['_id']) {
                customerPackage.bookings.splice(b,1);
              }
            }
          } else {
            for(b in customerPackage.bookings) {
              if(customerPackage.bookings[b].id == details['_id']) {
                exists2 = true;
              }
            }
            if(exists2 == false) {
              var obj = new Object();
              obj.id = details['_id'];
              obj.noOfItems = booking.noOfItems;
              obj.total = booking.total;
              obj.createdAt = booking.createdAt;

              customerPackage.bookings.push(obj);
            }
          }


          delete customerPackage._id;
          CustomerPackages.update({_id: booking.equipmentDetails[string[0]].items[x].packageClicked}, {$set: customerPackage});
        } else { //there is no package
          booking.equipmentDetails[string[0]].items[x].originalPriced = details['serialNoArray'].length * booking.equipmentDetails[string[0]].items[x].days;
        }

        booking.equipmentDetails[string[0]].items[x].booked = details['serialNoArray'].length;
        booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers = [];
        booking.equipmentDetails[string[0]].items[x].unclashableSerialNumbers = [];

        for(y in clashableSerialNumbers) {
          for(z in details['serialNoArray']) {
            if(clashableSerialNumbers[y] == details['serialNoArray'][z].serialNo) {
              var obj = new Object();
              obj.serialNo = details['serialNoArray'][z].serialNo;
              obj.status = details['serialNoArray'][z].status;
              obj.groupId = string[0];
              obj.itemId = booking.equipmentDetails[string[0]].items[x].itemId;
              booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers.push(obj);
            }
          }
        }

        for(y in unclashableSerialNumbers) {
          for(z in details['serialNoArray']) {
            if(unclashableSerialNumbers[y] == details['serialNoArray'][z].serialNo) {
              var obj = new Object();
              obj.serialNo = details['serialNoArray'][z].serialNo;
              obj.status = details['serialNoArray'][z].status;
              obj.itemId = booking.equipmentDetails[string[0]].items[x].itemId;
              obj.groupId = string[0];
              booking.equipmentDetails[string[0]].items[x].unclashableSerialNumbers.push(obj);
            }
          }
        }

        if(booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers.length == 0) {
          booking.equipmentDetails[string[0]].items[x].clash = false;
        } else {
          booking.equipmentDetails[string[0]].items[x].clash = true;
        }

        break;
      }
    }

    var finalClash = false;
    for(s in booking.equipmentDetails) {
      for(d in booking.equipmentDetails[s].items) {
        if(booking.equipmentDetails[s].items[d].clash == true) {
          finalClash = true;
          break;
        }
      }
    }

    booking.clash = finalClash;

    delete booking._id;
    booking.equipmentDetails[string[0]].dates = details['dates'];
    Bookings.update({_id: details['_id']}, {$set: booking});
  },
  voidBooking: function(id) {

    EquipmentCalendars.remove({invoiceId: id});
    Calendars.remove({invoiceId: id});

    var bookingStatus = BookingStatuses.findOne({invoiceId: id});
    var bookingLineItems = BookingLineItems.find({invoiceId: id}).fetch();
    var customerId = BookingCustomers.findOne({invoiceId: id}).customerId;
    for(x in bookingLineItems) { //loop through equipment details to check whether an item has a package clicked
        if(bookingLineItems[x].packageClicked != undefined) { //there's a package
          var customerPackage = CustomerPackages.findOne({_id: bookingLineItems[x].packageClicked});
          for(z in customerPackage.items) {
            if(customerPackage.items[z].id == bookingLineItems[x].itemId) {
              customerPackage.items[z].quantity += bookingLineItems[x].discountPriced;
            }
          }

          for(z in customerPackage.bookings) {
            if(customerPackage.bookings[z].id == id) {
              customerPackage.bookings.splice(z,1);
            }
          }

          delete customerPackage._id;
          CustomerPackages.update({_id: bookingLineItems[x].packageClicked}, {$set: customerPackage});
        }

        var bookingGroup = BookingGroups.findOne({invoiceId: id, groupId: parseInt(bookingLineItems[x].groupCounter)});

        var datesArray = bookingGroup.dates;
        var availableEquipments = AvailableEquipments.find({dateTime: {$in: datesArray}}).fetch();
        for(z in availableEquipments) {
          var availableEquipmentId = availableEquipments[z]._id;
          AvailableEquipments.update({_id: availableEquipmentId}, {$inc: {remainingQuantity: bookingLineItems[x].booked}});
        }
    }

    // BookingStatuses.update({invoiceId: id}, {$set: {status: "Void"}});

    return "OK";
  },
  addQuantityToBookingItem: function(details) { //must check which serial numbers i can add first followed by the serial numbers that will result in a clash


    var string = details['id'].split("_");
    var booking = Bookings.findOne({_id: details['_id']});
    var totalEqualsBooked = false;
    var groupCounter = string[2];

    totalEqualsBooked = (booking.equipmentDetails[string[0]].items[string[2]].total == booking.equipmentDetails[string[0]].items[string[2]].booked);

    if(totalEqualsBooked) {
      return "totalEqualsBooked";
    }

    /**
    // THIS INDICATES THAT THE QUANTITY BOOKED HASN'T REACH THE TOTAL
    **/

    var datesArray = [];
    var ultimateStatus = true;
    var arrayToBeReturned = [];
    var arrayToBeReturnedDigits = [];
    var returnObject = new Object();
    returnObject.status = ultimateStatus;
    var inventoryItem = Inventory.findOne({_id: string[1]});
    var clashableSerialNumbers = [];
    var unclashableSerialNumbers = [];
    var equipmentCalendarStartDate;
    var equipmentCalendarEndDate;
    var equipmentCalendarDateArray = [];
    var equipmentCalendarMonthArray = [];
    var equipmentCalendarIdArray = [];
    var insertedEquipmentCalendarIdArray = [];
    var monthArray = [];
    var clashOrUnclash;
    var totalPaid = 0;
    var dateTimeArray = [];
    var clashDates = [];

    for(x in booking.equipmentDetails[string[0]].dates) {
      datesArray.push(moment(booking.equipmentDetails[string[0]].dates[x]).subtract(1, 'days').format("DD MM YYYY"));
      dateTimeArray.push(moment(booking.equipmentDetails[string[0]].dates[x])._d);
    }

    var availableEquipments = AvailableEquipments.find({itemId: string[1], date: {$in: datesArray}}, {sort: {dateTime: 1}}).fetch();


    for(x in availableEquipments) {
      if(availableEquipments[x].remainingQuantity == 0) {
        ultimateStatus = false;
        if(Meteor.absoluteUrl() == 'http://localhost:3000/') {
          arrayToBeReturned.push(moment(availableEquipments[x].dateTime).subtract(1,'days').format("Do MMMM YYYY"));
          arrayToBeReturnedDigits.push(availableEquipments[x].date);
        } else {
          arrayToBeReturned.push(moment(availableEquipments[x].dateTime).format("Do MMMM YYYY"));
          arrayToBeReturnedDigits.push(availableEquipments[x].date);
        }
      }
    }

    returnObject.status = ultimateStatus;
    returnObject.dates = arrayToBeReturned;
    returnObject.datesDigits = arrayToBeReturnedDigits;
    returnObject.inventoryItem = inventoryItem;

    returnObject.totalEqualsBooked = totalEqualsBooked;

    if(ultimateStatus == false) {
      return returnObject;
    }

    /**
    // THIS INDICATES THAT THE ITEM ISNT OVERBOOKED
    // NOW TO SUBTRACT THE QUANTITY FROM THE LIST
    **/

    for(x in datesArray) {
      var availableEquipment = AvailableEquipments.findOne({itemId: string[1], date: datesArray[x]});
      if(availableEquipment != undefined) {
        var availableEquipmentId = availableEquipment._id;
        delete availableEquipment._id;

        AvailableEquipments.update({_id: availableEquipmentId}, {$inc: {remainingQuantity: -1}});
      } else {
        var availableEquipmentAttributes = {
            date: datesArray[x],
            dateTime: dateTimeArray[x],
            itemId: string[1],
            remainingQuantity: parseInt(inventoryItem.bookableQuantity) - 1
        };
        AvailableEquipments.insert(availableEquipmentAttributes);
      }
    }

    var availableSerialNumbers = [];
    var statuses = ["Sent For Repair", "Missing", "Damaged"];
    for(x in inventoryItem.serialNo) {
      if(statuses.indexOf(inventoryItem.serialNo[x].status) == -1) {
        availableSerialNumbers.push(inventoryItem.serialNo[x].serialNo);
      }
    }

    var individualFormattedDates = [];
    var individualDates = booking.equipmentDetails[string[0]].dates;

    for(x in individualDates) {
      individualDates[x] = parseInt(moment(individualDates[x]).format("x"));
    }

    individualDates.sort();

    for(x in individualDates) {
      individualDates[x] = moment(individualDates[x]).subtract(1, "days")._d;
    }

    var dateArray = [];
    var dateArrayMoment = [];
    var counter = 0;
    var booked = 0;
    dateArray[counter] = [];
    monthArray[counter] = [];
    dateArrayMoment[counter] = [];

    //console.log(individualDates);

    for(x in individualDates) {
      if(dateArray[counter].length == 0) {
        dateArray[counter].push(moment(individualDates[x]).format('DD MM YYYY'));
        dateArrayMoment[counter].push(moment(individualDates[x]));
        if(monthArray[counter].indexOf(moment(individualDates[x]).format('MM YYYY')) == -1) {
          monthArray[counter].push(moment(individualDates[x]).format('MM YYYY'));
        }
      } else {
        var date2 = moment(individualDates[x]).subtract(1, 'days');

        if(date2.format('DD MM YYYY') == dateArray[counter][dateArray[counter].length - 1]) {
          dateArray[counter].push(moment(individualDates[x]).format('DD MM YYYY'));
          dateArrayMoment[counter].push(moment(individualDates[x]));
          if(monthArray[counter].indexOf(moment(individualDates[x]).format('MM YYYY')) == -1) {
            monthArray[counter].push(moment(individualDates[x]).format('MM YYYY'));
          }
        } else {
          counter += 1;
          dateArray[counter] = [];
          dateArray[counter].push(moment(individualDates[x]).format('DD MM YYYY'));

          dateArrayMoment[counter] = [];
          dateArrayMoment[counter].push(moment(individualDates[x]));

          monthArray[counter] = [];
          if(monthArray[counter].indexOf(moment(individualDates[x]).format('MM YYYY')) == -1) {
            monthArray[counter].push(moment(individualDates[x]).format('MM YYYY'));
          }
        }
      }
    }

    for(x in dateArrayMoment) {
      dateArray[x].unshift(moment(dateArrayMoment[x][0]).subtract(1, 'days').format('DD MM YYYY'));
      dateArray[x].push(moment(dateArrayMoment[x][dateArrayMoment[x].length - 1]).add(1, 'days').format('DD MM YYYY'));
      dateArrayMoment[x].unshift(moment(dateArrayMoment[x][0]).subtract(1, 'days'));
      dateArrayMoment[x].push(moment(dateArrayMoment[x][dateArrayMoment[x].length - 1]).add(1, 'days'));
      for(y in dateArrayMoment[x]) {
        individualFormattedDates.push(moment(dateArrayMoment[x][y]).format("DD MM YYYY"));
      }
    }

    var groupId = parseInt(string[0]);
    groupId = groupId + 1;
    groupId = details._id+"_"+groupId;

    // //, groupId: {$ne: parseInt(string[0])+1}
    var equipmentCalendars = EquipmentCalendars.find({equipmentId: string[1], dates: {$in: individualFormattedDates}}).fetch();



    // //we wanna find a list of serial numbers that are unclashable and those that are clashable made out of items in availableSerialNumbers
    for(x in availableSerialNumbers) {
      for(y in equipmentCalendars) {
        for(z in equipmentCalendars[y].serialNumbers) {
          if(availableSerialNumbers.indexOf(equipmentCalendars[y].serialNumbers[z]) != -1 && clashableSerialNumbers.indexOf(equipmentCalendars[y].serialNumbers[z]) == -1) {
            clashableSerialNumbers.push(equipmentCalendars[y].serialNumbers[z]);

            if(equipmentCalendarIdArray.indexOf(equipmentCalendars[y]._id) == -1) {
              equipmentCalendarIdArray.push(equipmentCalendars[y]._id);
            }
          }
        }

        // if(equipmentCalendarIdArray.indexOf(equipmentCalendars[y]._id) == -1) {
        //   equipmentCalendarIdArray.push(equipmentCalendars[y]._id);
        // }
      }
    }

    for(x in availableSerialNumbers) {
      if(clashableSerialNumbers.indexOf(availableSerialNumbers[x]) == -1) {
        unclashableSerialNumbers.push(availableSerialNumbers[x]);
      }
    }

    /**
    // ADD TO EQUIPMENT CALENDAR
    // MUST CHECK WHETHER THERE ARE AVAILABLE SERIAL NUMBERS FIRST. IF NOT SHOULDN'T GO HERE
    **/

    var update = false;
    var currentEquipmentCalendar;
    var currentEquipmentCalendarArray = [];
    var originalEquipmentCalendarArray = [];
    var clashEquipmentCalendarArray = [];
    var clashSerialNumbers = [];
    var serialNumber;
    var newEquipmentCalendarIdArray = [];
    var newInsertedEquipmentCalendarIdArray = [];

    if(EquipmentCalendars.findOne({invoiceId: details['_id'], equipmentId: string[1], groupId: groupId+"_"+groupCounter}) != undefined) {
      update = true;
      currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: details['_id'], equipmentId: string[1], groupId: groupId+"_"+groupCounter}).fetch();
    } else {
      update = false;
    }

    if(update) {
      for(x in dateArrayMoment) {
        var tempDateArrayMoment = dateArrayMoment[x];
        tempDateArrayMoment.pop();
        tempDateArrayMoment.shift();

        var tempDateArray = dateArray[x];
        tempDateArray.pop();
        tempDateArray.shift();

        var startDate = tempDateArrayMoment[0];
        var endDate = tempDateArrayMoment[tempDateArrayMoment.length - 1];

        if(tempDateArrayMoment.length > 1) {
          startDate = startDate.add(1,'days')._d;
          endDate = endDate.add(2,'days')._d;
        } else {
          startDate = startDate.add(1,'days')._d;
          endDate = endDate._d;
        }

        if(unclashableSerialNumbers.length > 0) {
          clashOrUnclash = "Unclash";
          for(f in unclashableSerialNumbers) {
            if(currentEquipmentCalendarArray[x].serialNumbers.indexOf(unclashableSerialNumbers[f]) == -1) {
              currentEquipmentCalendarArray[x].serialNumbers.push(unclashableSerialNumbers[f]);
              serialNumber = unclashableSerialNumbers[f];
              break;
            }
          }
        } else {
          clashOrUnclash = "Clash";
          for(f in clashableSerialNumbers) {
            if(currentEquipmentCalendarArray[x].serialNumbers.indexOf(clashableSerialNumbers[f]) == -1) {
              currentEquipmentCalendarArray[x].serialNumbers.push(clashableSerialNumbers[f]);
              serialNumber = clashableSerialNumbers[f];
              break;
            }
          }
        }

        equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

        currentEquipmentCalendarArray[x].startDate = new Date(startDate);
        currentEquipmentCalendarArray[x].endDate = new Date(endDate);
        currentEquipmentCalendarArray[x].invoiceId = details._id;
        currentEquipmentCalendarArray[x].title = booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item;
        currentEquipmentCalendarArray[x].customerName = booking.customerName;
        currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
        currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
        currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
        currentEquipmentCalendarArray[x].customerId = booking.customerId;
        currentEquipmentCalendarArray[x].groupId = groupId+"_"+groupCounter;
        currentEquipmentCalendarArray[x].url = "bookings/" + details._id;
        currentEquipmentCalendarArray[x].serialNumbers = currentEquipmentCalendarArray[x].serialNumbers;
        currentEquipmentCalendarArray[x].booked += 1;
        currentEquipmentCalendarArray[x].months = monthArray[x];
        currentEquipmentCalendarArray[x].dates = tempDateArray;

        delete currentEquipmentCalendarArray[x]._id;
        EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});

        if(insertedEquipmentCalendarIdArray.indexOf(equipmentCalendarId) == -1) {
          insertedEquipmentCalendarIdArray.push(equipmentCalendarId);
        }
      }
    } else {

      for(x in dateArrayMoment) {
        var tempDateArrayMoment = dateArrayMoment[x];
        tempDateArrayMoment.pop();
        tempDateArrayMoment.shift();

        var tempDateArray = dateArray[x];
        tempDateArray.pop();
        tempDateArray.shift();

        var startDate = tempDateArrayMoment[0];
        var endDate = tempDateArrayMoment[tempDateArrayMoment.length - 1];

        if(tempDateArrayMoment.length > 1) {
          startDate = startDate.add(1,'days')._d;
          endDate = endDate.add(2,'days')._d;
        } else {
          startDate = startDate.add(1,'days')._d;
          endDate = endDate._d;
        }

        var serialNumberArray = [];

        if(unclashableSerialNumbers.length > 0) {
          clashOrUnclash = "Unclash";
          serialNumber = unclashableSerialNumbers[0];
          serialNumberArray.push(serialNumber);
        } else {
          clashOrUnclash = "Clash";
          serialNumber = clashableSerialNumbers[0];
          serialNumberArray.push(serialNumber);
        }

        var string = groupId.split("_");


        var equipmentCalendarAttributes = {
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          invoiceId: details._id,
          title: booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item,
          customerName: booking.customerName,
          equipmentBrand: inventoryItem.brand,
          equipmentItem: inventoryItem.item,
          equipmentId: inventoryItem._id,
          type: booking.type,
          customerId: booking.customerId,
          groupId: groupId+"_"+groupCounter,
          group: parseInt(string[1]),
          url: "bookings/" + details._id,
          serialNumbers: serialNumberArray,
          booked: 1,
          months: monthArray[x],
          dates: tempDateArray
        };

        equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);

        if(insertedEquipmentCalendarIdArray.indexOf(equipmentCalendarId) == -1) {
          insertedEquipmentCalendarIdArray.push(equipmentCalendarId);
        }
      }
    }

    var string = details['id'].split("_");

    if(booking.equipmentDetails[string[0]].items[string[2]].packageClicked != undefined) { //there is a package
      var customerPackage = CustomerPackages.findOne({_id: booking.equipmentDetails[string[0]].items[string[2]].packageClicked});

      for(y in customerPackage.items) {
        if(customerPackage.items[y].id == booking.equipmentDetails[string[0]].items[string[2]].itemId) {
          //check whether customer package has enough items
          if(customerPackage.items[y].quantity - booking.equipmentDetails[string[0]].items[string[2]].days > 0) {
            booking.equipmentDetails[string[0]].items[string[2]].booked += 1;
            booking.equipmentDetails[string[0]].items[string[2]].discountPriced += booking.equipmentDetails[string[0]].items[string[2]].days;
            customerPackage.items[y].quantity -= booking.equipmentDetails[string[0]].items[string[2]].days;
          } else { //not enough in customer package
            booking.equipmentDetails[string[0]].items[string[2]].booked += 1;
            booking.equipmentDetails[string[0]].items[string[2]].discountPriced += customerPackage.items[y].quantity;
            booking.equipmentDetails[string[0]].items[string[2]].originalPriced += booking.equipmentDetails[string[0]].items[string[2]].days - customerPackage.items[y].quantity;
            customerPackage.items[y].quantity = 0;
          }
        }
      }

      // check whether booking need to add
      if(booking.equipmentDetails[string[0]].items[string[2]].discountPriced > 0 && booking.customerPackagesUsed.indexOf(string[0]+"_"+booking.equipmentDetails[string[0]].items[string[2]].packageClicked) == -1) {
        booking.customerPackagesUsed.push(string[0]+"_"+booking.equipmentDetails[string[0]].items[string[2]].packageClicked);
      }

      var exists = false;
      var exists2 = false;

      for(a in booking.customerPackagesUsed) {
        var string2 = booking.customerPackagesUsed[a].split("_");
        if(string2[1] == booking.equipmentDetails[string[0]].items[string[2]].packageClicked) {
          exists = true;
        }
      }

      //we know that customer package is still being used

      if(!exists) {
        for(b in customerPackage.bookings) {
          if(customerPackage.bookings[b].id == details['_id']) {
            customerPackage.bookings.splice(b,1);
          }
        }
      } else {
        for(b in customerPackage.bookings) {
          if(customerPackage.bookings[b].id == details['_id']) {
            exists2 = true;
          }
        }
        if(exists2 == false) {
          var obj = new Object();
          obj.id = details['_id'];
          obj.noOfItems = booking.noOfItems;
          obj.total = booking.total;
          obj.createdAt = booking.createdAt;

          customerPackage.bookings.push(obj);
        }
      }


      delete customerPackage._id;
      CustomerPackages.update({_id: booking.equipmentDetails[string[0]].items[string[2]].packageClicked}, {$set: customerPackage});
    } else { //no package
      booking.equipmentDetails[string[0]].items[string[2]].booked += 1;
      booking.equipmentDetails[string[0]].items[string[2]].originalPriced += booking.equipmentDetails[string[0]].items[string[2]].days;
    }

      var cumulatedSubAmount = 0;
      var cumulatedSubDiscount = 0;

      for(x in booking.equipmentDetails[string[0]].items) {
        if(booking.equipmentDetails[string[0]].items[x].total == -1) {
          cumulatedSubAmount += booking.equipmentDetails[string[0]].items[x].booked * booking.equipmentDetails[string[0]].items[x].rate * booking.equipmentDetails[string[0]].items[x].days;
          // cumulatedSubAmount += (booking.equipmentDetails[string[0]].items[x].subAmount + booking.equipmentDetails[string[0]].items[x].discountOverwrite);
          if(booking.equipmentDetails[string[0]].items[x].discountOverwrite != undefined) {
            cumulatedSubDiscount += booking.equipmentDetails[string[0]].items[x].discountOverwrite;
          }
        } else if(booking.equipmentDetails[string[0]].items[x].packageClicked == undefined) {
          cumulatedSubAmount += (((booking.equipmentDetails[string[0]].items[x].rate + booking.equipmentDetails[string[0]].items[x].discount) * booking.equipmentDetails[string[0]].items[x].originalPriced) + ((booking.equipmentDetails[string[0]].items[x].discount) * booking.equipmentDetails[string[0]].items[x].discountPriced));
          if(booking.equipmentDetails[string[0]].items[x].discountOverwrite != undefined) {
            cumulatedSubDiscount += booking.equipmentDetails[string[0]].items[x].discountOverwrite;
          }
        } else {
          cumulatedSubAmount += (booking.equipmentDetails[string[0]].items[x].discountPriced * booking.equipmentDetails[string[0]].items[x].rate) + (booking.equipmentDetails[string[0]].items[x].originalPriced * (booking.equipmentDetails[string[0]].items[x].rate + booking.equipmentDetails[string[0]].items[x].discount));

          if(booking.equipmentDetails[string[0]].items[x].discountOverwrite != undefined) {
            cumulatedSubDiscount += (booking.equipmentDetails[string[0]].items[x].discountPriced * booking.equipmentDetails[string[0]].items[x].rate);
          }
        }
      }
      booking.equipmentDetails[string[0]].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
       if(booking.equipmentDetails[string[0]].privilege != undefined) {
        booking.equipmentDetails[string[0]].privilege.value = parseFloat(booking.equipmentDetails[string[0]].subTotal * booking.equipmentDetails[string[0]].privilege.percentage / 100);
      booking.equipmentDetails[string[0]].subTotal -= booking.equipmentDetails[string[0]].privilege.value;
      }

      booking.equipmentDetails[string[0]].subDiscount = cumulatedSubDiscount;

      var total = 0;
      for(x in booking.equipmentDetails) {

        total += booking.equipmentDetails[x].subTotal;
      }

    booking.noOfItems += booking.equipmentDetails[string[0]].items[string[2]].booked;
    booking.gst = parseFloat(total * 0.07);
    booking.total = parseFloat(total + booking.gst);

    if(booking.payment.length != 0) {
      for(x in booking.payment) {
        totalPaid += parseFloat(booking.payment[x].amount);
      }

      booking.balanceDue = parseFloat(booking.total - totalPaid);
    } else {
      booking.balanceDue = parseFloat(booking.total);
    }

    for(x = (equipmentCalendarIdArray.length -1); x >= 0; x--) {
      if(insertedEquipmentCalendarIdArray.indexOf(equipmentCalendarIdArray[x]) != -1) {
        equipmentCalendarIdArray.splice(x, 1);
      }
    }

    newEquipmentCalendarIdArray = [];
    newInsertedEquipmentCalendarIdArray = [];
    var newDates = [];
    var newDateTimes = [];

    for(x in equipmentCalendars) {
        if(equipmentCalendars[x].serialNumbers.indexOf(serialNumber) != -1) {
          newEquipmentCalendarIdArray.push(equipmentCalendars[x]._id);

          var newCal = EquipmentCalendars.findOne({_id: equipmentCalendars[x]._id});

          for(y in newCal.dates) {
            if(newDates.indexOf(newCal.dates[y]) == -1) {
              newDates.push(newCal.dates[y]);
            }
          }
        }
    }


    for(x in insertedEquipmentCalendarIdArray) {
      var calId = EquipmentCalendars.findOne({_id: insertedEquipmentCalendarIdArray[x]});


      calId.dates.unshift(moment(calId.startDate).subtract(2, 'days').format("DD MM YYYY"));
      calId.dates.push(moment(calId.endDate).subtract(1, 'days').format("DD MM YYYY"));

      for(y in calId.dates) {
        if(newDates.indexOf(calId.dates[y]) != -1) {
          newInsertedEquipmentCalendarIdArray.push(calId._id);
          break;
        }
      }
    }

    if(newInsertedEquipmentCalendarIdArray.length == 0) {
      newInsertedEquipmentCalendarIdArray = insertedEquipmentCalendarIdArray;
    }
    if(clashOrUnclash == "Unclash") {
      var obj = new Object();
      obj.serialNo = serialNumber;
      obj.status = "N/A";
      obj.itemId = booking.equipmentDetails[string[0]].items[string[2]].itemId;
      obj.groupId = string[0];
      booking.equipmentDetails[string[0]].items[string[2]].unclashableSerialNumbers.push(obj);
    } else {
      var obj = new Object();
      obj.serialNo = serialNumber;
      obj.status = "N/A";
      obj.itemId = booking.equipmentDetails[string[0]].items[string[2]].itemId;
      obj.groupId = string[0];
      obj.clashCalendars = [];
      obj.clashCalendars = obj.clashCalendars.concat(newEquipmentCalendarIdArray);
      obj.originalCalendars = [];
      obj.originalCalendars = obj.originalCalendars.concat(newInsertedEquipmentCalendarIdArray);

      booking.equipmentDetails[string[0]].items[string[2]].clashableSerialNumbers = booking.equipmentDetails[string[0]].items[string[2]].clashableSerialNumbers.concat(obj);
      booking.equipmentDetails[string[0]].items[string[2]].clash = true;
    }

    var finalClash = false;
    for(s in booking.equipmentDetails) {
      for(d in booking.equipmentDetails[s].items) {
        if(booking.equipmentDetails[s].items[d].clash == true) {
          finalClash = true;
          break;
        }
      }
    }

    booking.clash = finalClash;

    booking.equipmentDetails[string[0]].dates = details['dates'];

    var packed = null;
          var returnValue = null;
          var collected = true;

          for(x in booking.equipmentDetails) {
            var nextDay = moment().add(1, 'days').format("DD MM YYYY");
            var currentDay = moment().format("DD MM YYYY");
            var previousDay = moment().subtract(1, 'days').format("DD MM YYYY");

            var previous10Days = [];
            for(d = 1; d <= 10; d++) {
              previous10Days.push(moment().subtract(d, 'days').format("DD MM YYYY"));
            }


            var datesToCheck = [];

            for(y in booking.equipmentDetails[x].dates) {
              datesToCheck.push(moment(booking.equipmentDetails[x].dates[y]).subtract(1, 'days').format("DD MM YYYY"));
            }

            if(datesToCheck.indexOf(nextDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
              
              // only has next day
              // good to go
              for(y in booking.equipmentDetails[x].items) {
                for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers.length > 0) {
                    if((packed == true || packed == null) && (booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Out")) {
                      packed = true;
                    } else {
                      packed = false;
                    }

                    if(collected == true && booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status != "Out") {
                      collected = false;
                    }
                  }
                }

                for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].clashableSerialNumbers.length > 0) {
                    if((packed == true || packed == null) && (booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Out")) {
                      packed = true;
                    } else {
                      packed = false;
                    }

                    if(collected == true && booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status != "Out") {
                      collected = false;
                    }
                  }
                }
              }
            }

            if(datesToCheck.indexOf(previousDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
              
              // only has next day
              // good to go
              for(y in booking.equipmentDetails[x].items) {
                for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers.length > 0) {


                    if((returnValue == true || returnValue == null) && (booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Missing")) {
                      
                      returnValue = true;
                    } else {

                      returnValue = false;
                    }
                  }
                }
                for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].clashableSerialNumbers.length > 0) {
                    if((returnValue == true || returnValue == null) && (booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Missing")) {
                      returnValue = true;
                    } else {
                      returnValue = false;
                    }
                  }
                }
              }
            }


          }

          booking.packed = packed;
          booking.return = returnValue;
          booking.collected = collected;


        

        var currentDay = moment();

        var yesterday = moment().subtract(1, 'days');

          var overdue = false;
          var unpaid = false;
          var uncollected = false;

          for(x in booking.equipmentDetails) {
            var datesToCheck = [];

            for(y in booking.equipmentDetails[x].dates) {
              datesToCheck.push(parseInt(moment(booking.equipmentDetails[x].dates[y]).subtract(1, 'days').format("x")));
            }

            datesToCheck.sort();

            for(y in datesToCheck) {
              datesToCheck[y] = moment(datesToCheck[y]);
            }

            var lastDay = datesToCheck[datesToCheck.length - 1];

            if(lastDay != undefined && lastDay.isBefore(currentDay)) {

              for(y in booking.equipmentDetails[x].items) {

                  for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Packed") {
                      uncollected = true;
                    }
                  }

                  for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Packed") {
                      uncollected = true;
                    }
                  }
              }

              if(booking.customerSignOut.length > 0  && parseInt(booking.balanceDue) > 0) {
                unpaid = true;
              }
            }

            if(lastDay != undefined && lastDay.isBefore(yesterday) && lastDay.format("DD MM YYYY") != yesterday.format("DD MM YYYY")) {
              for(y in booking.equipmentDetails[x].items) {
                if(overdue == false) {
                  for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Missing") {
                      overdue = true;
                    }
                  }

                  for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Missing") {
                      overdue = true;
                    }
                  }
                }
              }
            }


          }




          booking.overdue = overdue;
          booking.unpaid = unpaid;
          booking.uncollected = uncollected;

    delete booking._id;


    Bookings.update({_id: details['_id']}, {$set: booking});



    if(clashOrUnclash == "Clash") {
      for(x in equipmentCalendars) {
        if(equipmentCalendars[x].serialNumbers.indexOf(serialNumber) != -1) {
          var booking = Bookings.findOne({_id: equipmentCalendars[x].invoiceId});          var string = equipmentCalendars[x].groupId.split("_");
          var groupId = parseInt(string[1]) - 1;

          for(z in booking.equipmentDetails[groupId].items[string[2]].unclashableSerialNumbers) {
            if(booking.equipmentDetails[groupId].items[string[2]].unclashableSerialNumbers[z].serialNo == serialNumber) {
              var obj = new Object();
              obj.serialNo = serialNumber;
              obj.status = booking.equipmentDetails[groupId].items[string[2]].unclashableSerialNumbers[z].status;
              obj.clashCalendars = [];
              obj.clashCalendars = obj.clashCalendars.concat(newInsertedEquipmentCalendarIdArray);
              obj.originalCalendars = [];
              obj.originalCalendars = obj.originalCalendars.concat(newEquipmentCalendarIdArray);
              obj.groupId = booking.equipmentDetails[groupId].items[string[2]].unclashableSerialNumbers[z].groupId;
              obj.itemId = booking.equipmentDetails[groupId].items[string[2]].itemId;
              booking.equipmentDetails[groupId].items[string[2]].clashableSerialNumbers = booking.equipmentDetails[groupId].items[string[2]].clashableSerialNumbers.concat(obj);
              booking.equipmentDetails[groupId].items[string[2]].clash = true;

              booking.equipmentDetails[groupId].items[string[2]].unclashableSerialNumbers.splice(z, 1);

              var finalClash = false;
              for(s in booking.equipmentDetails) {
                for(d in booking.equipmentDetails[s].items) {
                  if(booking.equipmentDetails[s].items[d].clash == true) {
                    finalClash = true;
                    break;
                  }
                }
              }

              booking.clash = finalClash;

              delete booking._id;
              Bookings.update({_id: equipmentCalendars[x].invoiceId}, {$set: booking});

              break;
            }
          }
        }

      }
    }

    return "Done";
  },
  minusQuantityToBookingItem: function(details) {

    var string = details['id'].split("_");
    var booking = Bookings.findOne({_id: details['_id']});
    var datesArray = [];
    var itemCounter = string[2];
    var groupCounter = string[0];

    var minusNoMore = false;

    if(booking.equipmentDetails[groupCounter].items[itemCounter].booked == 0) {
      minusNoMore = true;
      return "minusNoMore";
    }

    for(x in booking.equipmentDetails[groupCounter].dates) {
      datesArray.push(moment(booking.equipmentDetails[groupCounter].dates[x]).subtract(1, 'days').format("DD MM YYYY"))
    }

    var availableEquipments = AvailableEquipments.find({itemId: string[1], date: {$in: datesArray}}).fetch();

    for(x in availableEquipments) {
      var availableEquipmentId = availableEquipments[x]._id;
      delete availableEquipments[x]._id;
      AvailableEquipments.update({_id: availableEquipmentId}, {$inc: {remainingQuantity: 1}});
    }

    booking.equipmentDetails[groupCounter].items[itemCounter].booked -= 1;

    /**
    // CHECK CLASHES AND IF THERE ARE
    // PUT IT BACK IN UNCLASHABLE VALUE
    **/

    var clashableObject;



    if(booking.equipmentDetails[groupCounter].items[itemCounter].clashableSerialNumbers.length != 0) {
      clashableObject = booking.equipmentDetails[groupCounter].items[itemCounter].clashableSerialNumbers.pop();

      for(b in clashableObject.clashCalendars) {

        var equipmentCalendarClash = EquipmentCalendars.findOne({_id: clashableObject.clashCalendars[b]});



        var groupId4 = equipmentCalendarClash.groupId.split("_");
        var groupCounter4 = parseInt(groupId4[1]-1);
        var itemCounter4 = parseInt(groupId4[2]);
        var booking4 = Bookings.findOne({_id: equipmentCalendarClash.invoiceId});

        for(c in booking4.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers) {

          if(booking4.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers[c].serialNo == clashableObject.serialNo) {
            var obj = new Object();
            obj.serialNo = booking4.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers[c].serialNo;
            obj.status = booking4.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers[c].status;
            obj.itemId = booking4.equipmentDetails[groupCounter4].items[itemCounter4].itemId;
            obj.groupId = groupCounter4;

            if(booking4._id != booking._id) {
              booking4.equipmentDetails[groupCounter4].items[itemCounter4].unclashableSerialNumbers.push(obj);
              booking4.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers.splice(c, 1);
              if(booking4.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers.length == 0)
                booking4.equipmentDetails[groupCounter4].items[itemCounter4].clash = false;

              var finalClash = false;
              for(s in booking4.equipmentDetails) {
                for(d in booking4.equipmentDetails[s].items) {
                  if(booking4.equipmentDetails[s].items[d].clash == true) {
                    finalClash = true;
                    break;
                  }
                }
              }

              booking4.clash = finalClash;

              delete booking4._id;

              Bookings.update({_id: equipmentCalendarClash.invoiceId}, {$set: booking4});

              break;
            } else {


              //booking.equipmentDetails[groupCounter].items[itemCounter].unclashableSerialNumbers.push(obj);
              booking.equipmentDetails[groupCounter].items[itemCounter].clashableSerialNumbers.splice(c, 1);

             if(booking.equipmentDetails[groupCounter].items[itemCounter].clashableSerialNumbers.length == 0)
                booking.equipmentDetails[groupCounter].items[itemCounter].clash = false;

              booking.equipmentDetails[groupCounter4].items[itemCounter4].unclashableSerialNumbers.push(obj);
              booking.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers.splice(c, 1);
              if(booking.equipmentDetails[groupCounter4].items[itemCounter4].clashableSerialNumbers.length == 0)
                booking.equipmentDetails[groupCounter4].items[itemCounter4].clash = false;


            }
          }
        }
      }
      if(booking.equipmentDetails[groupCounter].items[itemCounter].clashableSerialNumbers.length == 0 && booking.equipmentDetails[groupCounter].items[itemCounter].clash != "false") {
        booking.equipmentDetails[groupCounter].items[itemCounter].clash = false;
      }
    } else {
      booking.equipmentDetails[groupCounter].items[itemCounter].unclashableSerialNumbers.pop();
    }



    /**
    // CUSTOMER PACKAGES
    **/

    if(booking.equipmentDetails[groupCounter].items[itemCounter].packageClicked != undefined) {
      if(booking.equipmentDetails[groupCounter].items[itemCounter].discountPriced > 0) {
        var customerPackage = CustomerPackages.findOne({_id: booking.equipmentDetails[groupCounter].items[itemCounter].packageClicked});

        for(c in customerPackage.items) {
          if(customerPackage.items[c].id == string[1]) {
            // CHECK HOW MANY I NEED TO ADD BACK TO CUSTOMER PACKAGE

            // WILL HAVE EXTRA DISCOUNTED
            if(booking.equipmentDetails[groupCounter].items[itemCounter].discountPriced > booking.equipmentDetails[groupCounter].items[itemCounter].days) {
              // SUBTRACT DAYS
              booking.equipmentDetails[groupCounter].items[itemCounter].discountPriced -= booking.equipmentDetails[groupCounter].items[itemCounter].days;
              customerPackage.items[c].quantity += booking.equipmentDetails[groupCounter].items[itemCounter].days;

            } else {
              // SUBTRACT WHATEVER DISCOUNT PRICED
              customerPackage.items[c].quantity += booking.equipmentDetails[groupCounter].items[itemCounter].discountPriced;
              booking.equipmentDetails[groupCounter].items[itemCounter].originalPriced = booking.equipmentDetails[groupCounter].items[itemCounter].days - booking.equipmentDetails[groupCounter].items[itemCounter].discountPriced;
              booking.equipmentDetails[groupCounter].items[itemCounter].discountPriced = 0;
            }

            break;
          }
        }

        delete customerPackage._id;
        CustomerPackages.update({_id: booking.equipmentDetails[groupCounter].items[itemCounter].packageClicked}, {$set: customerPackage});
      } else if(booking.equipmentDetails[groupCounter].items[itemCounter].originalPriced > 0){
        booking.equipmentDetails[groupCounter].items[itemCounter].originalPriced -= booking.equipmentDetails[groupCounter].items[itemCounter].days;
      }
    } else {
      booking.equipmentDetails[groupCounter].items[itemCounter].originalPriced -= booking.equipmentDetails[groupCounter].items[itemCounter].days;
    }

    /**
    // UPDATE PRICE
    **/


    var cumulatedSubAmount = 0;
      var cumulatedSubDiscount = 0;

      for(x in booking.equipmentDetails[groupCounter].items) {
        if(booking.equipmentDetails[groupCounter].items[x].total == -1) {
          cumulatedSubAmount += booking.equipmentDetails[groupCounter].items[x].booked * booking.equipmentDetails[groupCounter].items[x].rate * booking.equipmentDetails[groupCounter].items[x].days;
          // cumulatedSubAmount += booking.equipmentDetails[groupCounter].items[x].subAmount;
          if(booking.equipmentDetails[groupCounter].items[x].discountOverwrite != undefined) {
            cumulatedSubDiscount += booking.equipmentDetails[groupCounter].items[x].discountOverwrite;
          }
        } else if(booking.equipmentDetails[groupCounter].items[x].packageClicked == undefined) {
          cumulatedSubAmount += (((booking.equipmentDetails[groupCounter].items[x].rate + booking.equipmentDetails[groupCounter].items[x].discount) * booking.equipmentDetails[groupCounter].items[x].originalPriced) + ((booking.equipmentDetails[groupCounter].items[x].discount) * booking.equipmentDetails[groupCounter].items[x].discountPriced));
          if(booking.equipmentDetails[groupCounter].items[x].discountOverwrite != undefined) {
            cumulatedSubDiscount += booking.equipmentDetails[groupCounter].items[x].discountOverwrite;
          }
        } else {
          cumulatedSubAmount += (booking.equipmentDetails[groupCounter].items[x].discountPriced * booking.equipmentDetails[groupCounter].items[x].rate) + (booking.equipmentDetails[groupCounter].items[x].originalPriced * (booking.equipmentDetails[groupCounter].items[x].rate + booking.equipmentDetails[groupCounter].items[x].discount));
          cumulatedSubDiscount += (booking.equipmentDetails[groupCounter].items[x].discountPriced * booking.equipmentDetails[groupCounter].items[x].rate)
        }
      }

      booking.equipmentDetails[groupCounter].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
      if(booking.equipmentDetails[groupCounter].privilege != undefined) {
        booking.equipmentDetails[groupCounter].privilege.value = parseFloat(booking.equipmentDetails[groupCounter].subTotal * booking.equipmentDetails[groupCounter].privilege.percentage / 100);
booking.equipmentDetails[groupCounter].subTotal -= booking.equipmentDetails[groupCounter].privilege.value;
      }
booking.equipmentDetails[groupCounter].subDiscount = cumulatedSubDiscount;

      var total = 0;
      for(x in booking.equipmentDetails) {
        total += booking.equipmentDetails[x].subTotal;
      }

    booking.noOfItems += booking.equipmentDetails[groupCounter].items[itemCounter].booked;
    booking.gst = parseFloat(total * 0.07);
    booking.total = parseFloat(total + booking.gst);

    var totalPaid = 0;
    if(booking.payment.length != 0) {
      for(x in booking.payment) {
        totalPaid += parseFloat(booking.payment[x].amount);
      }

      booking.balanceDue = parseFloat(booking.total - totalPaid);
    } else {
      booking.balanceDue = parseFloat(booking.total);
    }

    var finalClash = false;
    for(s in booking.equipmentDetails) {
      for(d in booking.equipmentDetails[s].items) {
        if(booking.equipmentDetails[s].items[d].clash == true) {
          finalClash = true;
          break;
        }
      }
    }

    booking.clash = finalClash;

    var packed = null;
          var returnValue = null;
          var collected = true;

          for(x in booking.equipmentDetails) {
            var nextDay = moment().add(1, 'days').format("DD MM YYYY");
            var currentDay = moment().format("DD MM YYYY");
            var previousDay = moment().subtract(1, 'days').format("DD MM YYYY");

            var previous10Days = [];
            for(d = 1; d <= 10; d++) {
              previous10Days.push(moment().subtract(d, 'days').format("DD MM YYYY"));
            }


            var datesToCheck = [];

            for(y in booking.equipmentDetails[x].dates) {
              datesToCheck.push(moment(booking.equipmentDetails[x].dates[y]).subtract(1, 'days').format("DD MM YYYY"));
            }

            if(datesToCheck.indexOf(nextDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
              // only has next day
              // good to go
              for(y in booking.equipmentDetails[x].items) {
                for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers.length > 0) {
                    if((packed == true || packed == null) && (booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Out")) {
                      packed = true;
                    } else {
                      packed = false;
                    }

                    if(collected == true && booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status != "Out") {
                      collected = false;
                    }
                  }
                }

                for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].clashableSerialNumbers.length > 0) {
                    if((packed == true || packed == null) && (booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Out")) {
                      packed = true;
                    } else {
                      packed = false;
                    }

                    if(collected == true && booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status != "Out") {
                      collected = false;
                    }
                  }
                }
              }
            }

            if(datesToCheck.indexOf(previousDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
              

              // only has next day
              // good to go
              for(y in booking.equipmentDetails[x].items) {
                for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers.length > 0) {


                    if((returnValue == true || returnValue == null) && (booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Missing")) {
                      
                      returnValue = true;
                    } else {

                      returnValue = false;
                    }
                  }
                }
                for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                  if(booking.equipmentDetails[x].items[y].clashableSerialNumbers.length > 0) {
                    if((returnValue == true || returnValue == null) && (booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Packed" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Missing")) {
                      returnValue = true;
                    } else {
                      returnValue = false;
                    }
                  }
                }
              }
            }


          }

          booking.packed = packed;
          booking.return = returnValue;
          booking.collected = collected;


        

        var currentDay = moment();

        var yesterday = moment().subtract(1, 'days');




          var overdue = false;
          var unpaid = false;
          var uncollected = false;

          for(x in booking.equipmentDetails) {
            var datesToCheck = [];

            for(y in booking.equipmentDetails[x].dates) {
              datesToCheck.push(parseInt(moment(booking.equipmentDetails[x].dates[y]).subtract(1, 'days').format("x")));
            }

            datesToCheck.sort();

            for(y in datesToCheck) {
              datesToCheck[y] = moment(datesToCheck[y]);
            }

            var lastDay = datesToCheck[datesToCheck.length - 1];

            if(lastDay != undefined && lastDay.isBefore(currentDay)) {

              for(y in booking.equipmentDetails[x].items) {

                  for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Packed") {
                      uncollected = true;
                    }
                  }

                  for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "N/A" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Packed") {
                      uncollected = true;
                    }
                  }
              }

              if(booking.customerSignOut.length > 0  && parseInt(booking.balanceDue) > 0) {
                unpaid = true;
              }
            }

            if(lastDay != undefined && lastDay.isBefore(yesterday) && lastDay.format("DD MM YYYY") != yesterday.format("DD MM YYYY")) {
              for(y in booking.equipmentDetails[x].items) {
                if(overdue == false) {
                  for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].status == "Missing") {
                      overdue = true;
                    }
                  }

                  for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
                    if(booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Out" || booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].status == "Missing") {
                      overdue = true;
                    }
                  }
                }
              }
            }


          }




          booking.overdue = overdue;
          booking.unpaid = unpaid;
          booking.uncollected = uncollected;

          var bookingId = booking._id;

          delete booking._id;
          Bookings.update({_id: bookingId}, {$set: booking});


    Bookings.update({_id: details['_id']}, {$set: booking});

    /**
    // AFFECT CALENDAR
    **/
    groupCounter = parseInt(groupCounter) + 1;

    var currentEquipmentCalendarArray = [];

    currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: details['_id'], equipmentId: string[1], groupId: details['_id']+"_"+groupCounter+"_"+itemCounter}).fetch();

    var inventoryItem = Inventory.findOne({_id: string[1]});
    var serialNumbersArray = [];
    var booked = booking.equipmentDetails[string[0]].items[itemCounter].booked;

    for(z in booking.equipmentDetails[string[0]].items[itemCounter].unclashableSerialNumbers) {
      serialNumbersArray.push(booking.equipmentDetails[string[0]].items[itemCounter].unclashableSerialNumbers[z].serialNo);
    }
    for(z in booking.equipmentDetails[string[0]].items[itemCounter].clashableSerialNumbers) {
      serialNumbersArray.push(booking.equipmentDetails[string[0]].items[itemCounter].clashableSerialNumbers[z].serialNo);
    }

    if(booked != 0) {
      var dateArray = [];
      var dateArrayMoment = [];
      var counter = 0;
      dateArray[counter] = [];
      dateArrayMoment[counter] = [];

      for(x in details.dates) {
        details.dates[x] = parseInt(moment(details.dates[x]).format('x'));
      }

      details.dates.sort();

      for(x in details.dates) {
        details.dates[x] = moment(details.dates[x]).subtract(1, 'days')._d;
      }

      for(x in details.dates) {
        if(dateArray[counter].length == 0) {
          dateArray[counter].push(moment(details.dates[x]).format('DD MM YYYY'));
          dateArrayMoment[counter].push(moment(details.dates[x]));
        } else {
          var date2 = moment(details.dates[x]).subtract(1, 'days');

          if(date2.format('DD MM YYYY') == dateArray[counter][dateArray[counter].length - 1]) {
            dateArray[counter].push(moment(details.dates[x]).format('DD MM YYYY'));
            dateArrayMoment[counter].push(moment(details.dates[x]));
          } else {
            counter += 1;
            dateArray[counter] = [];
            dateArray[counter].push(moment(details.dates[x]).format('DD MM YYYY'));
            dateArrayMoment[counter] = [];
            dateArrayMoment[counter].push(moment(details.dates[x]));
          }

        }
      }

      for(x in dateArrayMoment) {
        var monthArray = [];

        var startMonth = dateArrayMoment[x][0].format('MM YYYY');
        var endMonth = dateArrayMoment[x][dateArrayMoment[x].length - 1].format('MM YYYY');

        var startString = startMonth.split(" ");
        var endString = endMonth.split(" ");

        if(startString[0] > endString[0]) {
          //means go to next year
          for(r = startString[0]; r <= 12; r++) {
            monthArray.push(r + " " + startString[1]);
          }
          for(r = 1; r <= endString[0]; r++) {
            monthArray.push(r + " " + endString[1]);
          }
        } else {
          for(r = startString[0]; r <= endString[0]; r++) {
            monthArray.push(r + " " + startString[1]);
          }
        }

        equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

        if(dateArrayMoment[x].length == 1) {
          currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
          currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(1, "days"));
        } else {
          currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
          currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(2, "days"));
        }

        currentEquipmentCalendarArray[x].invoiceId = details._id;
        currentEquipmentCalendarArray[x].title = booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item;
        currentEquipmentCalendarArray[x].customerName = booking.customerName;
        currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
        currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
        currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
        currentEquipmentCalendarArray[x].customerId = booking.customerId;
        currentEquipmentCalendarArray[x].groupId = details._id + "_" + groupCounter + "_" + itemCounter;
        currentEquipmentCalendarArray[x].url = "bookings/" + details._id;
        currentEquipmentCalendarArray[x].serialNumbers = serialNumbersArray;
        currentEquipmentCalendarArray[x].booked = booked;
        currentEquipmentCalendarArray[x].months = monthArray;
        currentEquipmentCalendarArray[x].dates = dateArray[x];

        delete currentEquipmentCalendarArray[x]._id;
        EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});
      }
    } else {
      EquipmentCalendars.remove({invoiceId: details['_id'], equipmentId: string[1], groupId: details['_id']+"_"+groupCounter+"_"+itemCounter});
    }

    return "Done";
  },
  deleteBookingDatesFromGroup: function(details) {

    

    var groupId = parseInt(details['id']);
    var invoiceId = details['_id'];
    var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupId}).fetch();
    var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupId});
    var customer = Customers.findOne({_id: bookingCustomer.customerId});
    var originalDates = details['originalDates'];
    var removedDates = details['removedDates'];
    var updatedDates = details['updatedDates'];

    var allDates = details['updatedDates'];

    var totalDatesToPut = [];

    for(x in allDates) {
      allDates[x] = new Date(moment(allDates[x]).add(1, 'days'));
    }

    var removedDateDigitArray = [];
    var sideAddedRemovedDateDigitArray = [];
    var availableEquipments;

    /**
    // AFFECT AVAILABLE EQUIPMENTS
    **/
    for(x in removedDates) {
      removedDateDigitArray.push(moment(removedDates[x]).format("DD MM YYYY"));
    }

    

    sideAddedRemovedDateDigitArray.unshift(moment(details['removedDates'][0]).subtract(1, 'days').format("DD MM YYYY"));
    sideAddedRemovedDateDigitArray.push(moment(details['removedDates'][x]).add(1, 'days').format("DD MM YYYY"));

    

    for(t in bookingLineItems) {
      
      /**
      // AFFECT EQUIPMENT CALENDARS
      // AFFECT CLASHABLE UNCLASHABLE?
      **/

      // check whether there are any clashcalenders for current item
      var calendarRemoved;
      if(bookingLineItems[t].total != -1) {
        calendarRemoved = EquipmentCalendars.findOne({dates:{$in: removedDateDigitArray}, equipmentId: bookingLineItems[t].itemId, invoiceId: invoiceId, bookingLineItemId: bookingLineItems[t]._id});

        var clashCalendarsToCheck = [];
        if(bookingLineItems[t].clashableSerialNumbers.length > 0) {
          for(y in bookingLineItems[t].clashableSerialNumbers) {
            for(z in bookingLineItems[t].clashableSerialNumbers[y].clashCalendars) {
              if(clashCalendarsToCheck.indexOf(bookingLineItems[t].clashableSerialNumbers[y].clashCalendars[z]) == -1) {
                clashCalendarsToCheck.push(bookingLineItems[t].clashableSerialNumbers[y].clashCalendars[z]);
              }
            }
          }
          

          for(e = (clashCalendarsToCheck.length -1); e >= 0; e--) {
            var clashCalendar = EquipmentCalendars.findOne({_id: clashCalendarsToCheck[e]});


            if(clashCalendar != undefined) {
              var clashBookingLineItem = BookingLineItems.findOne({_id: clashCalendar.bookingLineItemId});
              for(z = (clashBookingLineItem.clashableSerialNumbers.length -1); z >= 0; z--) {
                
                if(calendarRemoved != undefined) {
                  if(clashBookingLineItem.clashableSerialNumbers[z] != undefined && clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.indexOf(calendarRemoved._id) != -1) {
                    clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.splice(clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.indexOf(calendarRemoved._id), 1);



                    if(clashBookingLineItem.clashableSerialNumbers[z].clashCalendars.length == 0) {
                      // change to unclashable
                      var obj = new Object();
                      obj.serialNo = clashBookingLineItem.clashableSerialNumbers[z].serialNo;
                      obj.status = clashBookingLineItem.clashableSerialNumbers[z].status;
                      obj.itemId = clashBookingLineItem.itemId;
                      obj.groupId = clashBookingLineItem.groupId;


                      clashBookingLineItem.unclashableSerialNumbers.push(obj);
                      clashBookingLineItem.clashableSerialNumbers.splice(z,1);
                    }

                    if(clashBookingLineItem.clashableSerialNumbers.length == 0) {
                      clashBookingLineItem.clash = false;
                    }

                    delete clashBookingLineItem._id;

                    

                    BookingLineItems.update({_id: clashCalendar.bookingLineItemId}, {$set: clashBookingLineItem});

                    Meteor.call("updateBookingStatus", clashBookingLineItem.invoiceId);
                  }

                }
              }

            }
          }
        }
      } else {
        calendarRemoved = EquipmentCalendars.findOne({dates:{$in: removedDateDigitArray}, equipmentId: bookingLineItems[t].itemId, invoiceId: invoiceId, bookingLineItemId: bookingLineItems[t]._id});
      }

      if(calendarRemoved != undefined) {
        EquipmentCalendars.remove({_id: calendarRemoved._id});
      }

      /**
      // AFFECT BOOKING LINE ITEM
      **/

      var clashCalendarsToCheck = [];
      if(bookingLineItems[t].clashableSerialNumbers.length > 0) {
        for(y = (bookingLineItems[t].clashableSerialNumbers.length -1); y >= 0; y--) {
          if(calendarRemoved != undefined) {
            if(bookingLineItems[t].clashableSerialNumbers[y].originalCalendars.indexOf(calendarRemoved._id) != -1) {
              bookingLineItems[t].clashableSerialNumbers[y].originalCalendars.splice(bookingLineItems[t].clashableSerialNumbers[y].originalCalendars.indexOf(calendarRemoved._id), 1);

              if(bookingLineItems[t].clashableSerialNumbers[y].originalCalendars.length == 0) {
                //change to unclashable
                var obj = new Object();
                obj.serialNo = bookingLineItems[t].clashableSerialNumbers[y].serialNo;
                obj.status = bookingLineItems[t].clashableSerialNumbers[y].status;
                obj.itemId = bookingLineItems[t].itemId;
                obj.groupId = bookingLineItems[t].clashableSerialNumbers[y].groupId;



                bookingLineItems[t].unclashableSerialNumbers.push(obj);
                bookingLineItems[t].clashableSerialNumbers.splice(y,1);
              }
            }

          }
        }

        if(bookingLineItems[t].clashableSerialNumbers.length == 0) {
          bookingLineItems[t].clash = false;
        }
      }

      /**
      // AFFECT CUSTOMER PACKAGE
      **/
        bookingLineItems[t].days = details['updatedDates'].length;
        bookingLineItems[t].originalPriced = bookingLineItems[t].booked * bookingLineItems[t].days;

        bookingLineItems[t].subAmount = bookingLineItems[t].originalPriced * bookingLineItems[t].rate;

        var bookingLineItemToUpdateId = bookingLineItems[t]._id;

        delete bookingLineItems[t]._id;
        BookingLineItems.update({_id: bookingLineItemToUpdateId}, {$set: bookingLineItems[t]});
      
    }

    bookingGroup.dates = [];

    if(details['updatedDates'].length > 0) {
      for(x in details['updatedDates']) {
        bookingGroup.dates.push(moment(details['updatedDates'][x])._d);
      }
    }

    bookingGroup.noOfDates = details['updatedDates'].length;

    var bookingGroupId = bookingGroup._id;

    delete bookingGroup._id;
    BookingGroups.update({_id: bookingGroupId}, {$set: bookingGroup});

    var bookingGroups = BookingGroups.find({invoiceId: invoiceId}).fetch();
    for(x in bookingGroups) {
      for(y in bookingGroups[x].dates) {
        var dateToPut = moment(bookingGroups[x].dates[y]).subtract(1, 'days').format("DD MM YYYY");
        if(totalDatesToPut.indexOf(dateToPut) == -1) {
          totalDatesToPut.push(dateToPut);
        }
      }
    }

    // UPDATE DISPLAY DATES

    var arrayOfDateArrays = [];
    var counter = 0;
    var arrayOfObjects = [];

    var allBookingGroups = BookingGroups.find({invoiceId: invoiceId}).fetch();

    for(x in allBookingGroups) {
      arrayOfDateArrays = [];
      arrayOfDateArrays[counter] = [];

      var obj = new Object();
      obj.id = allBookingGroups[x].groupId;
      if(allBookingGroups[x].dates != undefined) {
        if(allBookingGroups[x].dates.length >0) {

          for(y in allBookingGroups[x].dates) {
            allBookingGroups[x].dates[y] = parseInt(moment(allBookingGroups[x].dates[y]).format("x"));
          }

            allBookingGroups[x].dates.sort();

          for(y in allBookingGroups[x].dates) {
            allBookingGroups[x].dates[y] = new Date(allBookingGroups[x].dates[y]);
          }

          for(y in allBookingGroups[x].dates) {
            var date = moment(allBookingGroups[x].dates[y]);

            if(arrayOfDateArrays[counter].length == 0) {
              var date2 = date.subtract(1, 'days');
              arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
            } else {

              var date2 = date.subtract(1, 'days');

              if(moment(allBookingGroups[x].dates[parseInt(y-1)]).diff(date2) == 0) {

                arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
              } else {
                counter = counter + 1;
                arrayOfDateArrays[counter] = [];
                arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
              }
            }
          }

          obj.dateArray = arrayOfDateArrays;
          arrayOfObjects.push(obj);
        }
      }
    }

    bookingStatus.displayDates = arrayOfObjects;
    bookingStatus.totalDates = totalDatesToPut;

    var bookingStatusId = bookingStatus._id;

    delete bookingStatus._id;
    
    BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

    var usageCalendarId = Calendars.findOne({dates: {$in: removedDateDigitArray}, groupId: groupId, invoiceId: invoiceId});
    if(usageCalendarId != undefined) {
      Calendars.remove({_id: usageCalendarId._id});
      Calendars.remove({usageCalendar: usageCalendarId._id});
    }
  },
  addBookingDatesToGroup: function(details) {
    

    var groupId = parseInt(details['id']);
    var invoiceId = details['_id'];
    var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupId, itemId: {$ne: -1}}).fetch();
    var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupId});
    var customer = Customers.findOne({_id: bookingCustomer.customerId});
    var allDates = details['dates'];

    if(details['addedDates'].length > 0) {
      var bookingOverbooked = BookingOverbooked.findOne({invoiceId: details['_id']});

      bookingOverbooked.status = "Checking Overbooked";

      var boid = bookingOverbooked._id;
      delete bookingOverbooked._id;
      BookingOverbooked.update({_id: boid}, {$set: bookingOverbooked});

      var dateArray = [];
      var dateDigitArray = [];
      var dateMomentArray = [];
      var calendarDateMomentArray = [];
      var addedDateDigitArray = [];
      var arrayToBeReturned = [];
      var arrayToBeReturnedDigits = [];
      var availableEquipments = [];
      var itemToCheckArray = [];
      var monthArray = [];
      var itemArray2 = [];
      var overbookedResult = new Object();
      var inventoryItemIds = [];
      var equipmentCalendarDates = [];
      var replacementSerialNumbers = [];

      for(x in bookingLineItems) {
        itemToCheckArray[bookingLineItems[x].itemId] = bookingLineItems[x].booked;
        itemArray2.push(bookingLineItems[x].itemId);
      }

      for(x in details.addedDates) {
        var dateMoment = moment(details.addedDates[x]);
        dateArray[x] = dateMoment._d;
        dateDigitArray[x] = dateMoment.format("DD MM YYYY");
        dateMomentArray[x] = dateMoment;
        calendarDateMomentArray[x] = dateMoment;
        addedDateDigitArray[x] = dateMoment.format("DD MM YYYY");
      }

      // TO SOLELY CHECK OVERBOOKING

      for(x in dateDigitArray) {
        for(y in bookingLineItems) {
          var itemIdToMinus = bookingLineItems[y].itemId;
          var quantityToMinus = 0;
          var datesToMinus = [];
          datesToMinus.push(dateDigitArray[x]);

          var equipmentCalendarsToMinus = EquipmentCalendars.find({equipmentId: itemIdToMinus, dates: {$in: datesToMinus}}, {fields:{booked: 1}}).fetch();
          for(y in equipmentCalendarsToMinus) {
            quantityToMinus += equipmentCalendarsToMinus[y].booked;
          }

          var inventoryItemToMinus = Inventory.findOne({_id: itemIdToMinus});

          if(inventoryItemToMinus != undefined) {
            var avail = new Object();
            avail.date = dateDigitArray[x];
            avail.dateTime = dateArray[x];
            avail.itemId = itemIdToMinus;
            avail.remainingQuantity = inventoryItemToMinus.bookableQuantity - quantityToMinus;

            availableEquipments.push(avail);
          }
          
        }
      }

      for(x in availableEquipments) {
        if(availableEquipments[x].remainingQuantity < itemToCheckArray[availableEquipments[x].itemId]) {

          overbookedResult.status = "Overbooked";
          var inventoryItem = Inventory.findOne({_id: availableEquipments[x].itemId});
          if(overbookedResult[inventoryItem.brand+" "+inventoryItem.item] == undefined) {
            overbookedResult[inventoryItem.brand+" "+inventoryItem.item] = new Object();
            overbookedResult[inventoryItem.brand+" "+inventoryItem.item].dates = [];
            overbookedResult[inventoryItem.brand+" "+inventoryItem.item].datesDigits = [];
            inventoryItemIds.push(inventoryItem._id);
          }
          if(Meteor.absoluteUrl() == 'http://localhost:3000/') {
            overbookedResult[inventoryItem.brand+" "+inventoryItem.item].dates.push(moment(availableEquipments[x].dateTime).format("Do MMMM YYYY"));
          } else {
            overbookedResult[inventoryItem.brand+" "+inventoryItem.item].dates.push(moment(availableEquipments[x].dateTime).format("Do MMMM YYYY"));
          }
          equipmentCalendarDates.push(availableEquipments[x].date);
        }
      }

      if(overbookedResult.status == "Overbooked") {
        var string = "";
        for(var x in overbookedResult){
          if(x != 'status') {
            string = string.concat("<li><strong>"+x+"</strong></li>");
          }
          for(y in overbookedResult[x].dates) {
            string = string.concat("<li>"+overbookedResult[x].dates[y]+"</li>");
          }
        }

        var returnObj = new Object();
        returnObj.status = "Revert";
        returnObj.string = string;
        returnObj.inventoryItemIds = inventoryItemIds;
        returnObj.datesDigits = equipmentCalendarDates;


        
        return returnObj;
      }

      // OVERBOOKING CHECK DONE!!
      // NOW CHECK FOR CLASHES
      var counter = 0;
      dateArray = [];
      var originalDateDigitArray = [];
      var originalDateMomentArray = [];
      dateDigitArray = [];
      dateMomentArray = [];
      calendarDateMomentArray = [];
      monthArray = [];
      dateDigitArray[counter] = [];
      originalDateDigitArray[counter] = [];
      originalDateMomentArray[counter] = [];
      monthArray[counter] = [];
      dateMomentArray[counter] = [];
      calendarDateMomentArray[counter] = [];
      var individualFormattedDates = [];
      var calendarClashableSerialNumbers = [];
      var calendarUnclashableSerialNumbers = [];
      var currentEquipmentCalendarIds = [];

      for(x in details.addedDates) {
        if(dateDigitArray[counter].length == 0) {
          dateDigitArray[counter].push(moment(details.addedDates[x]).format('DD MM YYYY'));
          originalDateDigitArray[counter].push(moment(details.addedDates[x]).format('DD MM YYYY'));
          dateMomentArray[counter].push(moment(details.addedDates[x]));
          calendarDateMomentArray[counter].push(moment(details.addedDates[x]));
          originalDateMomentArray[counter].push(moment(details.addedDates[x]));
          if(monthArray[counter].indexOf(moment(details.addedDates[x]).format('MM YYYY')) == -1) {
            monthArray[counter].push(moment(details.addedDates[x]).format('MM YYYY'));
          }
        } else {
          var date2 = moment(details.addedDates[x]).subtract(1, 'days');

          if(date2.format('DD MM YYYY') == dateDigitArray[counter][dateDigitArray[counter].length - 1]) {
            dateDigitArray[counter].push(moment(details.addedDates[x]).format('DD MM YYYY'));
            originalDateDigitArray[counter].push(moment(details.addedDates[x]).format('DD MM YYYY'));
            dateMomentArray[counter].push(moment(details.addedDates[x]));
            calendarDateMomentArray[counter].push(moment(details.addedDates[x]));
            originalDateMomentArray[counter].push(moment(details.addedDates[x]));
            if(monthArray[counter].indexOf(moment(details.addedDates[x]).format('MM YYYY')) == -1) {
              monthArray[counter].push(moment(details.addedDates[x]).format('MM YYYY'));
            }
          } else {
            counter += 1;
            dateDigitArray[counter] = [];
            dateDigitArray[counter].push(moment(details.addedDates[x]).format('DD MM YYYY'));

            originalDateDigitArray[counter] = [];
            originalDateDigitArray[counter].push(moment(details.addedDates[x]).format('DD MM YYYY'));

            dateMomentArray[counter] = [];
            dateMomentArray[counter].push(moment(details.addedDates[x]));

            calendarDateMomentArray[counter] = [];
            calendarDateMomentArray[counter].push(moment(details.addedDates[x]));

            originalDateMomentArray[counter] = [];
            originalDateMomentArray[counter].push(moment(details.addedDates[x]));

            monthArray[counter] = [];
            if(monthArray[counter].indexOf(moment(details.addedDates[x]).format('MM YYYY')) == -1) {
              monthArray[counter].push(moment(details.addedDates[x]).format('MM YYYY'));
            }
          }
        }
      }

      for(x in dateMomentArray) {
        var dateToSubtract = dateMomentArray[x][0];
        var dateToAdd = dateMomentArray[x][dateMomentArray[x].length - 1];
        dateDigitArray[x].unshift(moment(dateToSubtract).subtract(1, 'days').format('DD MM YYYY'));
        dateDigitArray[x].push(moment(dateToAdd).add(1, 'days').format('DD MM YYYY'));
        dateMomentArray[x].unshift(moment(dateToSubtract).subtract(1, 'days'));
        dateMomentArray[x].push(moment(dateToAdd).add(1, 'days'));
        calendarDateMomentArray[x].unshift(moment(dateToSubtract).subtract(1, 'days'));
        calendarDateMomentArray[x].push(moment(dateToAdd).add(1, 'days'));
        for(y in dateMomentArray[x]) {
          individualFormattedDates.push(moment(dateMomentArray[x][y]).format("DD MM YYYY"));
        }
      }

      var checkArray = [];

      // check array is to check equipment calendars to delete
      for(e in calendarDateMomentArray[0]) {
        checkArray.push(calendarDateMomentArray[0][e].format("DD MM YYYY"));
      }

      var equipmentCalendars;
      var inventoryItem;
      var availableSerialNumbersFromInventory = [];
      var equipmentCalendarIdArray = [];
      var statuses = ["Sent For Repair", "Missing", "Damaged"];
      var amountAddedToNewCalendars;
      var insertedCalendar;



      var currentClashSerialNumbers = [];
      var currentUnclashSerialNumbers = [];

      // SEE ALL SERIAL NUMBERS I HAVE FOR THIS PARTICULAR BOOKING

      for(x in bookingLineItems) {
        var currentSerialNumbers = [];

        availableSerialNumbersFromInventory = [];

        for(y in bookingLineItems[x].clashableSerialNumbers) {
          if(currentSerialNumbers.indexOf(bookingLineItems[x].clashableSerialNumbers[y].serialNo) == -1) {
            var serialNumberObject = new Object();
            serialNumberObject.serialNo = bookingLineItems[x].clashableSerialNumbers[y].serialNo;
            serialNumberObject.status = bookingLineItems[x].clashableSerialNumbers[y].status;
            currentSerialNumbers.push(serialNumberObject);
            currentClashSerialNumbers.push(serialNumberObject);
          }
        }
        for(y in bookingLineItems[x].unclashableSerialNumbers) {
          if(currentSerialNumbers.indexOf(bookingLineItems[x].unclashableSerialNumbers[y].serialNo) == -1) {
            var serialNumberObject = new Object();
            serialNumberObject.serialNo = bookingLineItems[x].unclashableSerialNumbers[y].serialNo;
            serialNumberObject.status = bookingLineItems[x].unclashableSerialNumbers[y].status;
            currentSerialNumbers.push(serialNumberObject);
            currentUnclashSerialNumbers.push(serialNumberObject);
          }
        }

        if(bookingLineItems[x].total != -1) {
          // MEANS WE ARE INSIDE NON-CUSTOM ITEM
          var inventoryItem = Inventory.findOne({_id: bookingLineItems[x].itemId});
          if(inventoryItem == undefined) {
            
          }
          for(y in inventoryItem.serialNo) {
            if(statuses.indexOf(inventoryItem.serialNo[y].status) == -1) {
              availableSerialNumbersFromInventory.push(inventoryItem.serialNo[y].serialNo);
            }
          }

          calendarClashableSerialNumbers = [];
          calendarUnclashableSerialNumbers = [];

          equipmentCalendars = EquipmentCalendars.find({dates:{$in: individualFormattedDates}, equipmentId: bookingLineItems[x].itemId}).fetch();

          // TO TAKE OUT THE CURRENT BOOKING LINE ITEM EQUIPMENT CALENDARS
          for(e = (equipmentCalendars.length - 1); e >= 0; e--) {
            if(equipmentCalendars[e].bookingLineItemId == bookingLineItems[x]._id) {
              equipmentCalendars.splice(e, 1);
            }
          }

          for(y in equipmentCalendars) {
            for(z in equipmentCalendars[y].serialNumbers) {
              if(availableSerialNumbersFromInventory.indexOf(equipmentCalendars[y].serialNumbers[z]) != -1 && calendarClashableSerialNumbers.indexOf(equipmentCalendars[y].serialNumbers[z]) == -1) {
                calendarClashableSerialNumbers.push(equipmentCalendars[y].serialNumbers[z]);
              }
            }

            if(equipmentCalendarIdArray.indexOf(equipmentCalendars[y]._id) == -1) {
              equipmentCalendarIdArray.push(equipmentCalendars[y]._id);
            }
          }

          for(y in availableSerialNumbersFromInventory) {
            if(calendarClashableSerialNumbers.indexOf(availableSerialNumbersFromInventory[y]) == -1) {
              calendarUnclashableSerialNumbers.push(availableSerialNumbersFromInventory[y]);
            }
          }

          var newCalendarClashableSerialNumbers = [];
          var newCalendarUnclashableSerialNumbers = [];

          // CHECK IF CLASH IS COMING
          for(y in currentSerialNumbers) {
            if(calendarClashableSerialNumbers.indexOf(currentSerialNumbers[y].serialNo) != -1) {
              newCalendarClashableSerialNumbers.push(currentSerialNumbers[y]);
            } else {
              newCalendarUnclashableSerialNumbers.push(currentSerialNumbers[y]);
            }
          }

          

          // NEW CALENDAR CLASHABLE SERIAL NUMBERS CONTAIN SERIAL NUMBERS IN THE
          // ADDED DATES THAT CONFIRM WILL CLASH
          // WE NOW LOOK AT CALENDAR UNCLASHABLE SERIAL NUMBERS TO SEE WHETHER
          // WE CAN TAKE ANY SERIAL NUMBERS FROM THERE INSTEAD
          // NEW CALENDAR IS WITH SERIAL NUMBERS THAT ARE ALREADY IN BOOKING

          // IF I ALREADY HAVE SERIAL NUMBER IN BOOKING, I CANNOT SELECT THE SAME
          // SERIAL NUMBER FROM OTHER DATES
          for(e = (newCalendarUnclashableSerialNumbers.length - 1); e >= 0; e--) {
            if(calendarUnclashableSerialNumbers.indexOf(newCalendarUnclashableSerialNumbers[e].serialNo) != -1) {
              calendarUnclashableSerialNumbers.splice(calendarUnclashableSerialNumbers.indexOf(newCalendarUnclashableSerialNumbers[e].serialNo), 1);
            }
          }


          for(e = (newCalendarClashableSerialNumbers.length - 1); e >= 0; e--) {
            if(newCalendarClashableSerialNumbers[e].status == "N/A" && calendarUnclashableSerialNumbers.length > 0) {

                var newUnclashToAdd = new Object();

                newUnclashToAdd.serialNo = calendarUnclashableSerialNumbers.pop();
                newUnclashToAdd.status = newCalendarClashableSerialNumbers[e].status;

                newCalendarUnclashableSerialNumbers.push(newUnclashToAdd);

                var replacement = new Object();
                replacement.toReplace = newCalendarClashableSerialNumbers[e].serialNo;
                replacement.replaceWith = newUnclashToAdd.serialNo;

                replacementSerialNumbers.push(replacement);

                newCalendarClashableSerialNumbers.splice(e, 1);

            } else {

            }
          }

          amountAddedToNewCalendars = bookingLineItems[x].booked;

          var ecSerialNumbers = [];

          for(y in newCalendarClashableSerialNumbers) {
            ecSerialNumbers.push(newCalendarClashableSerialNumbers[y].serialNo);
          }
          for(y in newCalendarUnclashableSerialNumbers) {
            ecSerialNumbers.push(newCalendarUnclashableSerialNumbers[y].serialNo);
          }

          var originalEquipmentCalendars = EquipmentCalendars.find({invoiceId: invoiceId, bookingLineItemId: bookingLineItems[x]._id}).fetch();

          if(replacementSerialNumbers.length > 0) {
            for(f in originalEquipmentCalendars) {
              for(g in replacementSerialNumbers) {
                if(originalEquipmentCalendars[f].serialNumbers.indexOf(replacementSerialNumbers[g].toReplace) != -1) {
                  originalEquipmentCalendars[f].serialNumbers[originalEquipmentCalendars[f].serialNumbers.indexOf(replacementSerialNumbers[g].toReplace)] = replacementSerialNumbers[g].replaceWith;
                }
              }

              var originalEquipmentCalendarId = originalEquipmentCalendars[f]._id;

              delete originalEquipmentCalendars[f]._id;
              EquipmentCalendars.update({_id: originalEquipmentCalendarId}, {$set: originalEquipmentCalendars[f]});
            }
          }

          if(amountAddedToNewCalendars != 0) {
            for(a in dateMomentArray) {
              if(dateMomentArray[a].length == 3) {
                var startDate;
                var endDate;
                if(startDate == undefined) {
                  startDate = dateMomentArray[a][1];
                  startDate = startDate.add(1,'days');
                }
                if(endDate == undefined) {
                  endDate = dateMomentArray[a][1];
                }

                var equipmentCalendarAttributes = {
                  startDate: new Date(startDate),
                  endDate: new Date(endDate),
                  invoiceId: invoiceId,
                  title: customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item,
                  customerName: customer.name,
                  equipmentBrand: inventoryItem.brand,
                  equipmentItem: inventoryItem.item,
                  equipmentId: inventoryItem._id,
                  type: bookingStatus.type,
                  customerId: customer._id,
                  bookingLineItemId: bookingLineItems[x]._id,
                  url: "bookings/" + invoiceId,
                  serialNumbers: ecSerialNumbers,
                  booked: amountAddedToNewCalendars,
                  months: monthArray[a],
                  dates: originalDateDigitArray[0]
                };

                insertedCalendar = EquipmentCalendars.insert(equipmentCalendarAttributes);
              } else {
                var startDate;
                var endDate;
                if(startDate == undefined) {
                  startDate = dateMomentArray[a][1];
                  startDate = startDate.add(1,'days');
                }
                if(endDate == undefined) {
                  endDate = dateMomentArray[a][dateMomentArray[a].length-2];
                  endDate = endDate.add(2, 'days');
                }
                var equipmentCalendarAttributes = {
                  startDate: new Date(startDate),
                  endDate: new Date(endDate),
                  invoiceId: invoiceId,
                  title: customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item,
                  customerName: customer.name,
                  equipmentBrand: inventoryItem.brand,
                  equipmentItem: inventoryItem.item,
                  equipmentId: inventoryItem._id,
                  type: bookingStatus.type,
                  customerId: customer._id,
                  bookingLineItemId: bookingLineItems[x]._id,
                  url: "bookings/" + invoiceId,
                  serialNumbers: ecSerialNumbers,
                  booked: amountAddedToNewCalendars,
                  months: monthArray[a],
                  dates: originalDateDigitArray[0]
                };

                insertedCalendar = EquipmentCalendars.insert(equipmentCalendarAttributes);
              }
            }
          }

          // THIS MEANS THAT BOOKING LINE ITEM CLASHES
          if(newCalendarClashableSerialNumbers.length > 0) {

            bookingLineItems[x].clash = true;

            var clashSerialNumbersToCheckWith = [];

            for(a in newCalendarClashableSerialNumbers) {
              clashSerialNumbersToCheckWith.push(newCalendarClashableSerialNumbers[a].serialNo);
            }

            for(a in bookingLineItems[x].clashableSerialNumbers) {
              if(clashSerialNumbersToCheckWith.indexOf(bookingLineItems[x].clashableSerialNumbers[a].serialNo) == -1) {

                // doesnt exist, must be a new serial number taken
                var sna = [];
                sna.push(bookingLineItems[x].clashableSerialNumbers[a].serialNo);

                var cc = [];
                var clashCalendarsToAddToClashObject = EquipmentCalendars.find({equipmentId: bookingLineItems[x].itemId, bookingLineItemId: {$ne: bookingLineItemId},invoiceId: {$ne: invoiceId}, serialNumbers: {$in: sna}, dates: {$in: individualFormattedDates}}).fetch();

                for(b in clashCalendarsToAddToClashObject) {
                  cc.push(clashCalendarsToAddToClashObject[b]._id);
                }

                var alreadyExists = false;

                for(q in bookingLineItems[x].clashableSerialNumbers) {
                  if(bookingLineItems[x].clashableSerialNumbers[q].serialNo == bookingLineItems[x].clashableSerialNumbers[a].serialNo) {
                    alreadyExists = true;
                    break;
                  }
                }

                if(alreadyExists == false) {
                  var clashObject2 = new Object();
                  clashObject2.serialNo = bookingLineItems[x].clashableSerialNumbers[a].serialNo;
                  clashObject2.status = bookingLineItems[x].clashableSerialNumbers[a].status;
                  clashObject2.itemId = bookingLineItems[x].itemId;
                  clashObject2.groupId = bookingLineItems[x].groupCounter;
                  clashObject2.clashCalendars = clashObject2.clashCalendars.concat(cc);
                  clashObject2.originalCalendars = clashObject2.originalCalendars.concat(insertedCalendar);

                  bookingLineItems[x].clashableSerialNumbers.push(clashObject2);
                }
              } else {
                // already exist, we must just amend the original calendars and clash calendars
                var sna = [];
                sna.push(bookingLineItems[x].clashableSerialNumbers[a].serialNo);

                var cc = [];
                var clashCalendarsToAddToClashObject = EquipmentCalendars.find({equipmentId: bookingLineItems[x].itemId, bookingLineItemId: {$ne: bookingLineItemId},invoiceId: {$ne: invoiceId},  serialNumbers: {$in: sna}, dates: {$in: individualFormattedDates}}).fetch();

                for(b in clashCalendarsToAddToClashObject) {
                  cc.push(clashCalendarsToAddToClashObject[b]._id);
                }

                for(b in cc) {
                  if(bookingLineItems[x].clashableSerialNumbers[a].clashCalendars.indexOf(cc[b]) == -1) {
                    bookingLineItems[x].clashableSerialNumbers[a].clashCalendars.push(cc[b]);
                  }

                  var clashBookingLineItem = BookingLineItems.findOne({_id: clashCalendarsToAddToClashObject[b].bookingLineItemId});

                  var insertedCalendarObject = EquipmentCalendars.findOne({_id: insertedCalendar});

                  for(r in clashBookingLineItem.clashableSerialNumbers) {
                    for(s in insertedCalendarObject.serialNumbers) {
                      if(insertedCalendarObject.serialNumbers[s] == clashBookingLineItem.clashableSerialNumbers[r].serialNo) {
                        // it means that in unclashable serial numbers there is a serial number that exists so we needa shift this to clashable serial numbers

                        if(clashBookingLineItem.clashableSerialNumbers[r].clashCalendars.indexOf(insertedCalendar) == -1) {
                          clashBookingLineItem.clashableSerialNumbers[r].clashCalendars.push(insertedCalendar);
                        }
                      }
                    }
                  }

                  delete clashBookingLineItem._id;
                  BookingLineItems.update({_id: clashCalendarsToAddToClashObject[b].bookingLineItemId}, {$set: clashBookingLineItem});
                  Meteor.call("updateBookingStatus", clashBookingLineItem.invoiceId);
                }

                if(bookingLineItems[x].clashableSerialNumbers[a].originalCalendars.indexOf(insertedCalendar) == -1) {
                  bookingLineItems[x].clashableSerialNumbers[a].originalCalendars.push(insertedCalendar);
                }
              }
            }

            var serialNoToCheck;
            var serialNoStatus;

            var serialTestArray = [];

            for(a = (bookingLineItems[x].unclashableSerialNumbers.length -1); a >= 0; a--) {
              
              if(bookingLineItems[x].unclashableSerialNumbers[a].serialNo != serialNoToCheck) {
                serialNoToCheck = bookingLineItems[x].unclashableSerialNumbers[a].serialNo;
              }
              if(bookingLineItems[x].unclashableSerialNumbers[a].status != serialNoStatus) {
                serialNoStatus = bookingLineItems[x].unclashableSerialNumbers[a].status;
              }

              
              var equipmentCalendarIdArray2 = [];

              for(f in equipmentCalendars) {
                equipmentCalendarIdArray2.push(equipmentCalendars[f]._id);
              }

              for(f in equipmentCalendars) {
                if(equipmentCalendars[f].serialNumbers.indexOf(serialNoToCheck) != -1) {

                  var newClashObject = new Object();
                  newClashObject.serialNo = serialNoToCheck;
                  newClashObject.status = serialNoStatus;
                  newClashObject.itemId = bookingLineItems[x].itemId;
                  newClashObject.groupId = parseInt(bookingLineItems[x].groupCounter);
                  newClashObject.clashCalendars = [];
                  newClashObject.originalCalendars = [];
                  newClashObject.clashCalendars = newClashObject.clashCalendars.concat(equipmentCalendarIdArray2);
                  newClashObject.originalCalendars.push(insertedCalendar);

                  if(serialTestArray.indexOf(serialNoToCheck) == -1) {
                    bookingLineItems[x].clashableSerialNumbers.push(newClashObject);
                    bookingLineItems[x].unclashableSerialNumbers.splice(a, 1);
                  }

                  serialTestArray.push(serialNoToCheck);

                  var clashedBookingLineItem = BookingLineItems.findOne({_id: equipmentCalendars[f].bookingLineItemId});

                  

                  for(r in clashedBookingLineItem.clashableSerialNumbers) {
                    if(clashedBookingLineItem.clashableSerialNumbers[r].serialNo == serialNoToCheck && clashedBookingLineItem.clashableSerialNumbers[r].clashCalendars.indexOf(insertedCalendar) == -1) {
                      clashedBookingLineItem.clashableSerialNumbers[r].clashCalendars.push(insertedCalendar);
                      break;
                    }
                  }


                  for(r in clashedBookingLineItem.unclashableSerialNumbers) {
                    if(clashedBookingLineItem.unclashableSerialNumbers[r].serialNo == serialNoToCheck) {
                      var newClashObject = new Object();
                      newClashObject.serialNo = clashedBookingLineItem.unclashableSerialNumbers[r].serialNo;
                      newClashObject.status = clashedBookingLineItem.unclashableSerialNumbers[r].status;
                      newClashObject.itemId = clashedBookingLineItem.itemId;
                      newClashObject.groupId = parseInt(clashedBookingLineItem.groupCounter);
                      newClashObject.clashCalendars = [];
                      newClashObject.originalCalendars = [];
                      newClashObject.clashCalendars.push(insertedCalendar);
                      newClashObject.originalCalendars = newClashObject.originalCalendars.concat(equipmentCalendarIdArray2);

                      clashedBookingLineItem.clashableSerialNumbers.push(newClashObject);
                      clashedBookingLineItem.unclashableSerialNumbers.splice(r, 1);

                      break;
                    }
                  }

                  clashedBookingLineItem.clash = true;

                  delete clashedBookingLineItem._id;

                  BookingLineItems.update({_id: equipmentCalendars[f].bookingLineItemId}, {$set: clashedBookingLineItem});
                  Meteor.call("updateBookingStatus", clashedBookingLineItem.invoiceId);
                }
              }
            }
          }

          if(newCalendarUnclashableSerialNumbers.length > 0) {
            var unclashSerialNumbersToCheckWith = [];
            for(a in newCalendarUnclashableSerialNumbers) {
              if(unclashSerialNumbersToCheckWith.indexOf(newCalendarUnclashableSerialNumbers[a].serialNo) == -1) {
                unclashSerialNumbersToCheckWith.push(newCalendarUnclashableSerialNumbers[a].serialNo);
              }
            }

            var remainingSerialNumbers = [];

            for(e = (bookingLineItems[x].unclashableSerialNumbers.length - 1); e >= 0; e--) {
              if(unclashSerialNumbersToCheckWith.indexOf(bookingLineItems[x].unclashableSerialNumbers[e].serialNo) == -1) {
                bookingLineItems[x].unclashableSerialNumbers.splice(e, 1);
              } else {
                unclashSerialNumbersToCheckWith.splice(unclashSerialNumbersToCheckWith.indexOf(bookingLineItems[x].unclashableSerialNumbers[e].serialNo), 1);
              }
            }

            var checkArray2 = [];

            for(q in bookingLineItems[x].unclashableSerialNumbers) {
              checkArray2.push(bookingLineItems[x].unclashableSerialNumbers[q].serialNo);
            }

            for(q in bookingLineItems[x].clashableSerialNumbers) {
              checkArray2.push(bookingLineItems[x].clashableSerialNumbers[q].serialNo);
            }

            for(a in unclashSerialNumbersToCheckWith) {
              if(checkArray2.indexOf(unclashSerialNumbersToCheckWith[a]) == -1) {
                var unclashObjectToAdd = new Object();
                unclashObjectToAdd.status = "N/A";
                unclashObjectToAdd.serialNo = unclashSerialNumbersToCheckWith[a];
                unclashObjectToAdd.groupId = groupId;
                unclashObjectToAdd.itemId = bookingLineItems[x].itemId;

                bookingLineItems[x].unclashableSerialNumbers.push(unclashObjectToAdd);
              }
            }
          }
        }

        bookingLineItems[x].days = details['dates'].length;
        bookingLineItems[x].originalPriced = bookingLineItems[x].booked * bookingLineItems[x].days;

        var bookingLineItemId = bookingLineItems[x]._id;

        delete bookingLineItems[x]._id;

        BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItems[x]});
      }

      bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupId}).fetch();

      // CREATE OR UPDATE CALENDARS
      var calendarTypes = [];
      calendarTypes.push("Booking");
      calendarTypes.push("Quotation");

      var calendars = [];

      for(y in dateDigitArray[0]) {
        var array = [];
        array.push(dateDigitArray[0][y]);
        var calendar = Calendars.findOne({dates: {$in: array}, groupId: groupId, invoiceId: invoiceId, type: {$in: calendarTypes}});
        if(calendar != undefined) {
          calendars.push(calendar);
        }
      }

      var prepDate = dateMomentArray[0][0];
      var collectionDate = dateMomentArray[0][dateMomentArray[0].length - 1];

      var digitPrepDate = dateMomentArray[0][0];
      var digitCollectionDate = dateMomentArray[0][dateMomentArray[0].length - 1];

      dateDigitArray[0].pop();
      dateDigitArray[0].shift();

      dateMomentArray[0].pop();
      dateMomentArray[0].shift();

      var bookingType;
      var packingCalendarsToUpdate;
      var collectionCalendarsToUpdate;


      if(bookingStatus.type == "Booking") {
        bookingType = "Booking";
        packingCalendarsToUpdate = Calendars.findOne({groupId: groupId, dates: {$in: addedDateDigitArray}, type: "Packing_Booking", invoiceId: invoiceId});
        collectionCalendarsToUpdate = Calendars.findOne({groupId: groupId, dates: {$in: addedDateDigitArray}, type: "Collection_Booking", invoiceId: invoiceId});
      } else {
        bookingType = "Quotation";
        packingCalendarsToUpdate = Calendars.findOne({groupId: groupId, dates: {$in: addedDateDigitArray}, type: "Packing_Quotation", invoiceId: invoiceId});
        collectionCalendarsToUpdate = Calendars.findOne({groupId: groupId, dates: {$in: addedDateDigitArray}, type: "Collection_Quotation", invoiceId: invoiceId});
      }

    if(packingCalendarsToUpdate != undefined && collectionCalendarsToUpdate != undefined) {

        packingUsageId = packingCalendarsToUpdate.usageCalendar;
        collectionUsageId = collectionCalendarsToUpdate.usageCalendar;

        var packingCalendar = Calendars.findOne({_id: packingUsageId});
        var packingCalendarStartCalendar = Calendars.findOne({usageCalendar: packingUsageId, type: "Packing_"+bookingType});
        var packingCalendarEndCalendar = Calendars.findOne({usageCalendar: packingUsageId, type: "Collection_"+bookingType});

        var collectionCalendar = Calendars.findOne({_id: collectionUsageId});
        var collectionCalendarStartCalendar = Calendars.findOne({usageCalendar: collectionUsageId, type: "Packing_"+bookingType});
        var collectionCalendarEndCalendar = Calendars.findOne({usageCalendar: collectionUsageId, type: "Collection_"+bookingType});

        var returnObj = new Object();
        returnObj.startDate = packingCalendar.startDate;
        returnObj.endDate = collectionCalendar.endDate;
        returnObj.status = "Both_Affected";

        // update collection calendar usage dates
        collectionCalendar.endDate = packingCalendar.endDate;
        collectionCalendar.dates = collectionCalendar.dates.concat(dateDigitArray[0]);
        collectionCalendar.dates = collectionCalendar.dates.concat(packingCalendar.dates);
        collectionCalendar.months = collectionCalendar.months.concat(monthArray[0]);
        collectionCalendar.months = collectionCalendar.months.concat(packingCalendar.months);

        var collectionCalendarId = collectionCalendar._id;
        delete collectionCalendar._id;

        Calendars.update({_id: collectionCalendarId}, {$set: collectionCalendar});

        // update packing calendar end date
        packingCalendarEndCalendar.usageCalendar = collectionCalendarId;

        var packingCalendarEndCalendarId = packingCalendarEndCalendar._id;
        delete packingCalendarEndCalendar._id;

        Calendars.update({_id: packingCalendarEndCalendarId}, {$set: packingCalendarEndCalendar});

        // remove collection calendar end date
        Calendars.remove({_id: collectionCalendarEndCalendar._id});

        // remove packing calendar start date
        Calendars.remove({_id: packingCalendarStartCalendar._id});

        // remove packing calendar usage date
        Calendars.remove({_id: packingCalendar._id});

        // do stuff to equipment calendars
        for(e in bookingLineItems) {
          if(bookingLineItems[e].total != -1) {
            var serialNumbers = EquipmentCalendars.findOne({bookingLineItemId: bookingLineItems[e]._id}).serialNumbers;

            var ids = EquipmentCalendars.find({bookingLineItemId: bookingLineItems[e]._id}, {fields: {"_id" : 1}}).fetch();
            var theCalendarsToDelete = [];

            for(b in ids) {
              theCalendarsToDelete.push(ids[b]._id);
            }

            EquipmentCalendars.remove({bookingLineItemId: bookingLineItems[e]._id, dates: {$in: checkArray}});


            var updatedEndDate = moment(collectionCalendar.endDate).add(1, 'days').format("MM-DD-YYYY 00:00");
            // insert new equipment calendar
            var equipmentCalendarAttributes = {
              startDate: collectionCalendar.startDate,
              endDate: new Date(updatedEndDate),
              invoiceId: details['_id'],
              title: customer.name + ": " + bookingLineItems[e].item,
              customerName: customer.name,
              equipmentBrand: bookingLineItems[e].brand,
              equipmentItem: bookingLineItems[e].item,
              equipmentId: bookingLineItems[e].itemId,
              type: bookingStatus.type,
              customerId: customer._id,
              bookingLineItemId: bookingLineItems[e]._id,
              url: "bookings/" + invoiceId,
              serialNumbers: serialNumbers,
              booked: bookingLineItems[e].booked,
              months: collectionCalendar.months,
              dates: collectionCalendar.dates
            };

            equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);



            if(bookingLineItems[e].clashableSerialNumbers.length > 0) {
              // remove current booking original calendars and the other bookings belonging to clash calendars to the updated calendar id

              for(t in bookingLineItems[e].clashableSerialNumbers) {
                for(u = (bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.length -1); u >= 0; u--) {
                  if(theCalendarsToDelete.indexOf(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars[u]) != -1) {
                    bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.splice(u,1);
                  }
                }

                if(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.indexOf(equipmentCalendarId) == -1) {
                  bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.push(equipmentCalendarId);

                  BookingLineItems.update({_id: bookingLineItems[e]._id}, {$set: bookingLineItems[e]});
                }

                for(u in bookingLineItems[e].clashableSerialNumbers[t].clashCalendars) {
                  var clashCalendar = EquipmentCalendars.findOne({_id: bookingLineItems[e].clashableSerialNumbers[t].clashCalendars[u]});

                  var bookingLineItemToUpdate = BookingLineItems.findOne({_id: clashCalendar.bookingLineItemId});
                  for(v in bookingLineItemToUpdate.clashableSerialNumbers) {
                    for(u = (bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.length -1); u >= 0; u--) {
                      if(theCalendarsToDelete.indexOf(bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars[u]) != -1) {
                        bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.splice(u,1);
                      }
                    }

                    if(bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.indexOf(equipmentCalendarId) == -1) {
                      bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.push(equipmentCalendarId);
                    }
                  }

                  var bookingLineItemToUpdateId = bookingLineItemToUpdate._id;
                  delete bookingLineItemToUpdate._id;

                  BookingLineItems.update({_id: bookingLineItemToUpdateId}, {$set: bookingLineItemToUpdate});
                }
              }
            }
          }
        }

        // BookingLineItems.update({_id: originalBookingId}, {$set: updatedBooking});

        // return returnObj;
    } else if(packingCalendarsToUpdate != undefined) {
      

        packingUsageId = packingCalendarsToUpdate.usageCalendar;

        var packingCalendar = Calendars.findOne({_id: packingUsageId});
        var packingCalendarStartCalendar = Calendars.findOne({usageCalendar: packingUsageId, type: "Packing_"+bookingType});

        var returnObj = new Object();
        returnObj.startDate = packingCalendar.startDate;
        returnObj.status = "Right_Affected";

        // update packing calendar usage dates
        packingCalendar.startDate = new Date(prepDate.add(2, 'days'));
        packingCalendar.dates = packingCalendar.dates.concat(dateDigitArray[0]);
        packingCalendar.months = packingCalendar.months.concat(monthArray[0]);

        var packingCalendarId = packingCalendar._id;
        delete packingCalendar._id;

        Calendars.update({_id: packingCalendarId}, {$set: packingCalendar});

        // update packing calendar start date
        packingCalendarStartCalendar.startDate = new Date(prepDate.subtract(1, 'days'));
        packingCalendarStartCalendar.endDate = new Date(prepDate);
        packingCalendarStartCalendar.dates = [digitPrepDate.subtract(1, 'days').format("DD MM YYYY")];
        packingCalendarStartCalendar.months = monthArray[0];

        var packingCalendarStartCalendarId = packingCalendarStartCalendar._id;
        delete packingCalendarStartCalendar._id;

        Calendars.update({_id: packingCalendarStartCalendarId}, {$set: packingCalendarStartCalendar});

        // do stuff to equipment calendars
        for(e in bookingLineItems) {
          if(bookingLineItems[e].total != -1) {
            // remove existing equipment calendars
          var serialNumbers = EquipmentCalendars.findOne({bookingLineItemId: bookingLineItems[e]._id}).serialNumbers;

          var ids = EquipmentCalendars.find({bookingLineItemId: bookingLineItems[e]._id}, {fields: {"_id" : 1}}).fetch();
          var theCalendarsToDelete = [];

          for(b in ids) {
            theCalendarsToDelete.push(ids[b]._id);
          }



          EquipmentCalendars.remove({bookingLineItemId: bookingLineItems[e]._id, dates: {$in: checkArray}});

          var updatedEndDate = moment(packingCalendar.endDate).add(1, 'days').format("MM-DD-YYYY 00:00");
          // insert new equipment calendar
          var equipmentCalendarAttributes = {
            startDate: packingCalendar.startDate,
            endDate: new Date(updatedEndDate),
            invoiceId: details['_id'],
            title: customer.name + ": " + bookingLineItems[e].item,
            customerName: customer.name,
            equipmentBrand: bookingLineItems[e].brand,
            equipmentItem: bookingLineItems[e].item,
            equipmentId: bookingLineItems[e].itemId,
            type: bookingStatus.type,
            customerId: customer._id,
            bookingLineItemId: bookingLineItems[e]._id,
            url: "bookings/" + invoiceId,
            serialNumbers: serialNumbers,
            booked: bookingLineItems[e].booked,
            months: packingCalendar.months,
            dates: packingCalendar.dates
          };

          equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);

          

          if(bookingLineItems[e].clashableSerialNumbers.length > 0) {

            for(t in bookingLineItems[e].clashableSerialNumbers) {
              for(u = (bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.length -1); u >= 0; u--) {
                if(theCalendarsToDelete.indexOf(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars[u]) != -1) {
      
                  bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.splice(u,1);
                }
              }

              if(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.indexOf(equipmentCalendarId) == -1) {

                bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.push(equipmentCalendarId);

                BookingLineItems.update({_id: bookingLineItems[e]._id}, {$set: bookingLineItems[e]});
              }

              for(u in bookingLineItems[e].clashableSerialNumbers[t].clashCalendars) {
                var clashCalendar = EquipmentCalendars.findOne({_id: bookingLineItems[e].clashableSerialNumbers[t].clashCalendars[u]});

                var bookingLineItemToUpdate = BookingLineItems.findOne({_id: clashCalendar.bookingLineItemId});
                for(v in bookingLineItemToUpdate.clashableSerialNumbers) {
                  for(u = (bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.length -1); u >= 0; u--) {
                    if(theCalendarsToDelete.indexOf(bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars[u]) != -1) {
                      bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.splice(u,1);
                    }
                  }

                  if(bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.indexOf(equipmentCalendarId) == -1) {
                    bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.push(equipmentCalendarId);
                  }
                }

                var bookingLineItemToUpdateId = bookingLineItemToUpdate._id;
                delete bookingLineItemToUpdate._id;

                BookingLineItems.update({_id: bookingLineItemToUpdateId}, {$set: bookingLineItemToUpdate});
              }
            }
          }
          }
        }

        // Bookings.update({_id: originalBookingId}, {$set: updatedBooking});

        // return returnObj;
    } else if(collectionCalendarsToUpdate != undefined) {
      

        collectionUsageId = collectionCalendarsToUpdate.usageCalendar;

        var collectionCalendar = Calendars.findOne({_id: collectionUsageId});
        var collectionCalendarStartCalendar = Calendars.findOne({usageCalendar: collectionUsageId, type: "Collection_"+bookingType});

        var returnObj = new Object();
        returnObj.endDate = collectionCalendar.endDate;
        returnObj.status = "Left_Affected";

        // update collection calendar usage dates
        collectionCalendar.endDate = new Date(collectionDate);
        collectionCalendar.dates = collectionCalendar.dates.concat(dateDigitArray[0]);
        collectionCalendar.months = collectionCalendar.months.concat(monthArray[0]);

        var collectionCalendarId = collectionCalendar._id;
        delete collectionCalendar._id;

        Calendars.update({_id: collectionCalendarId}, {$set: collectionCalendar});

        // update collection calendar end date
        var da = [];
        da.push(digitCollectionDate.format("DD MM YYYY"));

        collectionCalendarStartCalendar.startDate = new Date(collectionDate.add(1, 'days'));
        collectionCalendarStartCalendar.endDate = new Date(collectionDate);
        collectionCalendarStartCalendar.dates = da;
        collectionCalendarStartCalendar.months = monthArray[0];

        var collectionCalendarStartCalendarId = collectionCalendarStartCalendar._id;
        delete collectionCalendarStartCalendar._id;

        Calendars.update({_id: collectionCalendarStartCalendarId}, {$set: collectionCalendarStartCalendar});

        // do stuff to equipment calendars
        for(e in bookingLineItems) {

          // remove existing equipment calendars
          if(bookingLineItems[e].total != -1) {
            var serialNumbers = EquipmentCalendars.findOne({bookingLineItemId: bookingLineItems[e]._id}).serialNumbers;

            var ids = EquipmentCalendars.find({bookingLineItemId: bookingLineItems[e]._id}, {fields: {"_id" : 1}}).fetch();
            var theCalendarsToDelete = [];

            for(b in ids) {
              theCalendarsToDelete.push(ids[b]._id);
            }



            EquipmentCalendars.remove({bookingLineItemId: bookingLineItems[e]._id, dates: {$in: checkArray}});

            var updatedEndDate = moment(collectionCalendar.endDate).add(1, 'days').format("MM-DD-YYYY 00:00");
            // insert new equipment calendar
            var equipmentCalendarAttributes = {
              startDate: collectionCalendar.startDate,
              endDate: new Date(updatedEndDate),
              invoiceId: details['_id'],
              title: customer.name + ": " + bookingLineItems[e].item,
              customerName: customer.name,
              equipmentBrand: bookingLineItems[e].brand,
              equipmentItem: bookingLineItems[e].item,
              equipmentId: bookingLineItems[e].itemId,
              type: bookingStatus.type,
              customerId: customer._id,
              bookingLineItemId: bookingLineItems[e]._id,
              url: "bookings/" + invoiceId,
              serialNumbers: serialNumbers,
              booked: bookingLineItems[e].booked,
              months: collectionCalendar.months,
              dates: collectionCalendar.dates
            };

            equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);

            if(bookingLineItems[e].clashableSerialNumbers.length > 0) {
              for(t in bookingLineItems[e].clashableSerialNumbers) {
                for(u = (bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.length -1); u >= 0; u--) {
                  if(theCalendarsToDelete.indexOf(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars[u]) != -1) {
                    bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.splice(u,1);
                  }
                }

                if(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.indexOf(equipmentCalendarId) == -1) {
                  bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.push(equipmentCalendarId);

                  BookingLineItems.update({_id: bookingLineItems[e]._id}, {$set: bookingLineItems[e]});
                }

                for(u in bookingLineItems[e].clashableSerialNumbers[t].clashCalendars) {
                  var clashCalendar = EquipmentCalendars.findOne({_id: bookingLineItems[e].clashableSerialNumbers[t].clashCalendars[u]});

                  var bookingLineItemToUpdate = BookingLineItems.findOne({_id: clashCalendar.bookingLineItemId});
                  for(v in bookingLineItemToUpdate.clashableSerialNumbers) {
                    for(u = (bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.length -1); u >= 0; u--) {
                      if(theCalendarsToDelete.indexOf(bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars[u]) != -1) {
                        bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.splice(u,1);
                      }
                    }

                    if(bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.indexOf(equipmentCalendarId) == -1) {
                      bookingLineItemToUpdate.clashableSerialNumbers[t].clashCalendars.push(equipmentCalendarId);
                    }
                  }

                  var bookingLineItemToUpdateId = bookingLineItemToUpdate._id;
                  delete bookingLineItemToUpdate._id;

                  BookingLineItems.update({_id: bookingLineItemToUpdateId}, {$set: bookingLineItemToUpdate});
                }
              }
            }
          }
        }

        // Bookings.update({_id: originalBookingId}, {$set: updatedBooking});

        // return returnObj;
    } else if(packingCalendarsToUpdate == undefined && collectionCalendarsToUpdate == undefined) {

        var usageId;

        var calendarAttributes = {
          startDate: new Date(prepDate.add(2, 'days')),
          endDate: new Date(collectionDate),
          invoiceId: invoiceId,
          title: "USAGE: " + customer.name + " Group " + (parseInt(groupId) + 1),
          customerName: customer.name,
          customerId: customer._id,
          groupId: parseInt(groupId),
          type: bookingStatus.type,
          url: "bookings/" + invoiceId,
          months: monthArray[0],
          dates: dateDigitArray[0]
        };

        usageId = Calendars.insert(calendarAttributes);

        if(bookingStatus.type == "Booking") {
          type = "Packing_Booking";
        } else {
          type = "Packing_Quotation";
        }

        var calendarAttributes = {
          startDate: new Date(prepDate.subtract(1, 'days')),
          endDate: new Date(prepDate),
          invoiceId: invoiceId,
          title: "PACK: " + customer.name + " Group " + (parseInt(groupId) + 1),
          customerName: customer.name,
          customerId: customer._id,
          groupId: parseInt(groupId),
          type: type,
          url: "bookings/" + invoiceId,
          months: monthArray[0],
          dates: [digitPrepDate.subtract(1, 'days').format("DD MM YYYY")],
          usageCalendar : usageId
        };

        Calendars.insert(calendarAttributes);

        if(bookingStatus.type == "Booking") {
          type = "Collection_Booking";
        } else {
          type = "Collection_Quotation";
        }

        var da = [];
        da.push(digitCollectionDate.format("DD MM YYYY"));

        var calendarAttributes = {
          startDate: new Date(collectionDate.add(1, 'days')),
          endDate: new Date(collectionDate),
          invoiceId: invoiceId,
          title: "RETURN: " + customer.name + " Group " + (parseInt(groupId) + 1),
          customerName: customer.name,
          customerId: customer._id,
          groupId: parseInt(groupId),
          type: type,
          url: "bookings/" + invoiceId,
          months: monthArray[0],
          dates: da,
          usageCalendar : usageId
        };

        Calendars.insert(calendarAttributes);
    }

      var totalDatesToPut = [];

      for(x in allDates) {
        allDates[x] = new Date(moment(allDates[x]).add(1, 'days'));
      }

      

      // UPDATE BOOKING GROUP DATES

      bookingGroup.dates = allDates;
      bookingGroup.noOfDates = allDates.length;
      var bookingGroupId = bookingGroup._id;
      delete bookingGroup._id;

      BookingGroups.update({_id: bookingGroupId}, {$set: bookingGroup});

      var bookingGroups = BookingGroups.find({invoiceId: invoiceId}).fetch();
      for(x in bookingGroups) {
        for(y in bookingGroups[x].dates) {
          var dateToPut = moment(bookingGroups[x].dates[y]).subtract(1, 'days').format("DD MM YYYY");
          if(totalDatesToPut.indexOf(dateToPut) == -1) {
            totalDatesToPut.push(dateToPut);
          }
        }
      }

      // UPDATE DISPLAY DATES

      var arrayOfDateArrays = [];
      var counter = 0;
      var arrayOfObjects = [];

      var allBookingGroups = BookingGroups.find({invoiceId: invoiceId}).fetch();

      for(x in allBookingGroups) {
        arrayOfDateArrays = [];
        arrayOfDateArrays[counter] = [];

        var obj = new Object();
        obj.id = allBookingGroups[x].groupId;
        if(allBookingGroups[x].dates != undefined) {
          if(allBookingGroups[x].dates.length >0) {

            for(y in allBookingGroups[x].dates) {
              allBookingGroups[x].dates[y] = parseInt(moment(allBookingGroups[x].dates[y]).format("x"));
            }

              allBookingGroups[x].dates.sort();

            for(y in allBookingGroups[x].dates) {
              allBookingGroups[x].dates[y] = new Date(allBookingGroups[x].dates[y]);
            }

            for(y in allBookingGroups[x].dates) {
              var date = moment(allBookingGroups[x].dates[y]);

              if(arrayOfDateArrays[counter].length == 0) {
                var date2 = date.subtract(1, 'days');
                arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
              } else {

                var date2 = date.subtract(1, 'days');

                if(moment(allBookingGroups[x].dates[parseInt(y-1)]).diff(date2) == 0) {

                  arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
                } else {
                  counter = counter + 1;
                  arrayOfDateArrays[counter] = [];
                  arrayOfDateArrays[counter].push(date.format('Do MMMM YYYY'));
                }
              }
            }

            obj.dateArray = arrayOfDateArrays;
            arrayOfObjects.push(obj);
          }
        }
      }

      bookingStatus.displayDates = arrayOfObjects;
      bookingStatus.totalDates = totalDatesToPut;

      var bookingStatusId = bookingStatus._id;

      delete bookingStatus._id;

      BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

      return returnObj;

    }
  },
updatePrice: function(bookingId) {

    var booking = Bookings.findOne({_id: bookingId});
    var total = 0;
    var noOfItems = 0;
    var gst = 0;
    var totalPaid = 0;
    for(x in booking.equipmentDetails) {
      var subDiscount = 0;
      var subTotal = 0;
      for(y in booking.equipmentDetails[x].items) {
        noOfItems += booking.equipmentDetails[x].items[y].booked;
        booking.equipmentDetails[x].items[y].subAmount = parseFloat((booking.equipmentDetails[x].items[y].originalPriced * (booking.equipmentDetails[x].items[y].rate + booking.equipmentDetails[x].items[y].discount)) + (booking.equipmentDetails[x].items[y].discountPriced * booking.equipmentDetails[x].items[y].rate));
        subTotal = parseFloat(subTotal + booking.equipmentDetails[x].items[y].subAmount);

        subDiscount += parseFloat((booking.equipmentDetails[x].items[y].discountPriced * booking.equipmentDetails[x].items[y].discount));
      }
      booking.equipmentDetails[x].subTotal = subTotal;
      total += subTotal;
      booking.equipmentDetails[x].subDiscount = subDiscount;
    }

    booking.noOfItems = parseInt(noOfItems);
    booking.gst = parseFloat(total * 0.07);
    booking.total = parseFloat(total + booking.gst);
    if(booking.payment.length != 0) {
      for(x in booking.payment) {
        totalPaid += parseFloat(booking.payment[x].amount);
      }

      booking.balanceDue = parseFloat(booking.total - totalPaid);
    } else {
      booking.balanceDue = parseFloat(booking.total);
    }

     var finalClash = false;
    for(s in booking.equipmentDetails) {
      for(d in booking.equipmentDetails[s].items) {
        if(booking.equipmentDetails[s].items[d].clash == true) {
          finalClash = true;
          break;
        }
      }
    }

    booking.clash = finalClash;

    delete booking._id;

    Bookings.update({_id: bookingId}, {$set: booking});
  },
  addGroup: function(bookingId) {

//     {
//     "_id" : "56e61e7b59120e55dbd154dd",
//     "subTotal" : 0,
//     "subDiscount" : 0,
//     "afterTotal" : 100,
//     "privilege" : {
//         "value" : 0,
//         "percentage" : 0,
//         "originalPercentage" : 0,
//         "edited" : false
//     },
//     "invoiceId" : "Dv8kLwYXRohQiMz5u",
//     "groupId" : 0,
//     "dates": [],
//     "noOfDates" : 0
// }


    var booking = Bookings.findOne({_id: bookingId});
    var bookingPrivilege = BookingPrivileges.findOne({invoiceId: bookingId});
    var bookingGroupsCount = BookingGroups.find({invoiceId: bookingId}).count();

    var bookingGroup = new Object();
    bookingGroup.subTotal = 0;
    bookingGroup.subDiscount = 0;
    bookingGroup.afterTotal = 0;
    bookingGroup.invoiceId = bookingId;
    bookingGroup.groupId = bookingGroupsCount;
    bookingGroup.dates = [];
    bookingGroup.noOfDates = 0;
    bookingGroup.privilege = new Object();
    bookingGroup.privilege.value = 0;
    if(bookingPrivilege == undefined) {
      bookingGroup.privilege.percentage = 0;
      bookingGroup.privilege.originalPercentage = 0;
    } else {
      bookingGroup.privilege.percentage = bookingPrivilege.value;
      bookingGroup.privilege.originalPercentage = bookingPrivilege.value;
    }
    bookingGroup.privilege.edited = false;

    // var log = new Object();
    // log.content = Meteor.user().username + " added Group #" + booking.equipmentDetails.length + ".";
    // log.owner = Meteor.user().username;
    // log.dateTime = new Date();
    // booking.logs.push(log);

    BookingGroups.insert(bookingGroup);

    var bookingGroupPrice = new Object();

    bookingGroupPrice.groupId = bookingGroupsCount;
    bookingGroupPrice.invoiceId = bookingId;
    bookingGroupPrice.subTotal = 0;
    bookingGroupPrice.subDiscount = 0;
    bookingGroupPrice.afterTotal = 0;
    bookingGroupPrice.privilege = new Object();
    bookingGroupPrice.privilege.value = 0;
    if(bookingPrivilege == undefined) {
      bookingGroupPrice.privilege.percentage = 0;
      bookingGroupPrice.privilege.originalPercentage = 0;
    } else {
      bookingGroupPrice.privilege.percentage = bookingPrivilege.value;
      bookingGroupPrice.privilege.originalPercentage = bookingPrivilege.value;
    }
    bookingGroupPrice.privilege.edited = false;

    BookingGroupPrices.insert(bookingGroupPrice);

    return (parseInt(bookingGroupsCount) + 1);
  },
  changeStatus: function(details) {

    var booking = Bookings.findOne({_id: details['bookingId']});
    var string = details['selectedId'].split("_");
    for(x in booking.equipmentDetails[string[0]].items) {
      if(booking.equipmentDetails[string[0]].items[x].id == details['selectedId']) {
        booking.equipmentDetails[string[0]].items[x].status = details['newState'];
      }
    }

    var finalClash = false;
    for(s in booking.equipmentDetails) {
      for(d in booking.equipmentDetails[s].items) {
        if(booking.equipmentDetails[s].items[d].clash == true) {
          finalClash = true;
          break;
        }
      }
    }

    booking.clash = finalClash;

    delete booking._id;
    Bookings.update({_id: details['bookingId']}, {$set: booking});
  },
  updateAvailability: function(details) {
    var booking = Bookings.findOne({_id: details['_id']});

    var string = details['id'].split("_");

    for(x in booking.equipmentDetails[string[0]].items) {
      if(booking.equipmentDetails[string[0]].items[x].id == details['id']) {
        booking.equipmentDetails[string[0]].items[x].availability = details['availability'];

        var log = new Object();
        log.content = Meteor.user().username + " marked " + booking.equipmentDetails[string[0]].items[x].item + " in Group #" + (parseInt(string[0])+1) + " to " + details['availability'] + ".";
        log.owner = Meteor.user().username;
        log.dateTime = new Date();
        booking.logs.push(log);
      }
    }

    delete booking._id;
    Bookings.update({_id: details['_id']}, {$set: booking});
  },
  deleteRemark: function(details) {

     var bookingGeneralRemarks = BookingGeneralRemarks.findOne({invoiceId: details.current});

     for(x in bookingGeneralRemarks.remarks) {
      if(bookingGeneralRemarks.remarks[x].id == details.remarkId) {
        // var remarkNumber = parseInt(details.remarkId) + 1;

        // var log = new Object();
        // log.content = Meteor.user().username + " removed Remark #" + remarkNumber + " - " + booking.remarks[x].remark + ".";
        // log.owner = Meteor.user().username;
        // log.dateTime = new Date();
        // booking.logs.push(log);

        bookingGeneralRemarks.remarks.splice(x, 1);
      }
     }

     for(x in bookingGeneralRemarks.remarks) {
      bookingGeneralRemarks.remarks[x].id = parseInt(x);
     }

     delete bookingGeneralRemarks._id;
     BookingGeneralRemarks.update({invoiceId: details.current}, {$set: bookingGeneralRemarks});
  }
});
