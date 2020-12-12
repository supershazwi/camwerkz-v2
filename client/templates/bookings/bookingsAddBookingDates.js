var oktoadd = false;
var interval;


Template.bookingsAddBookingDates.created = function () {

	interval = Meteor.setInterval(function () {
		oktoadd = true;

	    Meteor.clearInterval(interval);

	  }, 500);

	this.subscribe('bookinggroupsByBooking', Router.current().params._id);
	this.subscribe('bookingstatusesbybooking', Router.current().params._id);
	this.subscribe('bookingacknowledgeremarksByBooking', Router.current().params._id);
	this.subscribe('bookingsigninsbybooking', Router.current().params._id);
	this.subscribe('bookingsignoutsbybooking', Router.current().params._id);
	// this.subscribe('availableequipmentsbybooking', Router.current().params._id);
	this.subscribe('bookinggrouppricesByBooking', Router.current().params._id);
	this.subscribe('bookingpricesByBooking', Router.current().params._id);
	this.subscribe('calendarsbybooking', Router.current().params._id);
	this.subscribe('bookingoverbookedbybooking', Router.current().params._id);
	// this.subscribe('bookinglineitemsByBooking', Router.current().params._id);
	this.subscribe('bookingcustomersByBooking', Router.current().params._id);
	this.subscribe('bookingcustomersByBooking2', Router.current().params._id);
	this.subscribe('logsByBooking', Router.current().params._id);
	// Meteor.subscribe('equipmentCalendars');

	
	var obj = new Object();
	obj.bookingId = Router.current().params._id;
	obj.groupId = parseInt(Session.get("bookingGroupClicked"));
	this.subscribe('bookinglineitemsByBooking2', obj);
  	this.subscribe("equipmentcalendarsbybooking3", Router.current().params._id);	


	this.subscribe('inventoriesByBooking', Router.current().params._id);
};
Template.bookingsAddBookingDates.onDestroyed(function () {
  // deregister from some central store
  Meteor.call("overbookedOK", Router.current().params._id);
});

Template.bookingsAddBookingDates.rendered = function () {

	var checkBookingLineItems = BookingLineItems.find({invoiceId: Router.current().params._id}, {fields: {itemId: 1}}).fetch();

	this.autorun(function () {
		Meteor.subscribe('equipemntCalendarsByStartAndEnd', checkBookingLineItems, Session.get("firstDate"), Session.get("lastDate"));

	}.bind(this));

	var blank = [];
	Session.setTemp("eventIdArray", blank);

	var calendar;
	Session.clear("dateArray");

	var first = true;

	var bookingGroup = BookingGroups.findOne({invoiceId: Router.current().params._id, groupId: parseInt(Session.get("bookingGroupClicked"))});
	var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
	var dateArray = [];
	var originalDateArray = [];

	if(bookingGroup!=undefined) {
		for(x in bookingGroup.dates) {
			dateArray.push(parseInt(moment(bookingGroup.dates[x]).subtract(1, 'days').format("x")));
			originalDateArray.push(parseInt(moment(bookingGroup.dates[x]).subtract(1, 'days').format("x")));
		}
	}

	var dateArrayYolo;

	Session.setTemp("dateArray", dateArray);
	if(bookingStatus.displayDates.length != 0 && bookingStatus.displayDates[Session.get("bookingGroupClicked")] != undefined) {
		dateArrayYolo = bookingStatus.displayDates[Session.get("bookingGroupClicked")].dateArray;
	}
	
	var length = 0;

	if(dateArrayYolo != undefined) {
		for(x in dateArrayYolo) {
			if(dateArrayYolo[x] != null) {
				length++;
			}
		}
	}
	

	var finalDisplayDateArray = [];
	var finalDisplayDateArray2 = [];
	var displayDateArray = [];
	scheduler.clearAll();

	var lengthtomatch = 0;

	scheduler.config.active_link_view = "Day";
	scheduler.config.dblclick_create = true;
	scheduler.config.edit_on_create = false;
	scheduler.config.drag_create = true;
	scheduler.config.full_day = true;
	scheduler.config.month_day_min_height = 250;

	scheduler.attachEvent("onEventAdded", function(id,ev){
      console.log("onEventAdded start");

      var eventIdArraySession = Session.get("eventIdArray");
    if(eventIdArraySession.indexOf(id) == -1) {
      eventIdArraySession.push(id);
      Session.setTemp("eventIdArray", eventIdArraySession);


      var start = ev.start_date;
      var end = ev.end_date;
      var dateArray2 = [];
      if(Session.get("dateArray")) {
        dateArray2 = Session.get("dateArray");
      }

      var addedDates = [];
      while(moment(start).format('YYYY-MM-DD') != moment(end).format('YYYY-MM-DD')) {
          var startMoment = parseInt(moment(start).format("x"));
          if(dateArray2.indexOf(startMoment) == -1) {
            dateArray2.push(startMoment);
            addedDates.push(startMoment);
          }
          start = moment(start).add(1, 'days');
      }

      Session.setTemp("dateArray", dateArray2);
      scheduler.showEvent(id);

      Session.setTemp("dateArray", Session.get("dateArray").sort());  
      var startMonth = moment(Session.get("dateArray")[0]).format('MM YYYY');
      var endMonth = moment(Session.get("dateArray")[Session.get("dateArray").length - 1]).format('MM YYYY');

      Session.setTemp("startMonth2", startMonth);
      Session.setTemp("endMonth2", endMonth);

      if(lengthtomatch == length && oktoadd == true) {
        var attributes = {
            _id: Router.current().params._id,
            id: Session.get("bookingGroupClicked"),
            eventAdded: id,
            dates: Session.get("dateArray"),
            addedDates: addedDates,
            originalBooking: Bookings.findOne({_id: Router.current().params._id})
        };

        Meteor.call('addBookingDatesToGroup', attributes, function(error, result) {

          if (result == undefined || result.status != "Revert") {
            Meteor.call("overbookedOK", Router.current().params._id);
          }

          if(result != undefined) {
            Meteor.call("overbookedOK", Router.current().params._id);
          if (result.status == "Revert") {

            scheduler.deleteEvent(id);
            console.log("before: " + Session.get("dateArray").length);

            var temporary = Session.get("dateArray");
            for(aa = (addedDates.length - 1); aa >= 0; aa--) {
              if(temporary.indexOf(addedDates[aa]) != -1) {
                temporary.splice(temporary.indexOf(addedDates[aa]), 1);
              }
            }

            Session.setTemp("dateArray", temporary);
            console.log("after: " + Session.get("dateArray").length);
            console.log("--------");

            console.log(addedDates);

            Meteor.call("overbookedDone", Router.current().params._id);

            IonPopup.show({
                  title: "Overbooked!",
                  template: "<div style='width: 100%; text-align: center;'><ul>"+result.string+"</ul></div>",
                  buttons: [{
                    text: 'OK',
                    type: 'button-stable',
                    onTap: function() {
                      Meteor.call("overbookedOK", Router.current().params._id);
                      IonPopup.close();
                    }
                  },
                  {
                    text: 'View Calendar',
                    type: 'button-positive',
                    onTap: function() {
                      Meteor.call("overbookedOK", Router.current().params._id);
                      IonPopup.close();
                    Session.setTemp('dates', result['datesDigits']);
                    Session.setTemp('equipments', result['inventoryItemIds']);

                    var gtd = result['datesDigits'][0];

                    var string20 = gtd.split(" ");

                    gtd = string20[1] + " " + string20[0] + " " + string20[2];

                    Session.setTemp("routerId", Router.current().params._id); 

                    Session.setTemp("goToDate", new Date(gtd));

                    Router.go('overbookedCalendars', {}, {});
                    }
                  }]
              });
          } else if (result.status == "Both_Affected") {
            Meteor.call("overbookedOK", Router.current().params._id);
            var eventIdArraySession = Session.get("eventIdArray");

            var start = moment(result.startDate).subtract(1, 'days').format("DD MM YYYY");
            var end = moment(result.endDate).format("DD MM YYYY");
            var affectedIds = [];

            var newStart;
            var newEnd;
            for(x in eventIdArraySession) {

              if (start == moment(scheduler.getEvent(eventIdArraySession[x]).start_date).format("DD MM YYYY")) {
                newEnd = scheduler.getEvent(eventIdArraySession[x]).end_date;
                affectedIds.push(eventIdArraySession[x]);
              }
              else if (end == moment(scheduler.getEvent(eventIdArraySession[x]).end_date).format("DD MM YYYY")) {
                newStart = scheduler.getEvent(eventIdArraySession[x]).start_date;
                affectedIds.push(eventIdArraySession[x]);
              }
            }

            for(x in affectedIds) {
              scheduler.deleteEvent(affectedIds[x]);
            }

            for(r = (affectedIds.length - 1); r >= 0; r--) {
                if(eventIdArraySession.indexOf(affectedIds[r]) != -1) {
                  eventIdArraySession.splice(eventIdArraySession.indexOf(affectedIds[r]), 1);
                }
            }

            scheduler.deleteEvent(id);

            if(eventIdArraySession.indexOf(id) != -1) {
              eventIdArraySession.splice(eventIdArraySession.indexOf(id), 1);
            }

            var eventId = scheduler.addEvent({
                start_date: newStart,
                end_date:   newEnd,
                text:   "",
                color: "#ff4a4a",
                description: "default value"
            });
            scheduler.showEvent(eventId);
            eventIdArraySession.push(eventId);
            Session.setTemp("eventIdArray", eventIdArraySession);
          } else if (result.status == "Right_Affected") {
            Meteor.call("overbookedOK", Router.current().params._id);
            var eventIdArraySession = Session.get("eventIdArray");



            var start = moment(result.startDate).subtract(1, 'days').format("DD MM YYYY");
            var affectedIds = [];

            var newStart;
            var newEnd;



            for(x in eventIdArraySession) {

            	if(scheduler.getEvent(eventIdArraySession[x]) != undefined) {
            			if (start == moment(scheduler.getEvent(eventIdArraySession[x]).start_date).format("DD MM YYYY")) {


            			  newStart = moment(ev.start_date).format('YYYY-MM-DD');
            			  newEnd = scheduler.getEvent(eventIdArraySession[x]).end_date;
            			  affectedIds.push(eventIdArraySession[x]);
            			}
            	}
              
            }

            for(x in affectedIds) {
              scheduler.deleteEvent(affectedIds[x]);
            }

            for(r = (affectedIds.length -1); r >= 0; r--) {
              if(eventIdArraySession.indexOf(affectedIds[r]) != -1) {
                eventIdArraySession.splice(eventIdArraySession.indexOf(affectedIds[r]), 1);
              }
            }

            scheduler.deleteEvent(id);

            if(eventIdArraySession.indexOf(id) != -1) {
              eventIdArraySession.splice(eventIdArraySession.indexOf(id), 1);
            }

            var parts = newStart.match(/(\d+)/g);

            var eventId = scheduler.addEvent({
                start_date: new Date(parts[0], parts[1]-1, parts[2], 0, 0, 0, 0),
                end_date:   newEnd,
                text:   "",
                color: "#ff4a4a",
                description: "default value"
            });
            scheduler.showEvent(eventId);
            eventIdArraySession.push(eventId);
            Session.setTemp("eventIdArray", eventIdArraySession);
          } else if (result.status == "Left_Affected") {
            Meteor.call("overbookedOK", Router.current().params._id);
            var eventIdArraySession = Session.get("eventIdArray");



            var end = moment(result.endDate).format("DD MM YYYY");
            var affectedIds = [];

            var newStart;
            var newEnd;




            for(x in eventIdArraySession) {
            	if(scheduler.getEvent(eventIdArraySession[x]) != undefined) {
            		if (end == moment(scheduler.getEvent(eventIdArraySession[x]).end_date).format("DD MM YYYY")) {


            		  newStart = scheduler.getEvent(eventIdArraySession[x]).start_date;
            		  newEnd = moment(ev.end_date).format('YYYY-MM-DD');
            		  affectedIds.push(eventIdArraySession[x]);
            		}
            	}
              
            }



            for(x in affectedIds) {
              scheduler.deleteEvent(affectedIds[x]);
            }

            for(r = (affectedIds.length -1); r >= 0; r--) {
              if(eventIdArraySession.indexOf(affectedIds[r]) != -1) {
                eventIdArraySession.splice(eventIdArraySession.indexOf(affectedIds[r]), 1);
              }
            }

            scheduler.deleteEvent(id);

            if(eventIdArraySession.indexOf(id) != -1) {
              eventIdArraySession.splice(eventIdArraySession.indexOf(id), 1);
            }

            var parts = newEnd.match(/(\d+)/g);

            var eventId = scheduler.addEvent({
                start_date: newStart,
                end_date:   new Date(parts[0], parts[1]-1, parts[2], 0, 0, 0, 0),
                text:   "",
                color: "#ff4a4a",
                description: "default value"
            });

            scheduler.showEvent(eventId);
            eventIdArraySession.push(eventId);
            Session.setTemp("eventIdArray", eventIdArraySession);
            } else {
              Meteor.call("overbookedOK", Router.current().params._id);
              // if(bookingStatus.type == "Booking") {
              //  Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
              // }
            }
          }

          Meteor.call('updateOverallBookingPrice', Router.current().params._id, function(error, result) {
            Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
          });
          Meteor.call("updateBookingStatus", Router.current().params._id, function(error, result) {
            var displayDatesArray = result;
            var da = [];
            var arrtopush;

            for(a in displayDatesArray) {
              for(b in displayDatesArray[a].dateArray) {
                if(displayDatesArray[a].dateArray[b] != null) {
                  if(displayDatesArray[a].dateArray[b].length == 1) {
                    arrtopush = [];
                    arrtopush.push(displayDatesArray[a].dateArray[b][0]);
                  } else {
                    var length = parseInt(displayDatesArray[a].dateArray[b].length) - 1;
                    arrtopush = [];
                    arrtopush.push(displayDatesArray[a].dateArray[b][0] + " - " + displayDatesArray[a].dateArray[b][length]);
                  }
                  da.push(arrtopush);
                }
              }
            }



            var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

            var attributes = {
              _id: Router.current().params._id,
              content: Meteor.user().username + " updated dates to " + da.join() + ".",
              universalContent: Meteor.user().username + "updated dates of " + bookingStatus.type + " " + Router.current().params._id + " to " + da.join() + ".",
              ownerUsername: Meteor.user().username,
              type: bookingStatus.type,
              url: Router.current().params._id,
              ownerId: Meteor.userId()
            };

            Meteor.call("insertLog", attributes);
            Meteor.call("insertUniversalLog", attributes);


          });
        });
      } else {
        lengthtomatch++;
      }   
    }

    console.log("onEventAdded finish");

  });

	scheduler.attachEvent("onClick", function (id, e){
      console.log("onClick");

      Meteor.call("overbookedDone", Router.current().params._id);

       //any custom logic here
       var eventObj = scheduler.getEvent(id);


       if(eventObj != undefined) {
       		var start = eventObj.start_date;
		   var end = eventObj.end_date;
	       var dateArray = Session.get("dateArray");
	       var removedDates = [];

	       var originalDates = Session.get("dateArray");

	       	if(moment(start).format('YYYY-MM-DD') != moment(end).format('YYYY-MM-DD')) {
	       		while(moment(start).format('YYYY-MM-DD') != moment(end).format('YYYY-MM-DD')) {
			  	  var startMoment = parseInt(moment(start).format("x"));
			  	  removedDates.push(startMoment);
			  	  var index = dateArray.indexOf(startMoment);
			  	  if(index != -1) {
			  	  	removedDates.push()
			  	  	dateArray.splice(index, 1);
			  	  }

			  	  start = moment(start).add(1, 'days');
			    }
	       	} else {
	       		var startMoment = parseInt(moment(start).format("x"));
	       		removedDates.push(startMoment);
	       		var index = dateArray.indexOf(startMoment);
				if(index != -1) {
					dateArray.splice(index, 1);
				}
	       	}


		   	Session.setTemp("dateArray", dateArray);
	       	scheduler.deleteEvent(id);

	       	var eventIdArraySession = Session.get("eventIdArray");
	       	for(r in eventIdArraySession) {
	       		if(eventIdArraySession[r] == id) {

	       			eventIdArraySession.splice(r, 1);
	       		}
	       	}

	       	Session.setTemp("eventIdArray", eventIdArraySession);




	       	Session.setTemp("dateArray", Session.get("dateArray").sort());

			    var startMonth = moment(Session.get("dateArray")[0]).format('MM YYYY');
			    var endMonth = moment(Session.get("dateArray")[Session.get("dateArray").length - 1]).format('MM YYYY');

			    Session.setTemp("startMonth2", startMonth);
			    Session.setTemp("endMonth2", endMonth);

			    var attributes = {
			        _id: Router.current().params._id,
			        id: Session.get("bookingGroupClicked"),
			        updatedDates: Session.get("dateArray"),
			        removedDates: removedDates,
			        originalDates: originalDates,
			        originalBooking: Bookings.findOne({_id: Router.current().params._id})
			    };



			    Meteor.call('deleteBookingDatesFromGroup', attributes, function(error, result) {

						Meteor.call('updateOverallBookingPrice', Router.current().params._id, function(error, result) {
									Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
								});
						Meteor.call("updateBookingStatus", Router.current().params._id);

            Meteor.call("overbookedOK", Router.current().params._id);
			    });

	       return true;
       }

	});



	scheduler.attachEvent("onEventCreated", function (event_id) {
		console.log("onEventCreated");
    var ev = scheduler.getEvent(event_id);
		ev.text = "";
		ev.color = "#ff4a4a";
		//full day event, 'full day' will be checked
		ev.start_date = scheduler.date.date_part(new Date(ev.start_date));
		ev.end_date = scheduler.date.add(ev.start_date, 1, 'day')
		ev.description = "default value";
	});

	scheduler.init("scheduler", new Date(), "month");

	Session.setTemp("firstDate", scheduler.getState().min_date);
	Session.setTemp("lastDate", scheduler.getState().max_date);

	//console.log(booking);
	//database dates are 1 day after
	for(x in bookingGroup.dates) {
		var momento = moment(bookingGroup.dates[x]).subtract(1, 'days');
        bookingGroup.dates[x] = momento._d;
	}

	var arrayToBeAdded = [];
	var addCounter = 0;
	finalDisplayDateArray[addCounter] = [];
	finalDisplayDateArray2[addCounter] = [];

	for(x in bookingGroup.dates) {
		arrayToBeAdded.push(moment(bookingGroup.dates[x]).format("MM-DD-YYYY 00:00"));
	}

	for(x in bookingGroup.dates) {
		if(finalDisplayDateArray[addCounter].length == 0) {
			finalDisplayDateArray[addCounter].push(moment(bookingGroup.dates[x]).format("MM-DD-YYYY 00:00"));
			finalDisplayDateArray2[addCounter].push(moment(bookingGroup.dates[x]));
		} else {
			if(moment(bookingGroup.dates[x]).subtract(1, 'days').format("MM-DD-YYYY 00:00") == arrayToBeAdded[x-1]) {
				finalDisplayDateArray[addCounter].push(moment(bookingGroup.dates[x]).format("MM-DD-YYYY 00:00"));
				finalDisplayDateArray2[addCounter].push(moment(bookingGroup.dates[x]));
			} else {

				addCounter += 1;
				finalDisplayDateArray[addCounter] = [];
				finalDisplayDateArray[addCounter].push(moment(bookingGroup.dates[x]).format("MM-DD-YYYY 00:00"));

				finalDisplayDateArray2[addCounter] = [];
				finalDisplayDateArray2[addCounter].push(moment(bookingGroup.dates[x]));
			}
		}
	}

	// // i want my final display date array to be
	// // [Array[2]]
	// //   0: Array[1]
	// // 		0: "12-03-2015 00:00"
	// //   1: Array[3]
	// //      0: "12-09-2015 00:00"
	// //      1: "12-10-2015 00:00"
	// //      2: "12-11-2015 00:00"

	var eventIdArray = [];


	for(x in finalDisplayDateArray) {
		var startDate = finalDisplayDateArray[x][0];
		if(startDate != undefined) {
			var string = startDate.split("-");
			startDate = string[1] + "-" + string[0] + "-" + string[2];
			var endDate;
			endDate = moment(finalDisplayDateArray2[x][finalDisplayDateArray2[x].length - 1]).add(1, 'days').format('MM-DD-YYYY 00:00');
			var string = endDate.split("-");
			endDate = string[1] + "-" + string[0] + "-" + string[2];

			var eventId = scheduler.addEvent({
			    start_date: startDate,
			    end_date:   endDate,
			    text:   "",
			    color: "#ff4a4a",
			    description: "default value"
			});
			scheduler.showEvent(eventId);
			eventIdArray.push(eventId);
			Session.setTemp("eventIdArray", eventIdArray);
		}
	}


};

Template.bookingsAddBookingDates.helpers({
  checkNone: function() {
    if(BookingOverbooked.findOne({invoiceId: Router.current().params._id}).status != "OK") {
      return "hidden";
    } else {
      return "visible";
    }
  },
	checkingoverbooked: function() {
		if(BookingOverbooked.findOne({invoiceId: Router.current().params._id}) != undefined)
			return BookingOverbooked.findOne({invoiceId: Router.current().params._id}).status != "OK";
	},
	overbookedStatus: function() {
		if(BookingOverbooked.findOne({invoiceId: Router.current().params._id}) != undefined)
			return BookingOverbooked.findOne({invoiceId: Router.current().params._id}).status;
	},
	datesExist: function() {
		var bookingGroup = BookingGroups.findOne({invoiceId: Router.current().params._id, groupId: parseInt(Session.get("bookingGroupClicked"))});
		var empty = true;

		if(bookingGroup.dates.length > 0) {
			empty = false;
		}

		if(empty) {
			var array = [];
			var obj = new Object();
			obj.dateArray = [];
			array.push(obj);
			Session.setTemp("arrayOfDateObjects", array);
		}

		if(bookingGroup.dates.length > 0) {
			return true;
		} 
		else {
			if(Session.get("arrayOfDateObjects")) {
				var arrayOfDateObjects = Session.get("arrayOfDateObjects");

				arrayOfDateObjects[Session.get("bookingGroupClicked")].dateArray = [];

				Session.setTemp("arrayOfDateObjects", arrayOfDateObjects);
			}
			return false;
		}
	},
	groupNumber: function() {
		return parseInt(Session.get("bookingGroupClicked") + 1);
	},
	gotEndDate: function() {
	    return (this.length > 1);
	  },
	dates: function() {
    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

    if(bookingStatus != undefined) {
			for(x in bookingStatus.displayDates) {
				if(bookingStatus.displayDates[x].id == Session.get("bookingGroupClicked")) {
	        return bookingStatus.displayDates[x].dateArray;
				}
			}
    }
  },
	dateArray: function() {
		return this;
	},
  startDate: function() {
    return this[0];
  },
  endDate: function() {
    return this[this.length - 1];
  },
});

Template.bookingsAddBookingDates.events({
	'click #saveDates': function() {
		// $('.pull-left').click();

		Router.go('bookings.show', {_id: Router.current().params._id}, {});
	}
});