BookingLineItems = new Mongo.Collection('bookinglineitems');

Meteor.methods({
	removeAffectedItemsGroup: function(details) {
			
		var bookingLineItems = details['bookingLineItems'];
		var groupId = parseInt(details['groupId']);

		console.log("removeAffectedItemsGroup");
		console.log(bookingLineItems);

		var invoiceId = bookingLineItems[0].invoiceId;
		var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});

		for(x = (bookingStatus.affectedItems.length -1); x >= 0; x--) {
			var serialNumbers = [];
			for(y in bookingLineItems) {
				var inventoryItem = Inventory.findOne({_id: bookingLineItems[y].itemId});
				if(bookingStatus.affectedItems[x].item == inventoryItem.queryName) {
					for(z in bookingLineItems[y].unclashableSerialNumbers) {
						serialNumbers.push(bookingLineItems[y].unclashableSerialNumbers[z].serialNo);
					}
					for(z in bookingLineItems[y].clashableSerialNumbers) {
						serialNumbers.push(bookingLineItems[y].clashableSerialNumbers[z].serialNo);
					}

					for(z = (bookingStatus.affectedItems[x].serialNo.length -1); z >= 0; z--) {
						if(serialNumbers.indexOf(bookingStatus.affectedItems[x].serialNo[z].serialNo) != -1 && bookingStatus.affectedItems[x].serialNo[z].serialGroup == bookingLineItems[y].groupCounter) {
							bookingStatus.affectedItems[x].serialNo.splice(z, 1);
						}
					}

					if(bookingStatus.affectedItems[x].serialNo.length == 0) {
						bookingStatus.affectedItems.splice(x, 1);
					}

					if(groupId != -1) {
						for(z in inventoryItem.serialNo) {
							if(serialNumbers.indexOf(inventoryItem.serialNo[z].serialNo) != -1) {

								for(a = (inventoryItem.serialNo[z].affectedBookings.length -1); a >= 0; a--) {
									if(inventoryItem.serialNo[z].affectedBookings[a].invoiceId == invoiceId && inventoryItem.serialNo[z].affectedBookings[a].groupId == bookingLineItems[y].groupCounter) {
										inventoryItem.serialNo[z].affectedBookings.splice(a, 1);
									}
								}
								for(a = (inventoryItem.serialNo[z].affectedBookings.length -1); a >= 0; a--) {
									if(inventoryItem.serialNo[z].affectedBookings[a].invoiceId == invoiceId && inventoryItem.serialNo[z].affectedBookings[a].groupId > groupId) {
										inventoryItem.serialNo[z].affectedBookings[a].groupId -= 1;
									}
								}
							}
						}
					} else {
						for(z in inventoryItem.serialNo) {
							for(a = (inventoryItem.serialNo[z].affectedBookings.length -1); a >= 0; a--) {
								if(inventoryItem.serialNo[z].affectedBookings[a].invoiceId == invoiceId) {
									inventoryItem.serialNo[z].affectedBookings.splice(a, 1);
								}
							}
						}
					}



					var inventoryItemId = inventoryItem._id;

					delete inventoryItem._id;

					console.log('inventoryItem');
					console.log(inventoryItem);

					Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});

					break;
				}
			}
		}

		var donedone = false;
		for(x in bookingStatus.affectedItems) {
			for(y in bookingStatus.affectedItems[x].serialNo) {
				if(bookingStatus.affectedItems[x].serialNo[y].serialGroup > groupId) {
					bookingStatus.affectedItems[x].serialNo[y].serialGroup -= 1;
				}
			}
		}



		var bookingStatusId = bookingStatus._id;

		delete bookingStatus._id;
		BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});
	},
	minusAffectedItem: function(details) {
		console.log('inside minusAffectedItem');
		console.log(details);

		var bookingLineItem = details['bookingLineItem'];
		var serialNo = details['serialNo'];

		var inventoryItem = Inventory.findOne({_id: bookingLineItem.itemId});

		var bookingStatus = BookingStatuses.findOne({invoiceId: bookingLineItem.invoiceId});

		for(x in bookingStatus.affectedItems) {
			if(bookingStatus.affectedItems[x].item == inventoryItem.queryName) {
				for(y in bookingStatus.affectedItems[x].serialNo) {
					if(bookingStatus.affectedItems[x].serialNo[y].serialNo == serialNo && bookingStatus.affectedItems[x].serialNo[y].serialGroup == bookingLineItem.groupCounter) {
						bookingStatus.affectedItems[x].serialNo.splice(y, 1);

						break;
					}
				}

				if(bookingStatus.affectedItems[x].serialNo.length == 0) {
					bookingStatus.affectedItems.splice(x, 1);
				}

				var bookingStatusId = bookingStatus._id;

				delete bookingStatus._id;
				BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});
				break;
			}
		}

		for(x in inventoryItem.serialNo) {
			if(inventoryItem.serialNo[x].serialNo == serialNo) {
				for(y in inventoryItem.serialNo[x].affectedBookings) {
					if(inventoryItem.serialNo[x].affectedBookings[y].invoiceId == bookingLineItem.invoiceId && inventoryItem.serialNo[x].affectedBookings[y].groupId == bookingLineItem.groupCounter) {
						inventoryItem.serialNo[x].affectedBookings.splice(y, 1);
					}
				}
			}
		}

		var inventoryItemId = inventoryItem._id;

		delete inventoryItem._id;
		Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
	},
	removeAffectedItems: function(bookingLineItem) {

		var invoiceId = bookingLineItem.invoiceId;
		var bookingStatus = BookingStatuses.findOne({invoiceId: bookingLineItem.invoiceId});
		var inventoryItem = Inventory.findOne({_id: bookingLineItem.itemId});
		var groupId = bookingLineItem.groupCounter;

		var serialNumbers = [];
		for(x in bookingLineItem.unclashableSerialNumbers) {
			serialNumbers.push(bookingLineItem.unclashableSerialNumbers[x].serialNo);
		}

		for(x in bookingLineItem.clashableSerialNumbers) {
			serialNumbers.push(bookingLineItem.clashableSerialNumbers[x].serialNo);
		}

		for(x in bookingStatus.affectedItems) {
			if(bookingStatus.affectedItems[x].item == inventoryItem.queryName) {
				for(z = (bookingStatus.affectedItems[x].serialNo.length -1); z >= 0; z--) {
				  if(serialNumbers.indexOf(bookingStatus.affectedItems[x].serialNo[z].serialNo) != -1 && bookingStatus.affectedItems[x].serialNo[z].serialGroup == groupId) {
						bookingStatus.affectedItems[x].serialNo.splice(z, 1);
					}
				}
			}

			if(bookingStatus.affectedItems[x].serialNo.length == 0) {
				bookingStatus.affectedItems.splice(x,1);
			}
		}

		var bookingStatusId = bookingStatus._id;

		delete bookingStatus._id;
		BookingStatuses.update({_id: bookingStatusId}, {$set: bookingStatus});

		for(y in inventoryItem.serialNo) {
			if(serialNumbers.indexOf(inventoryItem.serialNo[y].serialNo) != -1) {
				for(z in inventoryItem.serialNo[y].affectedBookings) {
					if(inventoryItem.serialNo[y].affectedBookings[z].invoiceId == invoiceId && inventoryItem.serialNo[y].affectedBookings[z].groupId == groupId) {
						inventoryItem.serialNo[y].affectedBookings.splice(z, 1);
					}
				}
			}
		}

		var inventoryItemId = inventoryItem._id;

		delete inventoryItem._id;
		Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
	},
	addCustomBookingLineItem: function(details) {

		var bookingLineItem = new Object();

		bookingLineItem.itemId = "";
		bookingLineItem.brand = "";
		bookingLineItem.item = "";
		bookingLineItem.category = details['category'];
		bookingLineItem.unclashableSerialNumbers = [];
		bookingLineItem.clashableSerialNumbers = [];
		bookingLineItem.groupCounter = parseInt(details['groupCounter']);
		bookingLineItem.days = parseInt(details['days']);
		bookingLineItem.originalPriced = 0;
		bookingLineItem.discountPriced = 0;
		bookingLineItem.discount = 0;
		bookingLineItem.booked = 0;
		bookingLineItem.rate = 0;
		bookingLineItem.total = -1;
		bookingLineItem.subAmount = 0;
		bookingLineItem.status = "N/A";
		bookingLineItem.clash = false;
		bookingLineItem.check = false;
		bookingLineItem.invoiceId = details['invoiceId'];
		bookingLineItem.sortNumber = parseFloat(13 + "." + BookingLineItems.find({invoiceId: details['invoiceId'], groupCounter: parseInt(details['groupCounter']), category: "Custom Item Rental"}).count());

		BookingLineItems.insert(bookingLineItem);
	},
  // addQuantityToBookingLineItem: function(details) {

  //   var bookingLineItemId = details['id'];
  //   var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
  //   var groupCounter = parseInt(bookingLineItem.groupCounter);
  //   var invoiceId = details['_id'];
  //   var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
  //   var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
  //   var bookingPrice = BookingPrices.findOne({invoiceId: invoiceId});
  //   var booking = Bookings.findOne({_id: invoiceId});
  //   var customer = Customers.findOne({_id: bookingCustomer.customerId});
  //   var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupCounter});
  //   var returnObject = new Object();
  //   var itemId = bookingLineItem.itemId;
  //   var inventoryItem = Inventory.findOne({_id: itemId});

  //   var datesArray = [];
  //   var dateTimeArray = [];

  //   var arrayToBeReturned = [];
  //   var arrayToBeReturnedDigits = [];

  //   // CHECK IF BOOKED EQUALS TOTAL
  //   if(bookingLineItem.booked == bookingLineItem.total) {
  //     returnObject.status = "BookedEqualsTotal";

  //     return returnObject;
  //   }

  //   // FIND AVAILABLE EQUIPMENTS ON THESE DATES
  //   // CHECK WHETHER THERE IS STILL AVAILABLE QUANTITY LEFT TO ADD
  //   for(x in bookingGroup.dates) {
  //     datesArray.push(moment(bookingGroup.dates[x]).subtract(1, 'days').format("DD MM YYYY"));
  //     dateTimeArray.push(moment(bookingGroup.dates[x])._d);
  //   }

  //   var availableEquipments = [];

  //   for(x in datesArray) {
  //     var quantityToMinus = 0;
  //     var datesToMinus = [];
  //     datesToMinus.push(datesArray[x]);

  //     var equipmentCalendarsToMinus = EquipmentCalendars.find({equipmentId: itemId, dates: {$in: datesToMinus}}, {fields:{booked: 1}}).fetch();
  //     for(y in equipmentCalendarsToMinus) {
  //       quantityToMinus += equipmentCalendarsToMinus[y].booked;
  //     }


  //     var avail = new Object();
  //     avail.date = datesArray[x];
  //     avail.dateTime = dateTimeArray[x];
  //     avail.itemId = itemId;
  //     avail.remainingQuantity = inventoryItem.bookableQuantity - quantityToMinus;

  //     availableEquipments.push(avail);
  //   }

  //   for(x in availableEquipments) {
  //     if(availableEquipments[x].remainingQuantity == 0) {
  //       returnObject.status = "Overbooked";
  //       if(Meteor.absoluteUrl() == 'http://localhost:3000/') {
  //         arrayToBeReturned.push(moment(availableEquipments[x].dateTime).subtract(1,'days').format("Do MMMM YYYY"));
  //         arrayToBeReturnedDigits.push(availableEquipments[x].date);
  //       } else {
  //         arrayToBeReturned.push(moment(availableEquipments[x].dateTime).format("Do MMMM YYYY"));
  //         arrayToBeReturnedDigits.push(availableEquipments[x].date);
  //       }
  //     }
  //   }

  //   if(returnObject.status == "Overbooked") {

  //     returnObject.dates = arrayToBeReturned;
  //     returnObject.datesDigits = arrayToBeReturnedDigits;
  //     returnObject.inventoryItem = inventoryItem;

  //     return returnObject;
  //   }

  //   bookingLineItem.booked += 1;

  //   // CHECK INVENTORY ITEM TO SEE WHAT SERIAL NUMBERS ARE AVAILABLE
  //   var availableSerialNumbers = [];
  //   var statuses = ["Sent For Repair", "Missing", "Damaged"];
  //   for(x in inventoryItem.serialNo) {
  //     if(statuses.indexOf(inventoryItem.serialNo[x].status) == -1) {
  //       availableSerialNumbers.push(inventoryItem.serialNo[x].serialNo);
  //     }
  //   }

  //   var individualFormattedDates = [];
  //   var individualDates = bookingGroup.dates;

  //   for(x in individualDates) {
  //     individualDates[x] = parseInt(moment(individualDates[x]).format("x"));
  //   }

  //   individualDates.sort();

  //   for(x in individualDates) {
  //     individualDates[x] = moment(individualDates[x]).subtract(1, "days")._d;
  //   }

  //   var dateArray = [];
  //   var monthArray = [];
  //   var dateArrayMoment = [];
  //   var clashableSerialNumbers = [];
  //   var unclashableSerialNumbers = [];
  //   var counter = 0;
  //   var booked = 0;
  //   dateArray[counter] = [];
  //   monthArray[counter] = [];
  //   dateArrayMoment[counter] = [];
  //   var equipmentCalendarIdArray = [];

  //   for(x in individualDates) {
  //     if(dateArray[counter].length == 0) {
  //       dateArray[counter].push(moment(individualDates[x]).format('DD MM YYYY'));
  //       dateArrayMoment[counter].push(moment(individualDates[x]));
  //       if(monthArray[counter].indexOf(moment(individualDates[x]).format('MM YYYY')) == -1) {
  //         monthArray[counter].push(moment(individualDates[x]).format('MM YYYY'));
  //       }
  //     } else {
  //       var date2 = moment(individualDates[x]).subtract(1, 'days');

  //       if(date2.format('DD MM YYYY') == dateArray[counter][dateArray[counter].length - 1]) {
  //         dateArray[counter].push(moment(individualDates[x]).format('DD MM YYYY'));
  //         dateArrayMoment[counter].push(moment(individualDates[x]));
  //         if(monthArray[counter].indexOf(moment(individualDates[x]).format('MM YYYY')) == -1) {
  //           monthArray[counter].push(moment(individualDates[x]).format('MM YYYY'));
  //         }
  //       } else {
  //         counter += 1;
  //         dateArray[counter] = [];
  //         dateArray[counter].push(moment(individualDates[x]).format('DD MM YYYY'));

  //         dateArrayMoment[counter] = [];
  //         dateArrayMoment[counter].push(moment(individualDates[x]));

  //         monthArray[counter] = [];
  //         if(monthArray[counter].indexOf(moment(individualDates[x]).format('MM YYYY')) == -1) {
  //           monthArray[counter].push(moment(individualDates[x]).format('MM YYYY'));
  //         }
  //       }
  //     }
  //   }

  //   for(x in dateArrayMoment) {
  //     dateArray[x].unshift(moment(dateArrayMoment[x][0]).subtract(1, 'days').format('DD MM YYYY'));
  //     dateArray[x].push(moment(dateArrayMoment[x][dateArrayMoment[x].length - 1]).add(1, 'days').format('DD MM YYYY'));
  //     dateArrayMoment[x].unshift(moment(dateArrayMoment[x][0]).subtract(1, 'days'));
  //     dateArrayMoment[x].push(moment(dateArrayMoment[x][dateArrayMoment[x].length - 1]).add(1, 'days'));
  //     for(y in dateArrayMoment[x]) {
  //       individualFormattedDates.push(moment(dateArrayMoment[x][y]).format("DD MM YYYY"));
  //     }
  //   }

  //   // CHECK EQUIPMENT CAELNDARS THAT ARE IN THE DATE RANGE CONTAINING THE ITEM
  //   var equipmentCalendars = EquipmentCalendars.find({equipmentId: itemId, dates: {$in: individualFormattedDates}}).fetch();

  //   // console.log("equipmentCalendars");
  //   // console.log(equipmentCalendars);

  //   // CHECK CLASHABLE AND UNCLASHABLE SERIAL NUMBERS
  //   for(x in availableSerialNumbers) {
  //     for(y in equipmentCalendars) {
  //       for(z in equipmentCalendars[y].serialNumbers) {
  //         if(availableSerialNumbers.indexOf(equipmentCalendars[y].serialNumbers[z]) != -1 && clashableSerialNumbers.indexOf(equipmentCalendars[y].serialNumbers[z]) == -1) {
  //           clashableSerialNumbers.push(equipmentCalendars[y].serialNumbers[z]);

  //           if(equipmentCalendarIdArray.indexOf(equipmentCalendars[y]._id) == -1) {
  //             equipmentCalendarIdArray.push(equipmentCalendars[y]._id);
  //           }
  //         }
  //       }
  //     }
  //   }

  //   // console.log("equipmentCalendarIdArray");
  //   // console.log(equipmentCalendarIdArray);

  //   for(x in availableSerialNumbers) {
  //     if(clashableSerialNumbers.indexOf(availableSerialNumbers[x]) == -1) {
  //       unclashableSerialNumbers.push(availableSerialNumbers[x]);
  //     }
  //   }

  //   // ADD TO EQUIPMENT CALENDAR
  //   // MUST CHECK WHETHER THERE ARE AVAILABLE SERIAL NUMBERS FIRST. IF NOT SHOULDN'T GO HERE
  //   var update = false;
  //   var currentEquipmentCalendar;
  //   var currentEquipmentCalendarArray = [];
  //   var originalEquipmentCalendarArray = [];
  //   var clashEquipmentCalendarArray = [];
  //   var clashSerialNumbers = [];
  //   var serialNumber;
  //   var newEquipmentCalendarIdArray = [];
  //   var newInsertedEquipmentCalendarIdArray = [];
  //   var clashOrUnclash;
  //   var insertedEquipmentCalendarIdArray = [];

  //   if(EquipmentCalendars.findOne({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId}) != undefined) {
  //     update = true;
  //     currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId}).fetch();
  //   } else {
  //     update = false;
  //   }

  //   // console.log("update");
  //   // console.log(update);

  //   if(update) {
  //     for(x in dateArrayMoment) {
  //       var tempDateArrayMoment = dateArrayMoment[x];
  //       tempDateArrayMoment.pop();
  //       tempDateArrayMoment.shift();

  //       var tempDateArray = dateArray[x];
  //       tempDateArray.pop();
  //       tempDateArray.shift();

  //       var startDate = tempDateArrayMoment[0];
  //       var endDate = tempDateArrayMoment[tempDateArrayMoment.length - 1];

  //       if(tempDateArrayMoment.length > 1) {
  //         startDate = startDate.add(1,'days')._d;
  //         endDate = endDate.add(2,'days')._d;
  //       } else {
  //         startDate = startDate.add(1,'days')._d;
  //         endDate = endDate._d;
  //       }

  //       if(unclashableSerialNumbers.length > 0) {
  //         clashOrUnclash = "Unclash";
  //         for(f in unclashableSerialNumbers) {
  //           if(currentEquipmentCalendarArray[x].serialNumbers.indexOf(unclashableSerialNumbers[f]) == -1) {
  //             currentEquipmentCalendarArray[x].serialNumbers.push(unclashableSerialNumbers[f]);
  //             serialNumber = unclashableSerialNumbers[f];
  //             break;
  //           }
  //         }
  //       } else {
  //         clashOrUnclash = "Clash";
  //         for(f in clashableSerialNumbers) {
  //           if(currentEquipmentCalendarArray[x].serialNumbers.indexOf(clashableSerialNumbers[f]) == -1) {
  //             currentEquipmentCalendarArray[x].serialNumbers.push(clashableSerialNumbers[f]);
  //             serialNumber = clashableSerialNumbers[f];
  //             break;
  //           }
  //         }
  //       }

  //       equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

  //       currentEquipmentCalendarArray[x].startDate = new Date(startDate);
  //       currentEquipmentCalendarArray[x].endDate = new Date(endDate);
  //       currentEquipmentCalendarArray[x].invoiceId = details._id;
  //       currentEquipmentCalendarArray[x].title = customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item;
  //       currentEquipmentCalendarArray[x].customerName = customer.name;
  //       currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
  //       currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
  //       currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
  //       currentEquipmentCalendarArray[x].type = bookingStatus.type;
  //       currentEquipmentCalendarArray[x].customerId = bookingCustomer.customerId;
  //       currentEquipmentCalendarArray[x].bookingLineItemId = bookingLineItemId;
  //       currentEquipmentCalendarArray[x].url = "bookings/" + invoiceId;
  //       currentEquipmentCalendarArray[x].serialNumbers = currentEquipmentCalendarArray[x].serialNumbers;
  //       currentEquipmentCalendarArray[x].booked += 1;
  //       currentEquipmentCalendarArray[x].months = monthArray[x];
  //       currentEquipmentCalendarArray[x].dates = tempDateArray;

  //       delete currentEquipmentCalendarArray[x]._id;
  //       EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});

  //       if(insertedEquipmentCalendarIdArray.indexOf(equipmentCalendarId) == -1) {
  //         insertedEquipmentCalendarIdArray.push(equipmentCalendarId);
  //       }
  //     }
  //   } else {
  //     for(x in dateArrayMoment) {
  //       var tempDateArrayMoment = dateArrayMoment[x];
  //       tempDateArrayMoment.pop();
  //       tempDateArrayMoment.shift();

  //       var tempDateArray = dateArray[x];
  //       tempDateArray.pop();
  //       tempDateArray.shift();

  //       var startDate = tempDateArrayMoment[0];
  //       var endDate = tempDateArrayMoment[tempDateArrayMoment.length - 1];

  //       if(tempDateArrayMoment.length > 1) {
  //         startDate = startDate.add(1,'days')._d;
  //         endDate = endDate.add(2,'days')._d;
  //       } else {
  //         startDate = startDate.add(1,'days')._d;
  //         endDate = endDate._d;
  //       }

  //       var serialNumberArray = [];

  //       if(unclashableSerialNumbers.length > 0) {
  //         clashOrUnclash = "Unclash";
  //         serialNumber = unclashableSerialNumbers[0];
  //         serialNumberArray.push(serialNumber);
  //       } else {
  //         clashOrUnclash = "Clash";
  //         serialNumber = clashableSerialNumbers[0];
  //         serialNumberArray.push(serialNumber);
  //       }

  //       var equipmentCalendarAttributes = {
  //         startDate: new Date(startDate),
  //         endDate: new Date(endDate),
  //         invoiceId: invoiceId,
  //         title: customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item,
  //         customerName: customer.name,
  //         equipmentBrand: inventoryItem.brand,
  //         equipmentItem: inventoryItem.item,
  //         equipmentId: inventoryItem._id,
  //         type: bookingStatus.type,
  //         customerId: bookingCustomer.customerId,
  //         bookingLineItemId: bookingLineItemId,
  //         url: "bookings/" + details._id,
  //         serialNumbers: serialNumberArray,
  //         booked: 1,
  //         months: monthArray[x],
  //         dates: tempDateArray
  //       };

  //       equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);

  //       if(insertedEquipmentCalendarIdArray.indexOf(equipmentCalendarId) == -1) {
  //         insertedEquipmentCalendarIdArray.push(equipmentCalendarId);
  //       }
  //     }
  //   }

  //   if(bookingLineItem.packageClicked != undefined) { //there is a package
  //     var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});

  //     for(y in customerPackage.items) {
  //       if(customerPackage.items[y].id == bookingLineItem.itemId) {
  //         // CHECK WHETHER CUSTOMER PACKAGE HAS ENOUGH ITEMS
  //         if(customerPackage.items[y].quantity - bookingLineItem.days > 0) {
  //           bookingLineItem.discountPriced += bookingLineItem.days;
  //           customerPackage.items[y].quantity -= bookingLineItem.days;
  //         } else { // NOT ENOUGH IN CUSTOMER PACKAGE
  //           bookingLineItem.discountPriced += customerPackage.items[y].quantity;
  //           bookingLineItem.originalPriced += bbookingLineItem.days - customerPackage.items[y].quantity;
  //           customerPackage.items[y].quantity = 0;
  //         }
  //       }
  //     }

  //     // CHECK WHETHER BOOKING NEED TO ADD
  //     if(bookingLineItem.discountPriced > 0 && bookingStatus.customerPackagesUsed.indexOf(groupCounter+"_"+bookingLineItem.packageClicked) == -1) {
  //       bookingStatus.customerPackagesUsed.push(groupCounter+"_"+bookingLineItem.packageClicked);
  //     }

  //     var exists = false;
  //     var exists2 = false;

  //     for(a in bookingStatus.customerPackagesUsed) {
  //       var string2 = bookingStatus.customerPackagesUsed[a].split("_");
  //       if(string2[1] == bookingLineItem.packageClicked) {
  //         exists = true;
  //       }
  //     }

  //     // WE KNOW THAT CUSTOMER PACKAGE IS STILL BEING USED
  //     if(!exists) {
  //       for(b in customerPackage.bookings) {
  //         if(customerPackage.bookings[b].id == invoiceId) {
  //           customerPackage.bookings.splice(b,1);
  //         }
  //       }
  //     } else {
  //       for(b in customerPackage.bookings) {
  //         if(customerPackage.bookings[b].id == invoiceId) {
  //           exists2 = true;
  //         }
  //       }
  //       if(exists2 == false) {
  //         var obj = new Object();
  //         obj.id = invoiceId;
  //         obj.total = bookingPrice.total;
  //         obj.createdAt = booking.createdAt;

  //         customerPackage.bookings.push(obj);
  //       }
  //     }

  //     delete customerPackage._id;
  //     CustomerPackages.update({_id: bookingLineItem.packageClicked}, {$set: customerPackage});

  //   } else { // NO PACKAGE
  //     bookingLineItem.originalPriced += bookingLineItem.days;
  //   }

  //   for(x = (equipmentCalendarIdArray.length -1); x >= 0; x--) {
  //     if(insertedEquipmentCalendarIdArray.indexOf(equipmentCalendarIdArray[x]) != -1) {
  //       equipmentCalendarIdArray.splice(x, 1);
  //     }
  //   }

  //   // console.log("equipmentCalendarIdArray");
  //   // console.log(equipmentCalendarIdArray);

  //   newEquipmentCalendarIdArray = [];
  //   newInsertedEquipmentCalendarIdArray = [];
  //   var newDates = [];
  //   var newDateTimes = [];

  //   for(x in equipmentCalendars) {
  //       if(equipmentCalendars[x].serialNumbers.indexOf(serialNumber) != -1) {
  //         newEquipmentCalendarIdArray.push(equipmentCalendars[x]._id);

  //         var newCal = EquipmentCalendars.findOne({_id: equipmentCalendars[x]._id});

  //         for(y in newCal.dates) {
  //           if(newDates.indexOf(newCal.dates[y]) == -1) {
  //             newDates.push(newCal.dates[y]);
  //           }
  //         }
  //       }
  //   }

  //   // console.log("insertedEquipmentCalendarIdArray");
  //   // console.log(insertedEquipmentCalendarIdArray);

  //   // console.log("newDates");
  //   // console.log(newDates);

  //   for(x in insertedEquipmentCalendarIdArray) {
  //     var calId = EquipmentCalendars.findOne({_id: insertedEquipmentCalendarIdArray[x]});

  //     calId.dates.unshift(moment(calId.startDate).subtract(2, 'days').format("DD MM YYYY"));
  //     calId.dates.push(moment(calId.endDate).format("DD MM YYYY"));

  //     // console.log("calId.dates");
  //     // console.log(calId.dates);

  //     for(y in calId.dates) {
  //       if(newDates.indexOf(calId.dates[y]) != -1) {
  //         newInsertedEquipmentCalendarIdArray.push(calId._id);
  //         break;
  //       }
  //     }
  //   }

  //   if(newInsertedEquipmentCalendarIdArray.length == 0) {
  //     newInsertedEquipmentCalendarIdArray = insertedEquipmentCalendarIdArray;
  //   }

  //   // console.log("newEquipmentCalendarIdArray");
  //   // console.log(newEquipmentCalendarIdArray);

  //   // console.log("newInsertedEquipmentCalendarIdArray");
  //   // console.log(newInsertedEquipmentCalendarIdArray);

  //   if(clashOrUnclash == "Unclash") {
  //     var obj = new Object();
  //     obj.serialNo = serialNumber;
  //     obj.status = "N/A";
  //     obj.itemId = bookingLineItem.itemId;
  //     obj.groupId = groupCounter;
  //     bookingLineItem.unclashableSerialNumbers.push(obj);
  //   } else {
  //     var obj = new Object();
  //     obj.serialNo = serialNumber;
  //     obj.status = "N/A";
  //     obj.itemId = bookingLineItem.itemId;
  //     obj.groupId = groupCounter;
  //     obj.clashCalendars = [];
  //     obj.clashCalendars = obj.clashCalendars.concat(newEquipmentCalendarIdArray);
  //     obj.originalCalendars = [];
  //     obj.originalCalendars = obj.originalCalendars.concat(newInsertedEquipmentCalendarIdArray);

  //     bookingLineItem.clashableSerialNumbers = bookingLineItem.clashableSerialNumbers.concat(obj);
  //     bookingLineItem.clash = true;
  //   }

  //   delete bookingLineItem._id;
  //   BookingLineItems.update({_id: bookingLineItemId}, {$set: bookingLineItem});

  //   if(clashOrUnclash == "Clash") {
  //     for(x in equipmentCalendars) {
  //       if(equipmentCalendars[x].serialNumbers.indexOf(serialNumber) != -1) {
  //         var bookingLineItem = BookingLineItems.findOne({_id: equipmentCalendars[x].bookingLineItemId});
          
  //         console.log(equipmentCalendars[x].bookingLineItemId);

  //         for(z in bookingLineItem.unclashableSerialNumbers) {
  //           if(bookingLineItem.unclashableSerialNumbers[z].serialNo == serialNumber) {
  //             var obj = new Object();
  //             obj.serialNo = serialNumber;
  //             obj.status = bookingLineItem.unclashableSerialNumbers[z].status;
  //             obj.clashCalendars = [];
  //             obj.clashCalendars = obj.clashCalendars.concat(newInsertedEquipmentCalendarIdArray);
  //             obj.originalCalendars = [];
  //             obj.originalCalendars = obj.originalCalendars.concat(newEquipmentCalendarIdArray);
  //             obj.groupId = bookingLineItem.unclashableSerialNumbers[z].groupId;
  //             obj.itemId = bookingLineItem.itemId;
  //             bookingLineItem.clashableSerialNumbers = bookingLineItem.clashableSerialNumbers.concat(obj);
  //             bookingLineItem.clash = true;

  //             bookingLineItem.unclashableSerialNumbers.splice(z, 1);

  //             delete bookingLineItem._id;
  //             BookingLineItems.update({_id: equipmentCalendars[x].bookingLineItemId}, {$set: bookingLineItem});

  //             Meteor.call("updateBookingStatus", equipmentCalendars[x].invoiceId);

  //             break;
  //           }
  //         }
  //       }

  //     }
  //   }


  //   returnObject.status = "OK";

  //   return returnObject;
  // },
	// minusQuantityToBookingLineItem: function(details) {

	// 	console.log(details);

	// 	var bookingLineItemId = details['id'];
 //    	var serialNo;
	// 	var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
	// 	var groupCounter = parseInt(bookingLineItem.groupCounter);
	// 	var invoiceId = details['_id'];
	// 	details.dates = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupCounter}).dates;
	// 	var bookingCustomer = BookingCustomers.findOne({invoiceId: invoiceId});
	// 	var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
	// 	var bookingPrice = BookingPrices.findOne({invoiceId: invoiceId});
	// 	var booking = Bookings.findOne({_id: invoiceId});
	// 	var customer = Customers.findOne({_id: bookingCustomer.customerId});
	// 	var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: groupCounter});
	// 	var returnObject = new Object();
	// 	var itemId = bookingLineItem.itemId;
	// 	var inventoryItem = Inventory.findOne({_id: itemId});

	// 	if(bookingLineItem.booked == 0) {
	//       returnObject.status = "MinusNoMore";

	//       return retunObject;
	//     }

	// 	var datesArray = [];
	// 	var dateTimeArray = [];

	// 	var arrayToBeReturned = [];
	// 	var arrayToBeReturnedDigits = [];

	// 	// FIND AVAILABLE EQUIPMENTS ON THESE DATES
	// 	// ADD QUANTITIES BACK
	// 	for(x in bookingGroup.dates) {
	//       datesArray.push(moment(bookingGroup.dates[x]).subtract(1, 'days').format("DD MM YYYY"))
	//     }

	// 	bookingLineItem.booked -= 1;

	//     // CHECK CLASHES AND IF THERE ARE
	//     // PUT IT BACK IN UNCLASHABLE VALUE
	// 	var clashableObject;

	// 	if(bookingLineItem.clashableSerialNumbers.length != 0) {
	// 		clashableObject = bookingLineItem.clashableSerialNumbers.pop();
 //      serialNo = clashableObject.serialNo;

	// 		for(b in clashableObject.clashCalendars) {
	// 			var equipmentCalendarClash = EquipmentCalendars.findOne({_id: clashableObject.clashCalendars[b]});
	// 			var clashBookingLineItemId = equipmentCalendarClash.bookingLineItemId;
	// 			var clashBookingLineItem = BookingLineItems.findOne({_id: clashBookingLineItemId});
 //        console.log("clashBookingLineItemId");
 //        console.log(clashBookingLineItemId);

 //        console.log("clashBookingLineItem");
 //        console.log(clashBookingLineItem);

	// 			for(c in clashBookingLineItem.clashableSerialNumbers) {

	// 				if(clashBookingLineItem.clashableSerialNumbers[c].serialNo == clashableObject.serialNo) {
	// 					var obj = new Object();
	// 					obj.serialNo = clashBookingLineItem.clashableSerialNumbers[c].serialNo;
	// 					obj.status = clashBookingLineItem.clashableSerialNumbers[c].status;
	// 					obj.itemId = clashBookingLineItem.itemId;
	// 					obj.groupId = parseInt(clashBookingLineItem.groupCounter);

	// 					clashBookingLineItem.unclashableSerialNumbers.push(obj);
	// 					clashBookingLineItem.clashableSerialNumbers.splice(c, 1);
	// 					if(clashBookingLineItem.clashableSerialNumbers.length == 0)
	// 						clashBookingLineItem.clash = false;

	// 					delete clashBookingLineItem._id;
	// 					BookingLineItems.update({_id: clashBookingLineItemId}, {$set: clashBookingLineItem});
 //            Meteor.call("updateBookingStatus", clashBookingLineItem.invoiceId);
	// 				}
	// 			}
	// 		}
	// 		if(bookingLineItem.clashableSerialNumbers.length == 0 && bookingLineItem.clash != "false") {
	// 			bookingLineItem.clash = false;
	// 		}
	// 	} else {
	// 		var popped = bookingLineItem.unclashableSerialNumbers.pop();
 //      serialNo = popped.serialNo;
	// 	}

	// 	// CUSTOMER PACKAGES
	// 	if(bookingLineItem.packageClicked != undefined) {
 //      if(bookingLineItem.discountPriced > 0) {
 //        var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});

 //        for(c in customerPackage.items) {
 //          if(customerPackage.items[c].id == string[1]) {
 //            // CHECK HOW MANY I NEED TO ADD BACK TO CUSTOMER PACKAGE

 //            // WILL HAVE EXTRA DISCOUNTED
 //            if(bookingLineItem.discountPriced > bookingLineItem.days) {
 //              // SUBTRACT DAYS
 //              bookingLineItem.discountPriced -= bookingLineItem.days;
 //              customerPackage.items[c].quantity += bookingLineItem.days;

 //            } else {
 //              // SUBTRACT WHATEVER DISCOUNT PRICED
 //              customerPackage.items[c].quantity += bookingLineItem.discountPriced;
 //              bookingLineItem.originalPriced = bookingLineItem.days - bookingLineItem.discountPriced;
 //              bookingLineItem.discountPriced = 0;
 //            }

 //            break;
 //          }
 //        }

 //        delete customerPackage._id;
 //        CustomerPackages.update({_id: bookingLineItem.packageClicked}, {$set: customerPackage});
 //      } else if(bookingLineItem.originalPriced > 0){
 //        bookingLineItem.originalPriced -= bookingLineItem.days;
 //      }
 //    } else {
 //      bookingLineItem.originalPriced -= bookingLineItem.days;
 //    }

	// 	delete bookingLineItem._id;
	// 	BookingLineItems.update({_id: details['id']}, {$set: bookingLineItem});

	// 	// AFFECT CALENDAR
	// 	var currentEquipmentCalendarArray = [];

 //    currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId}).fetch();

 //    var inventoryItem = Inventory.findOne({_id: itemId});
 //    var serialNumbersArray = [];
 //    var booked = bookingLineItem.booked;

 //    for(z in bookingLineItem.unclashableSerialNumbers) {
 //      serialNumbersArray.push(bookingLineItem.unclashableSerialNumbers[z].serialNo);
 //    }
 //    for(z in bookingLineItem.clashableSerialNumbers) {
 //      serialNumbersArray.push(bookingLineItem.clashableSerialNumbers[z].serialNo);
 //    }

	// 	if(booked != 0) {
 //      var dateArray = [];
 //      var dateArrayMoment = [];
 //      var counter = 0;
 //      dateArray[counter] = [];
 //      dateArrayMoment[counter] = [];

 //      for(x in details.dates) {
 //        details.dates[x] = parseInt(moment(details.dates[x]).format('x'));
 //      }

 //      details.dates.sort();

 //      for(x in details.dates) {
 //        details.dates[x] = moment(details.dates[x]).subtract(1, 'days')._d;
 //      }

 //      for(x in details.dates) {
 //        if(dateArray[counter].length == 0) {
 //          dateArray[counter].push(moment(details.dates[x]).format('DD MM YYYY'));
 //          dateArrayMoment[counter].push(moment(details.dates[x]));
 //        } else {
 //          var date2 = moment(details.dates[x]).subtract(1, 'days');

 //          if(date2.format('DD MM YYYY') == dateArray[counter][dateArray[counter].length - 1]) {
 //            dateArray[counter].push(moment(details.dates[x]).format('DD MM YYYY'));
 //            dateArrayMoment[counter].push(moment(details.dates[x]));
 //          } else {
 //            counter += 1;
 //            dateArray[counter] = [];
 //            dateArray[counter].push(moment(details.dates[x]).format('DD MM YYYY'));
 //            dateArrayMoment[counter] = [];
 //            dateArrayMoment[counter].push(moment(details.dates[x]));
 //          }

 //        }
 //      }

 //      for(x in dateArrayMoment) {
 //        var monthArray = [];

 //        var startMonth = dateArrayMoment[x][0].format('MM YYYY');
 //        var endMonth = dateArrayMoment[x][dateArrayMoment[x].length - 1].format('MM YYYY');

 //        var startString = startMonth.split(" ");
 //        var endString = endMonth.split(" ");

 //        if(startString[0] > endString[0]) {
 //          //means go to next year
 //          for(r = startString[0]; r <= 12; r++) {
 //            monthArray.push(r + " " + startString[1]);
 //          }
 //          for(r = 1; r <= endString[0]; r++) {
 //            monthArray.push(r + " " + endString[1]);
 //          }
 //        } else {
 //          for(r = startString[0]; r <= endString[0]; r++) {
 //            monthArray.push(r + " " + startString[1]);
 //          }
 //        }

 //        equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

 //        if(dateArrayMoment[x].length == 1) {
 //          currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
 //          currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(1, "days"));
 //        } else {
 //          currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
 //          currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(2, "days"));
 //        }

 //        currentEquipmentCalendarArray[x].invoiceId = invoiceId;
 //        currentEquipmentCalendarArray[x].title = customer.name + ": " + inventoryItem.brand + " " + inventoryItem.item;
 //        currentEquipmentCalendarArray[x].customerName = customer.name;
 //        currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
 //        currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
 //        currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
 //        currentEquipmentCalendarArray[x].customerId = bookingCustomer.customerId;
	// 			currentEquipmentCalendarArray[x].bookingLineItemId = bookingLineItemId;
 //        currentEquipmentCalendarArray[x].url = "bookings/" + invoiceId;
 //        currentEquipmentCalendarArray[x].serialNumbers = serialNumbersArray;
 //        currentEquipmentCalendarArray[x].booked = booked;
 //        currentEquipmentCalendarArray[x].months = monthArray;
 //        currentEquipmentCalendarArray[x].dates = dateArray[x];

 //        delete currentEquipmentCalendarArray[x]._id;
 //        EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});
 //      }
 //    } else {
 //      EquipmentCalendars.remove({invoiceId: invoiceId, equipmentId: itemId, bookingLineItemId: bookingLineItemId});
 //    }

 //    returnObject.serialNo = serialNo;
	// 	return returnObject;
	// },
	removeBookingLineItem: function(details) {

    var bookingLineItemId = details['id'];
    var invoiceId = details['_id'];

    var datesArray = [];
    var bookingLineItem = BookingLineItems.findOne({_id: bookingLineItemId});
    var bookingGroup = BookingGroups.findOne({invoiceId: invoiceId, groupId: parseInt(bookingLineItem.groupCounter)});
    var bookingStatus = BookingStatuses.findOne({invoiceId: invoiceId});
    var availableEquipments;

    var type = bookingStatus.type;
    var datesArray = [];

    // AMEND AVAILABLE EQUIPMENTS
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

    // IF THE REMOVED BOOKING LINE ITEM IS UNDER A PACKAGE, CHECK TO SEE WHETHER
    // THE QUANTITY OF PACKAGE ITEMS USED IS ZERO, THERE MAY BE SOME ITEMS IN
    // OTHER GROUPS
    if(bookingLineItem.packageClicked != undefined && bookingLineItem.discountPriced > 0) {
      var customerPackage = CustomerPackages.findOne({_id: bookingLineItem.packageClicked});
      if(customerPackage.items) {
        for(x in customerPackage.items) {
          if(customerPackage.items[x].id == string[1]) {
            customerPackage.items[x].quantity += bookingLineItem.discountPriced;
          }
        }
      }

      var exists = false;

      for(x in bookingStatus.customerPackagesUsed) {
        var string2 = bookingStatus.customerPackagesUsed[x].split("_");

        if(string2[1] == bookingLineItem.packageClicked && bookingStatus.customerPackagesUsed[x] != bookingLineItem._id + "_" + bookingLineItem.packageClicked)
          exists = true;

        if(bookingStatus.customerPackagesUsed[x] == bookingLineItem._id + "_" + bookingLineItem.packageClicked)
          bookingStatus.customerPackagesUsed.splice(x,1);
      }

      if(!exists) {
        for(y in customerPackage.bookings) {
          if(customerPackage.bookings[y].id == invoiceId) {
            customerPackage.bookings.splice(y,1);

            break;
          }
        }
      }

      delete customerPackage._id;
      CustomerPackages.update({_id: bookingLineItem.packageClicked}, {$set: customerPackage});
    }

    var serialNumberArray = [];

    if(bookingLineItem.clash == true && bookingLineItem.clashableSerialNumbers.length > 0) {
      for(a in bookingLineItem.clashableSerialNumbers) {
        for(b in bookingLineItem.clashableSerialNumbers[a].clashCalendars) {
          var checkCalendar = EquipmentCalendars.findOne({_id: bookingLineItem.clashableSerialNumbers[a].clashCalendars[b]});

          var clashBookingLineItem = BookingLineItems.findOne({_id: checkCalendar.bookingLineItemId});

          for(d in clashBookingLineItem.clashableSerialNumbers) {
            if(clashBookingLineItem.clashableSerialNumbers[d].serialNo == bookingLineItem.clashableSerialNumbers[a].serialNo) {

              var obj = new Object();
              obj.serialNo = bookingLineItem.clashableSerialNumbers[a].serialNo;
              obj.status = bookingLineItem.clashableSerialNumbers[a].status;
              obj.itemId = bookingLineItem.itemId;
              obj.groupId = bookingLineItem.groupCounter;

              clashBookingLineItem.unclashableSerialNumbers.push(obj);
              clashBookingLineItem.clashableSerialNumbers.splice(d,1);



              if(clashBookingLineItem.clashableSerialNumbers.length == 0) {
                clashBookingLineItem.clash = false;
              }

              break;
            }
          }

          delete clashBookingLineItem._id;

          BookingLineItems.update({_id: checkCalendar.bookingLineItemId}, {$set: clashBookingLineItem});
          Meteor.call("updateBookingStatus", clashBookingLineItem.invoiceId);
        }
      }
    }

    // REMOVE EQUIPMENT CALENDARS
    EquipmentCalendars.remove({bookingLineItemId: bookingLineItemId});

    // FINALLY REMOVE DATABASE ROW
    BookingLineItems.remove(details['id']);

    return bookingLineItem;
  }
})
