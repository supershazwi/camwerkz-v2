EquipmentCalendars = new Mongo.Collection('equipmentCalendars');

Meteor.methods({
	addToEquipmentCalendar: function(details) {

		

		var booking = Bookings.findOne({_id: details['_id']});

		var string = details['id'].split("_");

		var update = false;
		var currentEquipmentCalendar;

		var currentEquipmentCalendarArray = [];

		var originalEquipmentCalendarArray = [];

		var clashEquipmentCalendarArray = [];

		var clashSerialNumbers = [];

		var groupId = parseInt(string[0]);
		groupId = groupId + 1;
		groupId = details._id+"_"+groupId;

		if(EquipmentCalendars.findOne({invoiceId: details['_id'], equipmentId: string[1], groupId: parseInt(groupId)}) != undefined) {
			update = true;
			currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: details['_id'], equipmentId: string[1], groupId: parseInt(groupId)}).fetch();
		} else {
			update = false;
		}

		var inventoryItem = Inventory.findOne({_id: string[1]});

		var serialNumbersArray = [];

		for(x in booking.equipmentDetails) {
			for(y in booking.equipmentDetails[x].items) {
				if(booking.equipmentDetails[x].items[y].itemId == string[1] && booking.equipmentDetails[x].id == string[0]) {
					for(z in booking.equipmentDetails[x].items[y].unclashableSerialNumbers) {
						serialNumbersArray.push(booking.equipmentDetails[x].items[y].unclashableSerialNumbers[z].serialNo);
					}
					for(z in booking.equipmentDetails[x].items[y].clashableSerialNumbers) {
						serialNumbersArray.push(booking.equipmentDetails[x].items[y].clashableSerialNumbers[z].serialNo);
					}
				}
			}
		}
		var dateArray = [];
		var dateArrayMoment = [];
		var counter = 0;
		var booked = 0;
		dateArray[counter] = [];
		dateArrayMoment[counter] = [];
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
		for(x in booking.equipmentDetails[string[0]].items) {
			if(booking.equipmentDetails[string[0]].items[x].itemId == string[1]) {
				booked = booking.equipmentDetails[string[0]].items[x].booked;
				break;
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

	        var groupId = parseInt(string[0]);
			groupId = groupId + 1;

			var equipmentCalendarId;

	        if(dateArrayMoment[x].length == 1) {
	        	//it means that the start and end date is the same

	        	if(update == false) {
	        		//there are no existing calendars
	        		var equipmentCalendarAttributes = {
						startDate: new Date(dateArrayMoment[x][0].add(1, "days")),
						endDate: new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(1, "days")),
						invoiceId: details._id,
						title: booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item,
						customerName: booking.customerName,
						equipmentBrand: inventoryItem.brand,
						equipmentItem: inventoryItem.item,
						equipmentId: inventoryItem._id,
						customerId: booking.customerId, 
						groupId: details._id + "_" + groupId,
						url: "bookings/" + details._id,
						serialNumbers: serialNumbersArray,
						booked: booked,
						months: monthArray,
						dates: dateArray[x]
					}; 

					equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);
		        } else {
		        	//there are existing calendars
		        	equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

					currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
					currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][0]);
					currentEquipmentCalendarArray[x].invoiceId = details._id;
					currentEquipmentCalendarArray[x].title = booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item;
					currentEquipmentCalendarArray[x].customerName = booking.customerName;
					currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
					currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
					currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
					currentEquipmentCalendarArray[x].customerId = booking.customerId;
					currentEquipmentCalendarArray[x].groupId = details._id + "_" + groupId;
					currentEquipmentCalendarArray[x].url = "bookings/" + details._id;
					currentEquipmentCalendarArray[x].serialNumbers = serialNumbersArray;
					currentEquipmentCalendarArray[x].booked = booked;
					currentEquipmentCalendarArray[x].months = monthArray;
					currentEquipmentCalendarArray[x].dates = dateArray[x];

					delete currentEquipmentCalendarArray[x]._id;
					EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});
		        }


		        originalEquipmentCalendarArray = originalEquipmentCalendarArray.concat(equipmentCalendarId);

	        } else {
	        	if(update == false) {
	        		var equipmentCalendarAttributes = {
						startDate: new Date(dateArrayMoment[x][0].add(1, "days")),
						endDate: new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(2, "days")),
						invoiceId: details._id,
						title: booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item,
						customerName: booking.customerName,
						equipmentBrand: inventoryItem.brand,
						equipmentItem: inventoryItem.item,
						equipmentId: inventoryItem._id,
						customerId: booking.customerId, 
						groupId: details._id + "_" + groupId,
						url: "bookings/" + details._id,
						serialNumbers: serialNumbersArray,
						booked: booked,
						months: monthArray,
						dates: dateArray[x]
					}; 

					equipmentCalendarId = EquipmentCalendars.insert(equipmentCalendarAttributes);
	        	} else {
	        		equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

					currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
					currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(2, "days"));
					currentEquipmentCalendarArray[x].invoiceId = details._id;
					currentEquipmentCalendarArray[x].title = booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item;
					currentEquipmentCalendarArray[x].customerName = booking.customerName;
					currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
					currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
					currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
					currentEquipmentCalendarArray[x].customerId = booking.customerId;
					currentEquipmentCalendarArray[x].groupId = details._id + "_" + groupId;
					currentEquipmentCalendarArray[x].url = "bookings/" + details._id;
					currentEquipmentCalendarArray[x].serialNumbers = serialNumbersArray;
					currentEquipmentCalendarArray[x].booked = booked;
					currentEquipmentCalendarArray[x].months = monthArray;
					currentEquipmentCalendarArray[x].dates = dateArray[x];

					delete currentEquipmentCalendarArray[x]._id;
					EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});
	        	}


	        	originalEquipmentCalendarArray = originalEquipmentCalendarArray.concat(equipmentCalendarId);
	        }
		}

        for(x in booking.equipmentDetails[string[0]].items) {
        	if(booking.equipmentDetails[string[0]].items[x].id == details['id']) {
        		for(y in booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers) {
        			for(z in booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].clashCalendars) {
        				if(clashEquipmentCalendarArray.indexOf(booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].clashCalendars[z]) == -1) {
        					clashEquipmentCalendarArray = clashEquipmentCalendarArray.concat(booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].clashCalendars[z]);
        				}
        				if(clashSerialNumbers.indexOf(booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].serialNo) == -1) {
        					clashSerialNumbers.push(booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].serialNo);
        				}
        			}
        			for(z in originalEquipmentCalendarArray) {
        				if(booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].originalCalendars.indexOf(originalEquipmentCalendarArray[z]) == -1) {
        					booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].originalCalendars = booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[y].originalCalendars.concat(originalEquipmentCalendarArray[z]);
        				}
        			}
        		}
        	}
        }

        delete booking._id;
      	Bookings.update({_id: details['_id']}, {$set: booking});

      	var booking = Bookings.findOne({_id: details['_id']});

      	var newUn = [];

        for(x in clashEquipmentCalendarArray) {
        	var clashCalendar = EquipmentCalendars.findOne({_id: clashEquipmentCalendarArray[x]});
        	var invoiceId = clashCalendar.invoiceId;
        	var string2 = clashCalendar.groupId.split("_");
        	var groupId = parseInt(string2[1]) - 1;

        	var booking2 = Bookings.findOne({_id: invoiceId});
        	for(y in booking2.equipmentDetails[groupId].items) {
        		if(booking2.equipmentDetails[groupId].items[y].itemId == clashCalendar.equipmentId) {
        			for(z in booking2.equipmentDetails[groupId].items[y].unclashableSerialNumbers) {
        				if(clashSerialNumbers.indexOf(booking2.equipmentDetails[groupId].items[y].unclashableSerialNumbers[z].serialNo) != -1) {
        					var obj = new Object();
        					obj.serialNo = booking2.equipmentDetails[groupId].items[y].unclashableSerialNumbers[z].serialNo;
        					obj.status = booking2.equipmentDetails[groupId].items[y].unclashableSerialNumbers[z].status;
        					obj.clashCalendars = [];
        					obj.clashCalendars = obj.clashCalendars.concat(originalEquipmentCalendarArray);
        					obj.originalCalendars = [];
        					obj.originalCalendars = obj.originalCalendars.concat(clashEquipmentCalendarArray);

        					booking2.equipmentDetails[groupId].items[y].clashableSerialNumbers = booking2.equipmentDetails[groupId].items[y].clashableSerialNumbers.concat(obj);
        					booking2.equipmentDetails[groupId].items[y].clash = true;
        					booking2.status = "Clash";
        				}
        			}
        		}
        	}

        	for(y in booking2.equipmentDetails[groupId].items) {
        		if(booking2.equipmentDetails[groupId].items[y].itemId == clashCalendar.equipmentId) {
        			for(z in booking2.equipmentDetails[groupId].items[y].unclashableSerialNumbers) {
        				if(clashSerialNumbers.indexOf(booking2.equipmentDetails[groupId].items[y].unclashableSerialNumbers[z].serialNo) != -1) {
        					booking2.equipmentDetails[groupId].items[y].unclashableSerialNumbers.splice(z,1);
        				}
        			}
        		}
        	}

        	delete booking2._id;
      		Bookings.update({_id: invoiceId}, {$set: booking2});
        }

        
	},
	minusFromEquipmentCalendar: function(details) {
		var booking = Bookings.findOne({_id: details['_id']});

		var string = details['id'].split("_");

		var groupId = parseInt(string[0]);
		groupId = groupId + 1;
		groupId = details._id+"_"+groupId;

		var currentEquipmentCalendarArray = [];

		

		currentEquipmentCalendarArray = EquipmentCalendars.find({invoiceId: details['_id'], equipmentId: string[1], groupId: groupId+"_"+string[2]}).fetch();


		var inventoryItem = Inventory.findOne({_id: string[1]});

		var serialNumbersArray = [];
		var booked = 0;

		for(x in booking.equipmentDetails[string[0]].items) {
			if(booking.equipmentDetails[string[0]].items[x].itemId == string[1]) {
				booked = booking.equipmentDetails[string[0]].items[x].booked;
				break;
			}
		}

		for(x in booking.equipmentDetails[string[0]].items) {
			if(booking.equipmentDetails[string[0]].items[x].itemId == string[1]) {
				for(z in booking.equipmentDetails[string[0]].items[x].unclashableSerialNumbers) {
					serialNumbersArray.push(booking.equipmentDetails[string[0]].items[x].unclashableSerialNumbers[z].serialNo);
				}
				for(z in booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers) {
					serialNumbersArray.push(booking.equipmentDetails[string[0]].items[x].clashableSerialNumbers[z].serialNo);
				}
			}
		}


		

		if(booked != 0) {
			var dateArray = [];
			var dateArrayMoment = [];
			var counter = 0;
			var booked = 0;
			dateArray[counter] = [];
			dateArrayMoment[counter] = [];
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

			for(x in booking.equipmentDetails[string[0]].items) {
				if(booking.equipmentDetails[string[0]].items[x].itemId == string[1]) {
					booked = booking.equipmentDetails[string[0]].items[x].booked;
					break;
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

		        

				if(dateArrayMoment[x].length == 1) {
					var groupId = parseInt(string[0]);
					groupId = groupId + 1;

					equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

					currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
					currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(1, "days"));
					currentEquipmentCalendarArray[x].invoiceId = details._id;
					currentEquipmentCalendarArray[x].title = booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item;
					currentEquipmentCalendarArray[x].customerName = booking.customerName;
					currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
					currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
					currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
					currentEquipmentCalendarArray[x].customerId = booking.customerId;
					currentEquipmentCalendarArray[x].groupId = details._id + "_" + groupId + "_" + string[2];
					currentEquipmentCalendarArray[x].url = "bookings/" + details._id;
					currentEquipmentCalendarArray[x].serialNumbers = serialNumbersArray;
					currentEquipmentCalendarArray[x].booked = booked;
					currentEquipmentCalendarArray[x].months = monthArray;
					currentEquipmentCalendarArray[x].dates = dateArray[x];

					delete currentEquipmentCalendarArray[x]._id;
					EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});

				} else {
					var groupId = parseInt(string[0]);
					groupId = groupId + 1;

					equipmentCalendarId = currentEquipmentCalendarArray[x]._id;

					currentEquipmentCalendarArray[x].startDate = new Date(dateArrayMoment[x][0].add(1, "days"));
					currentEquipmentCalendarArray[x].endDate = new Date(dateArrayMoment[x][dateArrayMoment[x].length-1].add(2, "days"));
					currentEquipmentCalendarArray[x].invoiceId = details._id;
					currentEquipmentCalendarArray[x].title = booking.customerName + ": " + inventoryItem.brand + " " + inventoryItem.item;
					currentEquipmentCalendarArray[x].customerName = booking.customerName;
					currentEquipmentCalendarArray[x].equipmentBrand = inventoryItem.brand;
					currentEquipmentCalendarArray[x].equipmentItem = inventoryItem.item;
					currentEquipmentCalendarArray[x].equipmentId = inventoryItem._id;
					currentEquipmentCalendarArray[x].customerId = booking.customerId;
					currentEquipmentCalendarArray[x].groupId = details._id + "_" + groupId + "_" + string[2];
					currentEquipmentCalendarArray[x].url = "bookings/" + details._id;
					currentEquipmentCalendarArray[x].serialNumbers = serialNumbersArray;
					currentEquipmentCalendarArray[x].booked = booked;
					currentEquipmentCalendarArray[x].months = monthArray;
					currentEquipmentCalendarArray[x].dates = dateArray[x];

					delete currentEquipmentCalendarArray[x]._id;
					EquipmentCalendars.update({_id: equipmentCalendarId}, {$set: currentEquipmentCalendarArray[x]});
				}
			}
		} else {
			EquipmentCalendars.remove({invoiceId: details['_id'], equipmentId: string[1], groupId: groupId+"_"+string[2]});
		}
	},
	removeFromEquipmentCalendar: function(details) {
		
		var string = details['id'].split("_");
		var counter = parseInt(string[0]) + 1;
		var groupId2 = details['_id'] + "_" + counter;
		EquipmentCalendars.remove({invoiceId: details['_id'], equipmentId: string[1], groupId: parseInt(groupId2)});
	},
	updateEquipmentCalendar: function(details) {

	}
})