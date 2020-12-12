if(Meteor.isServer) {
  Meteor.methods({
    getCustomer:function(customerId){
      var customer = Customers.findOne({_id:customerId}); 
      return customer;
    },
    markAsRedCustomers:function(customerId,customerRemarks,markAsRed){
     if(!markAsRed){
      customerRemarks = '';
     }
    
      return(Customers.update(customerId,{$set:{markAsRed:markAsRed,remarks:customerRemarks}}));
    },

    findCustomerWithBooking:function(customerId){
      
      var noOfTransaction = BookingCustomers.find({customerId:customerId}).count();
      return (noOfTransaction);
    },

    removeCustomer:function(customerId){
      return(Customers.remove({_id:customerId}));
    },

    updateBookingStatus: function(invoiceId) {
    // this.unblock();

    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingSignOut = BookingSignOuts.findOne({invoiceId: invoiceId});
    var bookingPrice = BookingPrices.findOne({invoiceId: invoiceId});
    var checkClash = BookingLineItems.findOne({invoiceId: invoiceId, clash: true});

    var nextDay = moment().add(1, 'days').format("DD MM YYYY");
    var currentDay = moment().format("DD MM YYYY");
    var previousDay = moment().subtract(1, 'days').format("DD MM YYYY");


    var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId}).fetch();

    ///////////////////
    // CHECK CLASHED //
    ///////////////////

    bookingStatus.clash = false;
    if(checkClash != undefined) {
      bookingStatus.clash = true;
    }

    ////////////////////////
    // CHECK ACKNOWLEDGED //
    ////////////////////////
    bookingStatus.acknowledged = true;
    var checkAcknowledged = BookingAcknowledgeRemarks.findOne({invoiceId: invoiceId});
    for(x in checkAcknowledged.remarksRequiringAcknowledgement) {
      if(checkAcknowledged.remarksRequiringAcknowledgement[x].image == null) {
        bookingStatus.acknowledged = false;
        break;
      }
    }
    if(bookingStatus.acknowledged == true) {

      var checkAcknowledged = BookingSignOuts.findOne({invoiceId: invoiceId});

      for(x in checkAcknowledged.customerSignOut) {
        if(checkAcknowledged.customerSignOut[x].image == null) {
          bookingStatus.acknowledged = false;
          break;
        }
      }
    }
    if(bookingStatus.acknowledged == true) {

      var checkAcknowledged = BookingSignIns.findOne({invoiceId: invoiceId});

      for(x in checkAcknowledged.staffSignIn) {
        if(checkAcknowledged.staffSignIn[x].image == null) {
          bookingStatus.acknowledged = false;
          break;
        }
      }
    }

    ////////////////////
    // CHECK RESOLVED //
    ////////////////////
    bookingStatus.resolved = true;
    var checkResolved = BookingAcknowledgeRemarks.findOne({invoiceId: invoiceId});

    for(x in checkResolved.remarksRequiringAcknowledgement) {
      if(checkResolved.remarksRequiringAcknowledgement[x].resolved == false) {
        bookingStatus.resolved = false;
        break;
      }
    }

    ///////////////////////////////////////
    // CHECK PACKED & COLLECTED & RETURN //
    ///////////////////////////////////////
    var packed = null;
    var collected = true;
    var returnValue = null;
    for(x in bookingLineItems) {
      
      var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: parseInt(bookingLineItems[x].groupCounter)});
      var datesToCheck = [];

            for(y in bookingGroup.dates) {
                datesToCheck.push(moment(bookingGroup.dates[y]).subtract(1, 'days').format("DD MM YYYY")); 
            }

            if(datesToCheck.indexOf(nextDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
              // only has next day
              // good to go
        for(z in bookingLineItems[x].unclashableSerialNumbers) {
          if(bookingLineItems[x].unclashableSerialNumbers.length > 0) {
            if((packed == true || packed == null) && (bookingLineItems[x].unclashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Out")) {
              packed = true;
            } else {
              packed = false;
            }

            if(collected == true && bookingLineItems[x].unclashableSerialNumbers[z].status != "Out") {
              collected = false;
            }
          }
        }

        for(z in bookingLineItems[x].clashableSerialNumbers) {
          if(bookingLineItems[x].clashableSerialNumbers.length > 0) {
            if((packed == true || packed == null) && (bookingLineItems[x].clashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].clashableSerialNumbers[z].status == "Out")) {
              packed = true;
            } else {
              packed = false;
            }

            if(collected == true && bookingLineItems[x].clashableSerialNumbers[z].status != "Out") {
              collected = false;
            }
          }
        }
            }


            if(datesToCheck.indexOf(previousDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
              // only has next day
              // good to go
              for(z in bookingLineItems[x].unclashableSerialNumbers) {
                if(bookingLineItems[x].unclashableSerialNumbers.length > 0) {


                  if((returnValue == true || returnValue == null) && (bookingLineItems[x].unclashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Out" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Missing")) {
                    returnValue = true;
                  } else {
                    returnValue = false;
                  }
                }
              }
              for(z in bookingLineItems[x].clashableSerialNumbers) {
                if(bookingLineItems[x].clashableSerialNumbers.length > 0) {
                  if((returnValue == true || returnValue == null) && (bookingLineItems[x].clashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].clashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].clashableSerialNumbers[z].status == "Out" || bookingLineItems[x].clashableSerialNumbers[z].status == "Missing")) {
                    returnValue = true;
                  } else {
                    returnValue = false;
                  }
                }
              }
            }
    }

    bookingStatus.packed = packed;
    bookingStatus.collected = collected;
    bookingStatus.return = returnValue;

    //////////////////////////////////////////
    // CHECK OVERDUE & UNPAID & UNCOLLECTED //
    //////////////////////////////////////////
    var currentDay = moment();
        var yesterday = moment().subtract(1, 'days');

        var overdue = false;
    var unpaid = false;
    var uncollected = false;
    for(x in bookingLineItems) {
      var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: parseInt(bookingLineItems[x].groupCounter)});

      var datesToCheck = [];

            for(y in bookingGroup.dates) {
              datesToCheck.push(parseInt(moment(bookingGroup.dates[y]).subtract(1, 'days').format("x"))); 
            }

            datesToCheck.sort();

            for(y in datesToCheck) {
              datesToCheck[y] = moment(datesToCheck[y]);
            }

            var lastDay = datesToCheck[datesToCheck.length - 1];

            if(lastDay != undefined && lastDay.isBefore(currentDay)) {

              for(z in bookingLineItems[x].unclashableSerialNumbers) {
                if(bookingLineItems[x].unclashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Packed") {
                  uncollected = true;
                }
              }

              for(z in bookingLineItems[x].clashableSerialNumbers) {   
                if(bookingLineItems[x].clashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].clashableSerialNumbers[z].status == "Packed") {
                  uncollected = true;
                }
              }

              if(bookingSignOut.customerSignOut.length > 0  && parseInt(bookingPrice.balanceDue) > 0) {
                unpaid = true;
              }
            }

            if(lastDay != undefined && lastDay.isBefore(yesterday) && lastDay.format("DD MM YYYY") != yesterday.format("DD MM YYYY")) {
              if(overdue == false) {
                for(z in bookingLineItems[x].unclashableSerialNumbers) {
                  if(bookingLineItems[x].unclashableSerialNumbers[z].status == "Out" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Missing") {
                    overdue = true;
                  }
                }

                for(z in bookingLineItems[x].clashableSerialNumbers) {   
                  if(bookingLineItems[x].clashableSerialNumbers[z].status == "Out" || bookingLineItems[x].clashableSerialNumbers[z].status == "Missing") {
                    overdue = true;
                  }
                }
              }
            } 
    }

    bookingStatus.uncollected = uncollected;
    bookingStatus.unpaid = unpaid;
    bookingStatus.overdue = overdue;


    var bookingStatusId = bookingStatus._id;
    delete bookingStatus._id;

    BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

    return bookingStatus.displayDates;
  },
  addQuantityToBookingLineItem: function(details) {

    var bookingLineItemId = details['id'];
    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
    var groupCounter = parseInt(bookingLineItem.groupCounter);
    var invoiceId = details['_id'];
    var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingPrice = BookingPrices.findOne({invoiceId: invoiceId});
    var booking = Bookings.findOne({_id: invoiceId});
    var customer = Customers.findOne({_id: bookingCustomer.customerId});
    var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupCounter});
    var returnObject = new Object();
    var itemId = bookingLineItem.itemId;
    var inventoryItem = Inventory.findOne({_id: itemId});

    var datesArray = [];
    var dateTimeArray = [];

    var arrayToBeReturned = [];
    var arrayToBeReturnedDigits = [];

    // CHECK IF BOOKED EQUALS TOTAL
    if(bookingLineItem.booked == bookingLineItem.total) {
      returnObject.status = "BookedEqualsTotal";

      return returnObject;
    }

    // FIND AVAILABLE EQUIPMENTS ON THESE DATES
    // CHECK WHETHER THERE IS STILL AVAILABLE QUANTITY LEFT TO ADD
    for(x in bookingGroup.dates) {
      datesArray.push(moment(bookingGroup.dates[x]).subtract(1, 'days').format("DD MM YYYY"));
      dateTimeArray.push(moment(bookingGroup.dates[x])._d);
    }

    var availableEquipments = [];

    for(x in datesArray) {
      var quantityToMinus = 0;
      var datesToMinus = [];
      datesToMinus.push(datesArray[x]);

      var equipmentCalendarsToMinus = EquipmentCalendars.find({equipmentId: itemId, dates: {$in: datesToMinus}}, {fields:{booked: 1}}).fetch();
      for(y in equipmentCalendarsToMinus) {
        quantityToMinus += equipmentCalendarsToMinus[y].booked;
      }


      var avail = new Object();
      avail.date = datesArray[x];
      avail.dateTime = dateTimeArray[x];
      avail.itemId = itemId;
      avail.remainingQuantity = inventoryItem.bookableQuantity - quantityToMinus;

      availableEquipments.push(avail);
    }

    for(x in availableEquipments) {
      if(availableEquipments[x].remainingQuantity == 0) {
        returnObject.status = "Overbooked";
        if(Meteor.absoluteUrl() == 'http://localhost:3000/') {
          arrayToBeReturned.push(moment(availableEquipments[x].dateTime).subtract(1,'days').format("Do MMMM YYYY"));
          arrayToBeReturnedDigits.push(availableEquipments[x].date);
        } else {
          arrayToBeReturned.push(moment(availableEquipments[x].dateTime).format("Do MMMM YYYY"));
          arrayToBeReturnedDigits.push(availableEquipments[x].date);
        }
      }
    }

    if(returnObject.status == "Overbooked") {

      returnObject.dates = arrayToBeReturned;
      returnObject.datesDigits = arrayToBeReturnedDigits;
      returnObject.inventoryItem = inventoryItem;

      return returnObject;
    }

    bookingLineItem.booked += 1;

    // CHECK INVENTORY ITEM TO SEE WHAT SERIAL NUMBERS ARE AVAILABLE
    var availableSerialNumbers = [];
    var statuses = ["Sent For Repair", "Missing", "Damaged"];
    for(x in inventoryItem.serialNo) {
      if(statuses.indexOf(inventoryItem.serialNo[x].status) == -1) {
        availableSerialNumbers.push(inventoryItem.serialNo[x].serialNo);
      }
    }

    var individualFormattedDates = [];
    var individualDates = bookingGroup.dates;

    for(x in individualDates) {
      individualDates[x] = parseInt(moment(individualDates[x]).format("x"));
    }

    individualDates.sort();

    for(x in individualDates) {
      individualDates[x] = moment(individualDates[x]).subtract(1, "days")._d;
    }

    var dateArray = [];
    var monthArray = [];
    var dateArrayMoment = [];
    var clashableSerialNumbers = [];
    var unclashableSerialNumbers = [];
    var counter = 0;
    var booked = 0;
    dateArray[counter] = [];
    monthArray[counter] = [];
    dateArrayMoment[counter] = [];
    var equipmentCalendarIdArray = [];

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

    // CHECK EQUIPMENT CAELNDARS THAT ARE IN THE DATE RANGE CONTAINING THE ITEM
    var equipmentCalendars = EquipmentCalendars.find({equipmentId: itemId, dates: {$in: individualFormattedDates}}).fetch();

    // console.log("equipmentCalendars");
    // console.log(equipmentCalendars);

    // CHECK CLASHABLE AND UNCLASHABLE SERIAL NUMBERS
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
      }
    }

    // console.log("equipmentCalendarIdArray");
    // console.log(equipmentCalendarIdArray);

    for(x in availableSerialNumbers) {
      if(clashableSerialNumbers.indexOf(availableSerialNumbers[x]) == -1) {
        unclashableSerialNumbers.push(availableSerialNumbers[x]);
      }
    }

    var checkedEquipmentCalendars = EquipmentCalendars.find({serialNumbers: {$in: clashableSerialNumbers}, dates: {$in: datesArray}}, {fields: {serialNumbers: 1}}).fetch();

    var theseserialnumbersmustcheck = [];

    for(ab in checkedEquipmentCalendars) {
      for(ac in checkedEquipmentCalendars[ab].serialNumbers) {
        if(theseserialnumbersmustcheck.indexOf(checkedEquipmentCalendars[ab].serialNumbers[ac]) == -1) {
          theseserialnumbersmustcheck.push(checkedEquipmentCalendars[ab].serialNumbers[ac]);
        }
      }
    }

    for(ad = clashableSerialNumbers.length; ad >= 0; ad--) {
      if(theseserialnumbersmustcheck.indexOf(clashableSerialNumbers[ad]) != -1) {


          var takenOutSerialNumber = clashableSerialNumbers.splice(ad, 1);


          clashableSerialNumbers.push(takenOutSerialNumber[0]);

      }
    }

    // ADD TO EQUIPMENT CALENDAR
    // MUST CHECK WHETHER THERE ARE AVAILABLE SERIAL NUMBERS FIRST. IF NOT SHOULDN'T GO HERE
    var update = false;
    var currentEquipmentCalendar;
    var currentEquipmentCalendarArray = [];
    var originalEquipmentCalendarArray = [];
    var clashEquipmentCalendarArray = [];
    var clashSerialNumbers = [];
    var serialNumber;
    var newEquipmentCalendarIdArray = [];
    var newInsertedEquipmentCalendarIdArray = [];
    var clashOrUnclash;
    var insertedEquipmentCalendarIdArray = [];

    if(EquipmentCalendars.findOne({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId}) != undefined) {
      update = true;
      currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId}).fetch();
    } else {
      update = false;
    }

    // console.log("update");
    // console.log(update);

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
        currentEquipmentCalendarArray[x].title = customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item;
        currentEquipmentCalendarArray[x].customerName = customer.name;
        currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
        currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
        currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
        currentEquipmentCalendarArray[x].type = bookingStatus.type;
        currentEquipmentCalendarArray[x].customerId = bookingCustomer.customerId;
        currentEquipmentCalendarArray[x].bookingLineItemId = bookingLineItemId;
        currentEquipmentCalendarArray[x].url = "bookings/" + invoiceId;
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
          customerId: bookingCustomer.customerId,
          bookingLineItemId: bookingLineItemId,
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

    if(bookingLineItem.packageClicked != undefined) { //there is a package
      var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});

      for(y in customerPackage.items) {
        if(customerPackage.items[y].id == bookingLineItem.itemId) {
          // CHECK WHETHER CUSTOMER PACKAGE HAS ENOUGH ITEMS
          if(customerPackage.items[y].quantity - bookingLineItem.days > 0) {
            bookingLineItem.discountPriced += bookingLineItem.days;
            customerPackage.items[y].quantity -= bookingLineItem.days;
          } else { // NOT ENOUGH IN CUSTOMER PACKAGE
            bookingLineItem.discountPriced += customerPackage.items[y].quantity;
            bookingLineItem.originalPriced += bbookingLineItem.days - customerPackage.items[y].quantity;
            customerPackage.items[y].quantity = 0;
          }
        }
      }

      // CHECK WHETHER BOOKING NEED TO ADD
      if(bookingLineItem.discountPriced > 0 && bookingStatus.customerPackagesUsed.indexOf(groupCounter+"_"+bookingLineItem.packageClicked) == -1) {
        bookingStatus.customerPackagesUsed.push(groupCounter+"_"+bookingLineItem.packageClicked);
      }

      var exists = false;
      var exists2 = false;

      for(a in bookingStatus.customerPackagesUsed) {
        var string2 = bookingStatus.customerPackagesUsed[a].split("_");
        if(string2[1] == bookingLineItem.packageClicked) {
          exists = true;
        }
      }

      // WE KNOW THAT CUSTOMER PACKAGE IS STILL BEING USED
      if(!exists) {
        for(b in customerPackage.bookings) {
          if(customerPackage.bookings[b].id == invoiceId) {
            customerPackage.bookings.splice(b,1);
          }
        }
      } else {
        for(b in customerPackage.bookings) {
          if(customerPackage.bookings[b].id == invoiceId) {
            exists2 = true;
          }
        }
        if(exists2 == false) {
          var obj = new Object();
          obj.id = invoiceId;
          obj.total = bookingPrice.total;
          obj.createdAt = booking.createdAt;

          customerPackage.bookings.push(obj);
        }
      }

      delete customerPackage._id;
      CustomerPackages.update({_id: bookingLineItem.packageClicked}, {$set: customerPackage});

    } else { // NO PACKAGE
      bookingLineItem.originalPriced += bookingLineItem.days;
    }

    for(x = (equipmentCalendarIdArray.length -1); x >= 0; x--) {
      if(insertedEquipmentCalendarIdArray.indexOf(equipmentCalendarIdArray[x]) != -1) {
        equipmentCalendarIdArray.splice(x, 1);
      }
    }

    // console.log("equipmentCalendarIdArray");
    // console.log(equipmentCalendarIdArray);

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

    // console.log("insertedEquipmentCalendarIdArray");
    // console.log(insertedEquipmentCalendarIdArray);

    // console.log("newDates");
    // console.log(newDates);

    for(x in insertedEquipmentCalendarIdArray) {
      var calId = EquipmentCalendars.findOne({_id: insertedEquipmentCalendarIdArray[x]});

      calId.dates.unshift(moment(calId.startDate).subtract(2, 'days').format("DD MM YYYY"));
      calId.dates.push(moment(calId.endDate).format("DD MM YYYY"));

      // console.log("calId.dates");
      // console.log(calId.dates);

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

    // console.log("newEquipmentCalendarIdArray");
    // console.log(newEquipmentCalendarIdArray);

    // console.log("newInsertedEquipmentCalendarIdArray");
    // console.log(newInsertedEquipmentCalendarIdArray);

    if(clashOrUnclash == "Unclash") {
      var obj = new Object();
      obj.serialNo = serialNumber;
      obj.status = "N/A";
      obj.itemId = bookingLineItem.itemId;
      obj.groupId = groupCounter;
      bookingLineItem.unclashableSerialNumbers.push(obj);
    } else {
      var obj = new Object();
      obj.serialNo = serialNumber;
      obj.status = "N/A";
      obj.itemId = bookingLineItem.itemId;
      obj.groupId = groupCounter;
      obj.clashCalendars = [];
      obj.clashCalendars = obj.clashCalendars.concat(newEquipmentCalendarIdArray);
      obj.originalCalendars = [];
      obj.originalCalendars = obj.originalCalendars.concat(newInsertedEquipmentCalendarIdArray);

      bookingLineItem.clashableSerialNumbers = bookingLineItem.clashableSerialNumbers.concat(obj);
      bookingLineItem.clash = true;
    }

    delete bookingLineItem._id;
    BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItem});

    if(clashOrUnclash == "Clash") {
      for(x in equipmentCalendars) {
        if(equipmentCalendars[x].serialNumbers.indexOf(serialNumber) != -1) {
          var bookingLineItem = BookingLineItems.findOne({_id: equipmentCalendars[x].bookingLineItemId});
         
          for(z in bookingLineItem.unclashableSerialNumbers) {
            if(bookingLineItem.unclashableSerialNumbers[z].serialNo == serialNumber) {
              var obj = new Object();
              obj.serialNo = serialNumber;
              obj.status = bookingLineItem.unclashableSerialNumbers[z].status;
              obj.clashCalendars = [];
              obj.clashCalendars = obj.clashCalendars.concat(newInsertedEquipmentCalendarIdArray);
              obj.originalCalendars = [];
              obj.originalCalendars = obj.originalCalendars.concat(newEquipmentCalendarIdArray);
              obj.groupId = bookingLineItem.unclashableSerialNumbers[z].groupId;
              obj.itemId = bookingLineItem.itemId;
              bookingLineItem.clashableSerialNumbers = bookingLineItem.clashableSerialNumbers.concat(obj);
              bookingLineItem.clash = true;

              bookingLineItem.unclashableSerialNumbers.splice(z, 1);

              delete bookingLineItem._id;
              BookingLineItems.update({_id: equipmentCalendars[x].bookingLineItemId}, {$set: bookingLineItem});

              Meteor.call("updateBookingStatus", equipmentCalendars[x].invoiceId);

              break;
            }
          }
        }

      }
    }


    returnObject.status = "OK";

    return returnObject;
  },
    minusQuantityToBookingLineItem: function(details) {
      var bookingLineItemId = details['id'];
      var serialNo;
      var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
      var groupCounter = parseInt(bookingLineItem.groupCounter);
      var invoiceId = details['_id'];
      details.dates = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupCounter}).dates;
      var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
      var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
      var bookingPrice = BookingPrices.findOne({invoiceId: invoiceId});
      var booking = Bookings.findOne({_id: invoiceId});
      var customer = Customers.findOne({_id: bookingCustomer.customerId});
      var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupCounter});
      var returnObject = new Object();
      var itemId = bookingLineItem.itemId;
      var inventoryItem = Inventory.findOne({_id: itemId});

      if(bookingLineItem.booked == 0) {
        returnObject.status = "MinusNoMore";

        return retunObject;
      }

      var datesArray = [];
      var dateTimeArray = [];

      var arrayToBeReturned = [];
      var arrayToBeReturnedDigits = [];

      // FIND AVAILABLE EQUIPMENTS ON THESE DATES
      // ADD QUANTITIES BACK
      for(x in bookingGroup.dates) {
        datesArray.push(moment(bookingGroup.dates[x]).subtract(1, 'days').format("DD MM YYYY"))
      }

      bookingLineItem.booked -= 1;

      // CHECK CLASHES AND IF THERE ARE
      // PUT IT BACK IN UNCLASHABLE VALUE
      var clashableObject;

      if(bookingLineItem.clashableSerialNumbers.length != 0) {
        clashableObject = bookingLineItem.clashableSerialNumbers.pop();
        serialNo = clashableObject.serialNo;

        for(b in clashableObject.clashCalendars) {
          var equipmentCalendarClash = EquipmentCalendars.findOne({_id: clashableObject.clashCalendars[b]});
          if(equipmentCalendarClash != undefined) {
            var clashBookingLineItemId = equipmentCalendarClash.bookingLineItemId;
            var clashBookingLineItem = BookingLineItems.findOne({_id: clashBookingLineItemId});

            for(c in clashBookingLineItem.clashableSerialNumbers) {

              if(clashBookingLineItem.clashableSerialNumbers[c].serialNo == clashableObject.serialNo) {
                var obj = new Object();
                obj.serialNo = clashBookingLineItem.clashableSerialNumbers[c].serialNo;
                obj.status = clashBookingLineItem.clashableSerialNumbers[c].status;
                obj.itemId = clashBookingLineItem.itemId;
                obj.groupId = parseInt(clashBookingLineItem.groupCounter);

                clashBookingLineItem.unclashableSerialNumbers.push(obj);
                clashBookingLineItem.clashableSerialNumbers.splice(c, 1);
                if(clashBookingLineItem.clashableSerialNumbers.length == 0)
                  clashBookingLineItem.clash = false;

                delete clashBookingLineItem._id;
                BookingLineItems.update({_id: clashBookingLineItemId}, {$set: clashBookingLineItem});
                Meteor.call("updateBookingStatus", clashBookingLineItem.invoiceId);
              }
            }
          }
        }
        if(bookingLineItem.clashableSerialNumbers.length == 0 && bookingLineItem.clash != "false") {
          bookingLineItem.clash = false;
        }
      } else {
        var popped = bookingLineItem.unclashableSerialNumbers.pop();
        serialNo = popped.serialNo;
      }

      // CUSTOMER PACKAGES
      // if(bookingLineItem.packageClicked != undefined) {
      //   if(bookingLineItem.discountPriced > 0) {
      //     var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});

      //     for(c in customerPackage.items) {
      //       if(customerPackage.items[c].id == string[1]) {
      //         // CHECK HOW MANY I NEED TO ADD BACK TO CUSTOMER PACKAGE

      //         // WILL HAVE EXTRA DISCOUNTED
      //         if(bookingLineItem.discountPriced > bookingLineItem.days) {
      //           // SUBTRACT DAYS
      //           bookingLineItem.discountPriced -= bookingLineItem.days;
      //           customerPackage.items[c].quantity += bookingLineItem.days;

      //         } else {
      //           // SUBTRACT WHATEVER DISCOUNT PRICED
      //           customerPackage.items[c].quantity += bookingLineItem.discountPriced;
      //           bookingLineItem.originalPriced = bookingLineItem.days - bookingLineItem.discountPriced;
      //           bookingLineItem.discountPriced = 0;
      //         }

      //         break;
      //       }
      //     }

      //     delete customerPackage._id;
      //     CustomerPackages.update({_id: bookingLineItem.packageClicked}, {$set: customerPackage});
      //   } else if(bookingLineItem.originalPriced > 0){
      //     bookingLineItem.originalPriced -= bookingLineItem.days;
      //   }
      // } else {
      //   bookingLineItem.originalPriced -= bookingLineItem.days;
      // }

      // because no packages
      bookingLineItem.originalPriced -= bookingLineItem.days;

      delete bookingLineItem._id;
      BookingLineItems.update({_id: details['id']}, {$set: bookingLineItem});

      // AFFECT CALENDAR
      var currentEquipmentCalendarArray = [];

      currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId}).fetch();

      var inventoryItem = Inventory.findOne({_id: itemId});
      var serialNumbersArray = [];
      var booked = bookingLineItem.booked;

      for(z in bookingLineItem.unclashableSerialNumbers) {
        serialNumbersArray.push(bookingLineItem.unclashableSerialNumbers[z].serialNo);
      }
      for(z in bookingLineItem.clashableSerialNumbers) {
        serialNumbersArray.push(bookingLineItem.clashableSerialNumbers[z].serialNo);
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

          currentEquipmentCalendarArray[x].invoiceId = invoiceId;
          currentEquipmentCalendarArray[x].title = customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item;
          currentEquipmentCalendarArray[x].customerName = customer.name;
          currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
          currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
          currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
          currentEquipmentCalendarArray[x].customerId = bookingCustomer.customerId;
          currentEquipmentCalendarArray[x].bookingLineItemId = bookingLineItemId;
          currentEquipmentCalendarArray[x].url = "bookings/" + invoiceId;
          currentEquipmentCalendarArray[x].serialNumbers = serialNumbersArray;
          currentEquipmentCalendarArray[x].booked = booked;
          currentEquipmentCalendarArray[x].months = monthArray;
          currentEquipmentCalendarArray[x].dates = dateArray[x];

          delete currentEquipmentCalendarArray[x]._id;
          EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});
        }
      } else {
        EquipmentCalendars.remove({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId});
      }

      returnObject.serialNo = serialNo;
      return returnObject;
    },
    printPdf: function(pdf) {
        

        // var printers = Printer.list();
        // console.log(printers);

        // var printer = new Printer('psts');
        // console.log(printer);

        // var text = 'Print text directly, when needed: e.g. barcode printers'
        // var jobFromText = printer.printText(text);
    },
    pendingInvoiceSync: function(bookingId) {
      var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
      bookingUpdate.status = "Syncing";

      delete bookingUpdate._id;
      BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
    },
    checkFutureAffectedBookings: function(itemAttributes) {
      this.unblock();

      var itemCounter;

      var inventoryFind = Inventory.findOne({_id: itemAttributes._id});
      if(!itemAttributes.target) {
        for(aa in inventoryFind.serialNo) {
          if(inventoryFind.serialNo[aa].serialNo == itemAttributes.serialNo) {
            itemCounter = aa;
            break;
          }
        } 
      }

      var equipmentId = itemAttributes._id;
      var serialNo;
      if(itemAttributes.target) {
        serialNo = itemAttributes.serialNo[itemAttributes.target].serialNo;
      } else {
        serialNo = itemAttributes.serialNo;
      }

      // var moment

      var serialNoArray = [];
      serialNoArray.push(serialNo);
      var affectedBookings = [];
      var inventoryItem = Inventory.findOne({_id: equipmentId});

      if(itemAttributes.status == "Available") {
        inventoryItem.bookableQuantity += 1;

        var affectedBookingsArray = [];

        for(x in inventoryItem.serialNo[itemAttributes.target].affectedBookings) {
          affectedBookingsArray.push(inventoryItem.serialNo[itemAttributes.target].affectedBookings[x].invoiceId);
        }

        // check for affected bookings
        var bookingStatuses = BookingStatuses.find({invoiceId: {$in: affectedBookingsArray}}).fetch();
        for(x in bookingStatuses) {
          for(y in bookingStatuses[x].affectedItems) {
            if(bookingStatuses[x].affectedItems[y].item == inventoryItem.queryName) {
              for(z = (bookingStatuses[x].affectedItems[y].serialNo.length -1); z >= 0; z--) {
                if(bookingStatuses[x].affectedItems[y].serialNo[z].serialNo == serialNo) {
                  bookingStatuses[x].affectedItems[y].serialNo.splice(z, 1);
                }
              }

              if(bookingStatuses[x].affectedItems[y].serialNo.length == 0) {
                bookingStatuses[x].affectedItems.splice(y, 1);
              }

              

              var bookingStatusId = bookingStatuses[x]._id;

              delete bookingStatuses[x]._id;
              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatuses[x]});
              break;
            }
          }
        }
      } else {

        var equipmentCalendars = EquipmentCalendars.find({equipmentId: equipmentId, serialNumbers: {$in: serialNoArray}, endDate: {$gte: new Date(moment(new Date()).add(1, 'days'))}}, {fields: {bookingLineItemId: 1, invoiceId: 1}}).fetch();

        for(x in equipmentCalendars) {
          var affectedBooking = new Object();
          affectedBooking.invoiceId = equipmentCalendars[x].invoiceId;
          affectedBooking.groupId = BookingLineItems.findOne({_id: equipmentCalendars[x].bookingLineItemId}).groupCounter;

          var found = false;
          for(y in affectedBookings) {
            if(affectedBookings[y].invoiceId == equipmentCalendars[x].invoiceId && affectedBookings[y].groupId == BookingLineItems.findOne({_id: equipmentCalendars[x].bookingLineItemId}).groupCounter) {
              found = true;
            }
          }
          if(!found) {
            affectedBookings.push(affectedBooking);
          }
        }

        if(itemAttributes['originalStatus'] == "Missing" || itemAttributes['originalStatus'] == "Damaged" || itemAttributes['originalStatus'] == "Sent For Repair") {
          
        } else {
          inventoryItem.bookableQuantity -= 1;
        }

        for(x in affectedBookings) {
          var bookingStatus = BookingStatuses.findOne({invoiceId: affectedBookings[x].invoiceId});

          if(bookingStatus.affectedItems == undefined) {
            bookingStatus.affectedItems = [];

            var affectedItem = new Object();
            affectedItem.item = inventoryItem.queryName;
            affectedItem.serialNo = [];
            var serialNoObject = new Object();
            serialNoObject.serialNo = serialNo;
            serialNoObject.serialGroup = affectedBookings[x].groupId;
            serialNoObject.status = itemAttributes.status;

            affectedItem.serialNo.push(serialNoObject);

            bookingStatus.affectedItems.push(affectedItem);

            var bookingStatusId = bookingStatus._id;

            delete bookingStatus._id;
            BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});
          } else {
            var done = false;
            for(y in bookingStatus.affectedItems) {
              if(bookingStatus.affectedItems[y].item == inventoryItem.queryName) {
                var serialNoObject = new Object();
                serialNoObject.serialNo = serialNo;
                serialNoObject.serialGroup = affectedBookings[x].groupId;
                serialNoObject.status = itemAttributes.status;

                bookingStatus.affectedItems[y].serialNo.push(serialNoObject);
                
                var bookingStatusId = bookingStatus._id;

                delete bookingStatus._id;
                BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

                done = true;
                break;
              }
            }

            if(!done) {
              var affectedItem = new Object();
              affectedItem.item = inventoryItem.queryName;
              affectedItem.serialNo = [];
              var serialNoObject = new Object();
              serialNoObject.serialNo = serialNo;
              serialNoObject.serialGroup = affectedBookings[x].groupId;
              serialNoObject.status = itemAttributes.status;

              affectedItem.serialNo.push(serialNoObject);

              bookingStatus.affectedItems.push(affectedItem);

              var bookingStatusId = bookingStatus._id;

              delete bookingStatus._id;
              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});
            }
          }
        }
      }


      inventoryItem.serialNo[itemAttributes.target].affectedBookings = affectedBookings;


      inventoryItem.serialNo[itemAttributes.target].status = itemAttributes.status;

      delete inventoryItem._id;

      Inventory.update({_id: equipmentId}, {$set: inventoryItem});
    },
    syncinvoices: function() {
var bookings = Bookings.find().fetch();

      for(e in bookings) {
            var invoiceId = bookings[e]._id;
            var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});

            if(bookingStatus != undefined) {
              var bookingSignOut = BookingSignOuts.findOne({invoiceId: invoiceId});
              var bookingPrice = BookingPrices.findOne({invoiceId: invoiceId});
              var checkClash = BookingLineItems.findOne({invoiceId: invoiceId, clash: true});

              var nextDay = moment().add(1, 'days').format("DD MM YYYY");
                  var currentDay = moment().format("DD MM YYYY");
                  var previousDay = moment().subtract(1, 'days').format("DD MM YYYY");


                  var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId}).fetch();

                  ///////////////////
              // CHECK CLASHED //
              ///////////////////
              bookingStatus.clash = false;
              if(checkClash != undefined) {
                bookingStatus.clash = true;
              }

              ////////////////////////
              // CHECK ACKNOWLEDGED //
              ////////////////////////
              bookingStatus.acknowledged = true;
              var checkAcknowledged = BookingAcknowledgeRemarks.findOne({invoiceId: invoiceId});
              for(x in checkAcknowledged.remarksRequiringAcknowledgement) {
                if(checkAcknowledged.remarksRequiringAcknowledgement[x].image == null) {
                  bookingStatus.acknowledged = false;
                  break;
                }
              }
              if(bookingStatus.acknowledged == true) {

                var checkAcknowledged = BookingSignOuts.findOne({invoiceId: invoiceId});

                for(x in checkAcknowledged.customerSignOut) {
                  if(checkAcknowledged.customerSignOut[x].image == null) {
                    bookingStatus.acknowledged = false;
                    break;
                  }
                }
              }
              if(bookingStatus.acknowledged == true) {

                var checkAcknowledged = BookingSignIns.findOne({invoiceId: invoiceId});

                for(x in checkAcknowledged.staffSignIn) {
                  if(checkAcknowledged.staffSignIn[x].image == null) {
                    bookingStatus.acknowledged = false;
                    break;
                  }
                }
              }

              ////////////////////
              // CHECK RESOLVED //
              ////////////////////
              bookingStatus.resolved = true;
              var checkResolved = BookingAcknowledgeRemarks.findOne({invoiceId: invoiceId});

              for(x in checkResolved.remarksRequiringAcknowledgement) {
                if(checkResolved.remarksRequiringAcknowledgement[x].resolved == false) {
                  bookingStatus.resolved = false;
                  break;
                }
              }

              ///////////////////////////////////////
              // CHECK PACKED & COLLECTED & RETURN //
              ///////////////////////////////////////
              var packed = null;
              var collected = true;
              var returnValue = null;
              for(x in bookingLineItems) {
                
                if(bookingLineItems[x] != undefined) {
                  var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: parseInt(bookingLineItems[x].groupCounter)});
                var datesToCheck = [];

                      for(y in bookingGroup.dates) {
                          datesToCheck.push(moment(bookingGroup.dates[y]).subtract(1, 'days').format("DD MM YYYY")); 
                      }

                      if(datesToCheck.indexOf(nextDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
                        // only has next day
                        // good to go
                  for(z in bookingLineItems[x].unclashableSerialNumbers) {
                    if(bookingLineItems[x].unclashableSerialNumbers.length > 0) {
                      if((packed == true || packed == null) && (bookingLineItems[x].unclashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Out")) {
                        packed = true;
                      } else {
                        packed = false;
                      }

                      if(collected == true && bookingLineItems[x].unclashableSerialNumbers[z].status != "Out") {
                        collected = false;
                      }
                    }
                  }

                  for(z in bookingLineItems[x].clashableSerialNumbers) {
                    if(bookingLineItems[x].clashableSerialNumbers.length > 0) {
                      if((packed == true || packed == null) && (bookingLineItems[x].clashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].clashableSerialNumbers[z].status == "Out")) {
                        packed = true;
                      } else {
                        packed = false;
                      }

                      if(collected == true && bookingLineItems[x].clashableSerialNumbers[z].status != "Out") {
                        collected = false;
                      }
                    }
                  }
                }


                if(datesToCheck.indexOf(previousDay) != -1 && datesToCheck.indexOf(currentDay) == -1) {
                  // only has next day
                  // good to go
                  for(z in bookingLineItems[x].unclashableSerialNumbers) {
                    if(bookingLineItems[x].unclashableSerialNumbers.length > 0) {


                      if((returnValue == true || returnValue == null) && (bookingLineItems[x].unclashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Out" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Missing")) {
                        returnValue = true;
                      } else {
                        returnValue = false;
                      }
                    }
                  }
                  for(z in bookingLineItems[x].clashableSerialNumbers) {
                    if(bookingLineItems[x].clashableSerialNumbers.length > 0) {
                      if((returnValue == true || returnValue == null) && (bookingLineItems[x].clashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].clashableSerialNumbers[z].status == "Packed" || bookingLineItems[x].clashableSerialNumbers[z].status == "Out" || bookingLineItems[x].clashableSerialNumbers[z].status == "Missing")) {
                        returnValue = true;
                      } else {
                        returnValue = false;
                      }
                    }
                  }
                }
                }
                
              }

              bookingStatus.packed = packed;
              bookingStatus.collected = collected;
              bookingStatus.return = returnValue;

              //////////////////////////////////////////
              // CHECK OVERDUE & UNPAID & UNCOLLECTED //
              //////////////////////////////////////////
              var currentDay = moment();
                  var yesterday = moment().subtract(1, 'days');

                  var overdue = false;
              var unpaid = false;
              var uncollected = false;
              for(x in bookingLineItems) {
                if(bookingLineItems[x] != undefined) {
                  var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: parseInt(bookingLineItems[x].groupCounter)});
                var datesToCheck = [];

                      for(y in bookingGroup.dates) {
                        datesToCheck.push(parseInt(moment(bookingGroup.dates[y]).subtract(1, 'days').format("x"))); 
                      }

                      datesToCheck.sort();

                      for(y in datesToCheck) {
                        datesToCheck[y] = moment(datesToCheck[y]);
                      }

                      var lastDay = datesToCheck[datesToCheck.length - 1];

                      var firstDay = datesToCheck[0];

                      if(lastDay != undefined && lastDay.isBefore(currentDay)) {
                        if(bookingSignOut.customerSignOut.length > 0  && parseInt(bookingPrice.balanceDue) > 0) {
                          unpaid = true;
                        }
                      }

                      if(firstDay != undefined && firstDay.isBefore(currentDay)) {
                        if(bookingLineItems[x] != undefined) {
                          for(z in bookingLineItems[x].unclashableSerialNumbers) {
                            if(bookingLineItems[x].unclashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Packed") {
                              uncollected = true;
                            }
                          }

                          for(z in bookingLineItems[x].clashableSerialNumbers) {   
                            if(bookingLineItems[x].clashableSerialNumbers[z].status == "N/A" || bookingLineItems[x].clashableSerialNumbers[z].status == "Packed") {
                              uncollected = true;
                            }
                          }
                        }
                      }

                      if(lastDay != undefined && lastDay.isBefore(yesterday) && lastDay.format("DD MM YYYY") != yesterday.format("DD MM YYYY")) {
                        if(overdue == false) {
                          for(z in bookingLineItems[x].unclashableSerialNumbers) {
                            if(bookingLineItems[x].unclashableSerialNumbers[z].status == "Out" || bookingLineItems[x].unclashableSerialNumbers[z].status == "Missing") {
                              overdue = true;
                            }
                          }

                          for(z in bookingLineItems[x].clashableSerialNumbers) {   
                            if(bookingLineItems[x].clashableSerialNumbers[z].status == "Out" || bookingLineItems[x].clashableSerialNumbers[z].status == "Missing") {
                              overdue = true;
                            }
                          }
                        }
                      } 
                }
                
              }

              bookingStatus.uncollected = uncollected;
              bookingStatus.unpaid = unpaid;
              bookingStatus.overdue = overdue;


              var bookingStatusId = bookingStatus._id;
              delete bookingStatus._id;

              BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});
            }
      }
    },
    checkOverbooked: function(details) {

    var invoiceId = details['_id'];
    var groupId = parseInt(details['id']);
    var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupId, itemId: {$ne: -1}}, {fields: {itemId: 1, booked: 1}}).fetch();
    var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId}, {fields: {customerId: 1}});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupId});
    var customer = Customers.findOne({_id: bookingCustomer.customerId});
    var allDates = details['dates'];
    var addedDates = details['addedDates'];

    var availableEquipments;

    var itemToCheckArray = [];
    var itemArrayForAvailable = [];

    for(x in bookingLineItems) {
      itemToCheckArray[bookingLineItems[x].itemId] = bookingLineItems[x].booked;
      itemArrayForAvailable.push(bookingLineItems[x].itemId);
    }

    var dateArray = [];
    var dateDigitArray = [];
    var dateMomentArray = [];
    var calendarDateMomentArray = [];
    var addedDateDigitArray = [];

    for(x in addedDates) {
      var dateMoment = moment(addedDates[x]);
      dateArray[x] = dateMoment._d;
      dateDigitArray[x] = dateMoment.format("DD MM YYYY");
      dateMomentArray[x] = dateMoment;
      calendarDateMomentArray[x] = dateMoment;
      addedDateDigitArray[x] = dateMoment.format("DD MM YYYY");
    }

    availableEquipments = AvailableEquipments.find({date: {$in: dateDigitArray}, itemId: {$in: itemArrayForAvailable}}, {sort: {dateTime: 1}}).fetch();

    var overbookedResult = new Object();
    var equipmentCalendarDates = [];
    var inventoryItemIds = [];

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
          overbookedResult[inventoryItem.brand+" "+inventoryItem.item].dates.push(moment(availableEquipments[x].dateTime).subtract(1, 'days').format("Do MMMM YYYY"));
        } else {
          overbookedResult[inventoryItem.brand+" "+inventoryItem.item].dates.push(moment(availableEquipments[x].dateTime).subtract(1, 'days').format("Do MMMM YYYY"));
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

    var returnObj = new Object();
    returnObj.status = "OverbookedOK";

    return returnObj;
  },
    checkDateClashes: function(details) {
      var invoiceId = details['_id'];
      var groupId = parseInt(details['id']);
      var bookingLineItems = BookingLineItems.find({invoiceId: invoiceId, groupCounter: groupId, itemId: {$ne: -1}}, {fields: {itemId: 1, booked: 1}}).fetch();
      var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId}, {fields: {customerId: 1}});
      var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
      var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupId});
      var customer = Customers.findOne({_id: bookingCustomer.customerId});
      var allDates = details['dates'];
      var addedDates = details['addedDates'];

      var counter = 0;
      var dateDigitArray = [];
      var originalDateDigitArray = [];
      var dateMomentArray = [];
      var calendarDateMomentArray = [];
      var originalDateMomentArray = [];
      var monthArray = [];
      var individualFormattedDates = [];
      var calendarClashableSerialNumbers = [];
      var calendarUnclashableSerialNumbers = [];
      var currentEquipmentCalendarIds = [];

      for(x in addedDates) {
        if(dateDigitArray[counter].length == 0) {
          dateDigitArray[counter].push(moment(addedDates[x]).format('DD MM YYYY'));
          originalDateDigitArray[counter].push(moment(addedDates[x]).format('DD MM YYYY'));
          dateMomentArray[counter].push(moment(addedDates[x]));
          calendarDateMomentArray[counter].push(moment(addedDates[x]));
          originalDateMomentArray[counter].push(moment(addedDates[x]));
          if(monthArray[counter].indexOf(moment(addedDates[x]).format('MM YYYY')) == -1) {
            monthArray[counter].push(moment(addedDates[x]).format('MM YYYY'));
          }
        } else {
          var date2 = moment(addedDates[x]).subtract(1, 'days');

          if(date2.format('DD MM YYYY') == dateDigitArray[counter][dateDigitArray[counter].length - 1]) {
            dateDigitArray[counter].push(moment(addedDates[x]).format('DD MM YYYY'));
            originalDateDigitArray[counter].push(moment(addedDates[x]).format('DD MM YYYY'));
            dateMomentArray[counter].push(moment(addedDates[x]));
            calendarDateMomentArray[counter].push(moment(addedDates[x]));
            originalDateMomentArray[counter].push(moment(addedDates[x]));
            if(monthArray[counter].indexOf(moment(addedDates[x]).format('MM YYYY')) == -1) {
              monthArray[counter].push(moment(addedDates[x]).format('MM YYYY'));
            }
          } else {
            counter += 1;
            dateDigitArray[counter] = [];
            dateDigitArray[counter].push(moment(addedDates[x]).format('DD MM YYYY'));

            originalDateDigitArray[counter] = [];
            originalDateDigitArray[counter].push(moment(addedDates[x]).format('DD MM YYYY'));

            dateMomentArray[counter] = [];
            dateMomentArray[counter].push(moment(addedDates[x]));

            calendarDateMomentArray[counter] = [];
            calendarDateMomentArray[counter].push(moment(addedDates[x]));

            originalDateMomentArray[counter] = [];
            originalDateMomentArray[counter].push(moment(addedDates[x]));

            monthArray[counter] = [];
            if(monthArray[counter].indexOf(moment(addedDates[x]).format('MM YYYY')) == -1) {
              monthArray[counter].push(moment(addedDates[x]).format('MM YYYY'));
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

          // AFFECT AVAILABLE EQUIPMENTS
          for(y in originalDateDigitArray) {
            for(z in originalDateDigitArray[y]) {
              var availableEquipmentToAffect = AvailableEquipments.findOne({itemId: bookingLineItems[x].itemId, date: originalDateDigitArray[y][z]});
              if(availableEquipmentToAffect != undefined) {
                var availableEquipmentToAffectId = availableEquipmentToAffect._id;
                delete availableEquipmentToAffect._id;

                AvailableEquipments.update({_id: availableEquipmentToAffectId}, {$inc: {remainingQuantity: -(amountAddedToNewCalendars)}});
              } else {

                var availableEquipmentAttributes = {
                    date: originalDateDigitArray[y][z],
                    dateTime: originalDateMomentArray[y][z].add(1, 'days')._d,
                    itemId: bookingLineItems[x].itemId,
                    remainingQuantity: parseInt(inventoryItem.bookableQuantity) - bookingLineItems[x].booked
                };
                AvailableEquipments.insert(availableEquipmentAttributes);

                originalDateMomentArray[y][z].subtract(1, 'days');
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
                }

                if(bookingLineItems[x].clashableSerialNumbers[a].originalCalendars.indexOf(insertedCalendar) == -1) {
                  bookingLineItems[x].clashableSerialNumbers[a].originalCalendars.push(insertedCalendar);
                }
              }
            }

            var serialNoToCheck;
            var serialNoStatus;

            for(a in bookingLineItems[x].unclashableSerialNumbers) {
              if(bookingLineItems[x].unclashableSerialNumbers[a].serialNo != serialNoToCheck) {
                serialNoToCheck = bookingLineItems[x].unclashableSerialNumbers[a].serialNo;
              }
              if(bookingLineItems[x].unclashableSerialNumbers[a].status != serialNoStatus) {
                serialNoStatus = bookingLineItems[x].unclashableSerialNumbers[a].status;
              }

              var serialTestArray = [];
              var equipmentCalendarIdArray2 = [];

              for(f in equipmentCalendars) {
                equipmentCalendarIdArray2.push(equipmentCalendars[f]._id);
              }

              for(f in equipmentCalendars) {
                if(equipmentCalendars[f].serialNumbers.indexOf(serialNoToCheck) != -1) {

                  var newClashObject = new Object();
                  newClashObject.serialNo = serialNoToCheck;
                  newClashObject.status = serialNoStatus;
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

          bookingLineItems[x].days = details['dates'].length;
          bookingLineItems[x].originalPriced = bookingLineItems[x].booked * bookingLineItems[x].days;

          var bookingLineItemId = bookingLineItems[x]._id;

          delete bookingLineItems[x]._id;

          BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItems[x]});
        }
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



          if(bookingStatus.clash == true && bookingLineItems[e].clashableSerialNumbers.length > 0) {
            // remove current booking original calendars and the other bookings belonging to clash calendars to the updated calendar id

            for(t in bookingLineItems[e].clashableSerialNumbers) {
              for(u = (bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.length -1); u >= 0; u--) {
                if(theCalendarsToDelete.indexOf(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars[u]) != -1) {
                  bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.splice(u,1);
                }
              }

              if(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.indexOf(equipmentCalendarId) == -1) {
                bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.push(equipmentCalendarId);
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

          if(bookingStatus.clash == true  && bookingLineItems[e].clashableSerialNumbers.length > 0) {
            for(t in bookingLineItems[e].clashableSerialNumbers) {
              for(u = (bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.length -1); u >= 0; u--) {
                if(theCalendarsToDelete.indexOf(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars[u]) != -1) {
                  bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.splice(u,1);
                }
              }

              if(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.indexOf(equipmentCalendarId) == -1) {
                bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.push(equipmentCalendarId);
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

          if(bookingStatus.clash == true  && bookingLineItems[e].clashableSerialNumbers.length > 0) {
            for(t in bookingLineItems[e].clashableSerialNumbers) {
              for(u = (bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.length -1); u >= 0; u--) {
                if(theCalendarsToDelete.indexOf(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars[u]) != -1) {
                  bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.splice(u,1);
                }
              }

              if(bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.indexOf(equipmentCalendarId) == -1) {
                bookingLineItems[e].clashableSerialNumbers[t].originalCalendars.push(equipmentCalendarId);
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

    },
    addCustomerFromQuickbooks: function(quickbooksId) {

        var QuickBooks = Meteor.npmRequire('node-quickbooks');
        // var qbo = new QuickBooks('qyprdrp2E0Mk07aFBGxmMOK1CjQQq4',
        //                        '8ncd4Bl90kkBDo0PMQhnNrBDcMXDzb6f018hrm2J',
        //                        'qyprd8vaWwih1jyXPKYEH3G8CTuxmAeOwVn1kjJK5XdEntVJ',
        //                        '2danHBCW5dr6HiCpNf6Q13Fg3er8O22rmdISP6Av',
        //                        1440848740,
        //                        true, // don't use the sandbox (i.e. for testing)
        //                        true); // turn debugging on

        //get jenny's credentials
var jenny = Meteor.users.findOne({_id:"AcDM5ez6oRjBdegkB"});

var qbo = new QuickBooks('qyprdv7Uh8xyBXjescVfQWgZmGWOls',
                       'tocg2wRk4Vu0VRF4FL2spTC8cKs9BenXm7Fb8D3K',
                       jenny.services.quickbooks.accessToken,
                       jenny.services.quickbooks.accessTokenSecret,
                       412738331,
                       false, // don't use the sandbox (i.e. for testing)
                       true); // turn debugging on

      
        qbo.getCustomer(quickbooksId, Meteor.bindEnvironment(function (error, customer) {
          if(customer.fault != undefined && customer.fault.type == "AUTHENTICATION") {
            return;
          }
          if(customer) {
            var customer2 = new Object();
            if(customer.GivenName != undefined) {
              customer2.firstName = customer.GivenName;
            }
            if(customer.MiddleName != undefined) {
              customer2.middleName = customer.MiddleName;
            }
            if(customer.FamilyName != undefined) {
              customer2.lastName = customer.FamilyName;
            }

            var name = "";

             if(customer2.firstName != undefined && customer2.firstName.length > 0) {
               name = name.concat(customer2.firstName);
             } 
             if(customer2.middleName != undefined && customer2.middleName.length > 0) {
               name = name.concat(" " + customer2.middleName);
             } 
             if(customer2.lastName != undefined && customer2.lastName.length > 0) {
               name = name.concat(" " + customer2.lastName);
             } 

             customer2.name = name.trim();

             customer2.email = customer.PrimaryEmailAddr.Address;
             customer2.address = customer.BillAddr.Line1 + " " + customer.BillAddr.Line2 + " " + customer.BillAddr.Line3 + " " + customer.BillAddr.Line4;
             customer2.noOfBookings = 0;
             customer2.totalValue = 0;
             if(customer.PrimaryPhone != undefined) {
             customer2.contact = customer.PrimaryPhone.FreeFormNumber;
            }
             customer2.createdAt = new Date();
             customer2.updatedAt = new Date();
             customer2.createdBy = Meteor.user().username;
             customer2.updatedBy = Meteor.user().username;
             customer2.quickbooksId = quickbooksId;
             customer2.logs = [];
             customer2.images = [];
             customer2.icStatus = false;

            Customers.insert(customer2);
          }
        }));

    },
      findAllQuickbooksCustomers: function() {

        // var customers = Customers.find().fetch();

        // for(x in customers) {
        //   console.log(customers[x]._id);
        //   var customerUpdateObject = new Object();
        //   customerUpdateObject.customerId = customers[x]._id;
        //   customerUpdateObject.status = "OK";

        //   CustomerUpdates.insert(customerUpdateObject);

        //   var customerLogObject = new Object();
        //   customerLogObject.customerId = customers[x]._id;
        //   customerLogObject.logs = customers[x].logs;

        //   CustomerLogs.insert(customerLogObject);
        // }

        var bookingCustomers = BookingCustomers.find({customerId: 0}).fetch();

        for(x in bookingCustomers) {
          bookingCustomers[x].customerId = String(bookingCustomers[x].customerId);

          var bookingCustomerId = bookingCustomers[x]._id;

          delete bookingCustomers[x]._id;
          BookingCustomers.update({_id: bookingCustomerId}, {$set: bookingCustomers[x]});
        }

        console.log("DONE");
      },
      addQuickbooksCustomer: function(customerAttributes) {
        var customerObject = new Object();
        customerObject.firstName = customerAttributes['firstName'];
        if(customerAttributes['firstName'] != null) {
          customerObject.firstName = customerObject.firstName + " ";
        }
        customerObject.middleName = customerAttributes['middleName'];
        if(customerAttributes['middleName'] != null) {
          customerObject.middleName = customerObject.middleName + " ";
        }
        customerObject.lastName = customerAttributes['lastName'];
        if(customerAttributes['lastName'] != null) {
          customerObject.lastName = customerObject.lastName + " ";
        }
        customerObject.name = customerObject.firstName + customerObject.middleName + customerObject.lastName;
        customerObject.company = customerAttributes['company'];
        customerObject.ic = customerAttributes['ic'];
        customerObject.email = customerAttributes['email'];
        customerObject.address = customerAttributes['address'];
        customerObject.contact = customerAttributes['contact'];
        customerObject.createdAt = new Date();
        customerObject.updatedAt = new Date();
        customerObject.noOfBookings = 0;
        customerObject.totalValue = 0;
        customerObject.quickbooksId = 0;
        customerObject.logs = [];
        var log = new Object();
        log.content = Meteor.user().username + " created customer.";
        log.owner = Meteor.user().username;
        log.dateTime = new Date();
        customerObject.logs.push(log);

        customerObject.images = [];
        customerObject.icStatus = false;

        var customerId = Customers.insert(customerObject);

        console.log("console");

        var invoiceNeedingUpdateObject = new Object();
        invoiceNeedingUpdateObject.bookingId = "0";
        invoiceNeedingUpdateObject.invoiceNumber = "0";
        invoiceNeedingUpdateObject.customerName = customerObject.name;
        invoiceNeedingUpdateObject.customerIdd = customerId;

        InvoiceNeedingUpdate.insert(invoiceNeedingUpdateObject);

        return customerId;
      },  
      customerUpdateToProperCustomerId: function(customerId) {
        var customerUpdate = CustomerUpdates.findOne({customerId: "0"});

        customerUpdate.status = "OK";
        customerUpdate.customerId = customerId;

        CustomerUpdates.update({customerId: "0"}, {$set: customerUpdate});
      },
      resetCustomerUpdate: function() {
        CustomerUpdates.update({customerId: "0"}, {$unset: {route:1}});
      },
      updateQuickbooksCustomer: function(customerAttributes) {
        this.unblock();
        CustomerUpdates.update({customerId: customerAttributes.customer._id}, {$set: {status: "OK"}});
        var customerToUpdate = Customers.findOne({_id: customerAttributes.customer._id});

        customerToUpdate.name = customerAttributes.name;
        customerToUpdate.lastName = customerAttributes.lastName;
        customerToUpdate.firstName = customerAttributes.firstName;
        customerToUpdate.middleName = customerAttributes.middleName;
        customerToUpdate.company = customerAttributes.company;
        customerToUpdate.contact = customerAttributes.contact;
        customerToUpdate.email = customerAttributes.email;
        customerToUpdate.address = customerAttributes.address;
        customerToUpdate.ic = customerAttributes.ic;

        delete customerToUpdate._id;
        Customers.update({_id: customerAttributes.customer._id}, {$set: customerToUpdate});

        var calendars = Calendars.find({customerId: customerAttributes['_id']}).fetch();

        for(x in calendars) {
          var string = calendars[x].title.split(" ");
          calendars[x].title = string[0] + " " + customerAttributes['name'] + " " + string[string.length-2] + " " + string[string.length - 1];
          calendars[x].customerName = customerAttributes['name'];


          var calendarId = calendars[x]._id;
          delete calendars[x]._id;
          Calendars.update({_id: calendarId}, {$set: calendars[x]});
        }

        var equipmentCalendars = EquipmentCalendars.find({customerId: customerAttributes['_id']}).fetch();
        for(x in equipmentCalendars) {
          var string = equipmentCalendars[x].title.split(":");

          equipmentCalendars[x].title = customerAttributes['name'] + " " + string[1];
          equipmentCalendars[x].customerName = customerAttributes['name'];

          var equipmentCalendarId = equipmentCalendars[x]._id;
          delete equipmentCalendars[x]._id;
          EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: equipmentCalendars[x]});
        }

        var invoiceNeedingUpdate = InvoiceNeedingUpdate.findOne({customerIdd: customerAttributes['_id']});

        if(invoiceNeedingUpdate == null) {
          var invoiceNeedingUpdateObject = new Object();
          invoiceNeedingUpdateObject.bookingId = "0";
          invoiceNeedingUpdateObject.invoiceNumber = "0";
          invoiceNeedingUpdateObject.customerName = customerAttributes.customer.name;
          invoiceNeedingUpdateObject.customerIdd = customerAttributes['_id'];

          InvoiceNeedingUpdate.insert(invoiceNeedingUpdateObject);
        }
      }, 
      updateQuickbooksInvoiceCustomerName: function(quickbooksAttributes) {
        this.unblock();
        var QuickBooks = Meteor.npmRequire('node-quickbooks');
        // var qbo = new QuickBooks('qyprdrp2E0Mk07aFBGxmMOK1CjQQq4',
        //                        '8ncd4Bl90kkBDo0PMQhnNrBDcMXDzb6f018hrm2J',
        //                        'qyprd8vaWwih1jyXPKYEH3G8CTuxmAeOwVn1kjJK5XdEntVJ',
        //                        '2danHBCW5dr6HiCpNf6Q13Fg3er8O22rmdISP6Av',
        //                        1440848740,
        //                        true, // don't use the sandbox (i.e. for testing)
        //                        true); // turn debugging on

        //get jenny's credentials
var jenny = Meteor.users.findOne({_id:"AcDM5ez6oRjBdegkB"});

var qbo = new QuickBooks('qyprdv7Uh8xyBXjescVfQWgZmGWOls',
                       'tocg2wRk4Vu0VRF4FL2spTC8cKs9BenXm7Fb8D3K',
                       jenny.services.quickbooks.accessToken,
                       jenny.services.quickbooks.accessTokenSecret,
                       412738331,
                       false, // don't use the sandbox (i.e. for testing)
                       true); // turn debugging on


        if(quickbooksAttributes['quickbooksInvoiceQueryId'] == "Pending") {
          var invoiceAttributes = {
              _id: quickbooksAttributes['_id'],
              customerQuickBooksId: quickbooksAttributes['customerQuickbooksId']
            };
          Meteor.call('createInitialQuickbooksInvoice', invoiceAttributes);
        } else {
        qbo.getInvoice(quickbooksAttributes['quickbooksInvoiceQueryId'], function(err, invoice) {
            if(invoice.fault != undefined && invoice.fault.type == "AUTHENTICATION") {
              return;
            }

            if(invoice) {
              qbo.updateInvoice({
                Id: quickbooksAttributes['quickbooksInvoiceQueryId'],
                Line: invoice.Line,
                SyncToken: invoice['SyncToken'],
                CustomerRef: {
                  value: quickbooksAttributes['customerQuickbooksId']
                }
              }, Meteor.bindEnvironment(function(error, invoice) {
                if(invoice.fault != undefined && invoice.fault.type == "AUTHENTICATION") {
                  return;
                }
                      if(invoice.Fault != undefined) {
                        var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
                        bookingUpdate.status = invoice.Fault.Error[0].Message;

                        delete bookingUpdate._id;
                        BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
                      } else {
                        var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
                        bookingUpdate.status = "OK";

                        delete bookingUpdate._id;
                        BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
                      }
                    }));

              return "OK";
            }
          });
        }
      },
      updateOtherQuickbooksInvoice: function(quickbooksAttributes) {
        console.log("in updateOtherQuickbooksInvoice");
        this.unblock();

        var bookingId = quickbooksAttributes['_id'];
        var other = Others.findOne({_id: quickbooksAttributes['_id']});

        if(other.quickbooksInvoiceQueryId == "Pending") {
          var latestDocNumber = QuickbooksInvoices.findOne({latest: true});

          latestDocNumber.invoiceDocNumber = parseInt(latestDocNumber.invoiceDocNumber);  
          
          var int = latestDocNumber.invoiceDocNumber;
          var str = int.toString();
          var first2digits = str.substring(0, 2);
          var last4digits = str.substring(2, 6);
          var today = new Date();
          var year = today.getFullYear();
          year = year.toString();
          var yearlast2digits = year.substring(2, 4);
          
          if(first2digits != yearlast2digits) {
            str = yearlast2digits + "00000";
            latestDocNumber.invoiceDocNumber = parseInt(str);
            QuickbooksInvoices.update({latest: true}, {$set: latestDocNumber});
          }

          var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
          bookingUpdate.status = "OK";

          delete bookingUpdate._id;
          BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});

          latestDocNumber.invoiceDocNumber += 1;

          var latestDocNumberId = latestDocNumber._id;
          delete latestDocNumber._id;

          QuickbooksInvoices.update({_id: latestDocNumberId}, {$set: latestDocNumber});
          other.quickbooksInvoiceId = latestDocNumber.invoiceDocNumber.toString();
          other.quickbooksInvoiceQueryId = "";
          var otherId = other._id;
          Others.update({_id: otherId}, {$set: other});

          // InvoiceNeedingUpdate.remove({otherId: otherId});

          var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
          bookingUpdate.status = "OK";

          delete bookingUpdate._id;
          BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
        } else {
          var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
          bookingUpdate.status = "OK";

          delete bookingUpdate._id;
          BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
        }
      },
      updateQuickbooksInvoice: function(quickbooksAttributes) { 
        this.unblock();

        var bookingId = quickbooksAttributes['_id'];
        var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});

        if(bookingStatus.quickbooksInvoiceQueryId == "Pending") {
          var latestDocNumber = QuickbooksInvoices.findOne({latest: true});

          latestDocNumber.invoiceDocNumber = parseInt(latestDocNumber.invoiceDocNumber);  
          
          var int = latestDocNumber.invoiceDocNumber;
          var str = int.toString();
          var first2digits = str.substring(0, 2);
          var last4digits = str.substring(2, 6);
          var today = new Date();
          var year = today.getFullYear();
          year = year.toString();
          var yearlast2digits = year.substring(2, 4);
          
          if(first2digits != yearlast2digits) {
            str = yearlast2digits + "00000";
            latestDocNumber.invoiceDocNumber = parseInt(str);
            QuickbooksInvoices.update({latest: true}, {$set: latestDocNumber});
          }

          var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
          bookingUpdate.status = "OK";

          delete bookingUpdate._id;
          BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});

          latestDocNumber.invoiceDocNumber += 1;

          var latestDocNumberId = latestDocNumber._id;
          delete latestDocNumber._id;

          QuickbooksInvoices.update({_id: latestDocNumberId}, {$set: latestDocNumber});
          bookingStatus.quickbooksInvoiceId = latestDocNumber.invoiceDocNumber.toString();
          bookingStatus.quickbooksInvoiceQueryId = "Pending";
          var bookingStatusId = bookingStatus._id;
          BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

          // InvoiceNeedingUpdate.remove({bookingId: bookingId});

          var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
          bookingUpdate.status = "OK";

          delete bookingUpdate._id;
          BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
        } else {
          var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
          bookingUpdate.status = "OK";

          delete bookingUpdate._id;
          BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
        }
      },
      convertQuotationToBooking: function(bookingId) {
        this.unblock();
        
        var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});
        bookingStatus.type = "Booking";
        bookingStatus.quickbooksInvoiceId = "Pending";

        delete bookingStatus._id;
        BookingStatuses.update({invoiceId: bookingId}, {$set: bookingStatus});

        var calendarsToUpdate = Calendars.find({invoiceId: bookingId}).fetch();
        for(x in calendarsToUpdate) {
          if(calendarsToUpdate[x].type == "Quotation") {
            calendarsToUpdate[x].type = "Booking";
          
            var calendarId = calendarsToUpdate[x]._id;

            delete calendarsToUpdate[x]._id;
            Calendars.update({_id: calendarId}, {$set: calendarsToUpdate[x]});
          }
          if(calendarsToUpdate[x].type == "Packing_Quotation") {
            calendarsToUpdate[x].type = "Packing_Booking";
          
            var calendarId = calendarsToUpdate[x]._id;

            delete calendarsToUpdate[x]._id;
            Calendars.update({_id: calendarId}, {$set: calendarsToUpdate[x]});
          }
          if(calendarsToUpdate[x].type == "Collection_Quotation") {
            calendarsToUpdate[x].type = "Collection_Booking";
          
            var calendarId = calendarsToUpdate[x]._id;

            delete calendarsToUpdate[x]._id;
            Calendars.update({_id: calendarId}, {$set: calendarsToUpdate[x]});
          }
        }

        var equipmentCalendarsToUpdate = EquipmentCalendars.find({invoiceId: bookingId}).fetch();
        for(x in equipmentCalendarsToUpdate) {
          equipmentCalendarsToUpdate[x].type = "Booking";

          var equipmentCalendarId = equipmentCalendarsToUpdate[x]._id;

          delete equipmentCalendarsToUpdate[x]._id;
          EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: equipmentCalendarsToUpdate[x]});
        }
      },
      createInitialQuickbooksInvoice: function(invoiceAttributes) {
        this.unblock();
        var QuickBooks = Meteor.npmRequire('node-quickbooks');
        // var qbo = new QuickBooks('qyprdrp2E0Mk07aFBGxmMOK1CjQQq4',
        //                        '8ncd4Bl90kkBDo0PMQhnNrBDcMXDzb6f018hrm2J',
        //                        'qyprd8vaWwih1jyXPKYEH3G8CTuxmAeOwVn1kjJK5XdEntVJ',
        //                        '2danHBCW5dr6HiCpNf6Q13Fg3er8O22rmdISP6Av',
        //                        1440848740,
        //                        true, // don't use the sandbox (i.e. for testing)
        //                        true); // turn debugging on

        //get jenny's credentials
var jenny = Meteor.users.findOne({_id:"AcDM5ez6oRjBdegkB"});

var qbo = new QuickBooks('qyprdv7Uh8xyBXjescVfQWgZmGWOls',
                       'tocg2wRk4Vu0VRF4FL2spTC8cKs9BenXm7Fb8D3K',
                       jenny.services.quickbooks.accessToken,
                       jenny.services.quickbooks.accessTokenSecret,
                       412738331,
                       false, // don't use the sandbox (i.e. for testing)
                       true); // turn debugging on
        
        

        var lineArray = [];

        var lineObject = new Object();
        lineObject.Amount = 0;
        lineObject.DetailType = "SalesItemLineDetail";
        lineObject.Description = "Application Query";
        lineObject.SalesItemLineDetail = new Object();
        lineObject.SalesItemLineDetail.ItemRef = new Object();
        lineObject.SalesItemLineDetail.ItemRef.value = "44";
        lineObject.SalesItemLineDetail.ItemRef.name = "Application Query";
        lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
        lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
        lineObject.SalesItemLineDetail.UnitPrice = 0;
        lineObject.SalesItemLineDetail.Qty = 0;
        lineArray.push(lineObject);

        var customerMemo = "";

        // for(x in booking.remarks) {
        //   customerMemo = customerMemo.concat(booking.remarks[x].createdBy + ": " + booking.remarks[x].remark + ". ");
        // }

        var txn = new Object();
        txn.TxnTaxDetail = new Object();
        txn.TxnTaxDetail.TotalTax = 0;
        txn.TxnTaxDetail.TaxLine = [];
        var taxLineObject = new Object();
        taxLineObject.Amount = 0;
        taxLineObject.DetailType = "TaxLineDetail";
        taxLineObject.TaxLineDetail = new Object();
        taxLineObject.TaxLineDetail.TaxRateRef = new Object();
        taxLineObject.TaxLineDetail.TaxRateRef.value = "5";
        taxLineObject.TaxLineDetail.PercentBased = true;
        taxLineObject.TaxLineDetail.TaxPercent = 7;
        taxLineObject.TaxLineDetail.NetAmountTaxable = 0;
        txn.TxnTaxDetail.TaxLine.push(taxLineObject);

        var latestDocNumber = QuickbooksInvoices.findOne({latest: true});

        latestDocNumber.invoiceDocNumber = parseInt(latestDocNumber.invoiceDocNumber);  
        
        // change latestDocNumber if its next year
        // check first two digits with current year
        var int = latestDocNumber.invoiceDocNumber;
        var str = int.toString();
        var first2digits = str.substring(0, 2);
        var last4digits = str.substring(2, 6);
        var today = new Date();
        var year = today.getFullYear();
        year = year.toString();
        var yearlast2digits = year.substring(2, 4);
        
        if(first2digits != yearlast2digits) {
          str = yearlast2digits + "00000";
          latestDocNumber.invoiceDocNumber = parseInt(str);
          QuickbooksInvoices.update({latest: true}, {$set: latestDocNumber});
        }

        qbo.createInvoice({
          DocNumber: latestDocNumber.invoiceDocNumber,
          Line: lineArray,
          CustomerRef: {
            value: invoiceAttributes['customerQuickBooksId']
          },
          TxnTaxDetail: txn.TxnTaxDetail,
          CustomerMemo: {
            value: customerMemo
          }
        }, Meteor.bindEnvironment(function (error, invoice) {
          if(invoice.fault != undefined && invoice.fault.type == "AUTHENTICATION") {
            return;
          }
          latestDocNumber.invoiceDocNumber += 1;

          var latestDocNumberId = latestDocNumber._id;
          delete latestDocNumber._id;

          QuickbooksInvoices.update({_id: latestDocNumberId}, {$set: latestDocNumber});

          if(invoice.Fault != undefined) {
            var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
            bookingUpdate.status = invoice.Fault.Error[0].Message;

            delete bookingUpdate._id;
            BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
          } else {
            var booking = Bookings.findOne({_id: invoiceAttributes['_id']});
            booking.quickbooksInvoiceId = invoice.DocNumber;
            booking.quickbooksInvoiceQueryId = invoice.Id;

            var bookingId = booking._id;

            Bookings.update({_id: bookingId}, {$set: booking});

            var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
            bookingUpdate.status = "OK";

            delete bookingUpdate._id;
            BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
          }
        }));
      },  
});
}
