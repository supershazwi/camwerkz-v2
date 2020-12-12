Meteor.startup(function () {
// // code to run on server at startup
  SyncedCron.start();

  console.log("startup");

  SyncedCron.config({
    collectionName: 'somethingDifferent'
  });

  SyncedCron.add({
    name: 'Sync invoices from QuickBooks and Camwerkz app.',
    schedule: function(parser) {
      // parser is a later.parse object
      return parser.text('at 00:00 am');
    }, 
    job: function() {
      console.log("begin checking all bookings for notifications");

      var bookings = Bookings.find().fetch();

      for(e in bookings) {
            var invoiceId = bookings[e]._id;
            console.log(invoiceId);
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

      console.log("DONE");
    }
  });
});