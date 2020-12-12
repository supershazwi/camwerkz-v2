(function(){

Meteor.publish('customers', function() {
  return Customers.find();
});

Meteor.publish('qbcredentials', function() {
  return Qbcredentials.find();
});

Meteor.publish('customerByArray', function(customerArray) {
  return Customers.find({_id: {$in: customerArray}});
});

Meteor.publish("customerUpdate", function(customerId) {
  return CustomerUpdates.find({customerId: customerId});
});

Meteor.publish('bookingLineItemsByEquipmentGroup', function(invoiceId, equipmentGroup) {
  return BookingLineItems.find({invoiceId: invoiceId, groupCounter: parseInt(equipmentGroup)});
});

Meteor.publish('logsByCustomer', function(customerId) {
  return CustomerLogs.find({customerId: customerId});
});

Meteor.publish('logsByBookingCustomer', function(bookingId) {

  var bookingCustomer = BookingCustomers.findOne({invoiceId: bookingId});

  return CustomerLogs.find({customerId: bookingCustomer.customerId});
});

Meteor.publish('invoiceNeedingUpdateByCustomer', function(id) {

  return InvoiceNeedingUpdate.find({customerIdd: id});
});

Meteor.publish('customersByPrivilege', function(privilegeId) {
  var privilege = Privileges.findOne({_id: privilegeId});

  var customerId = [];

  for(x in privilege.customerId) {
    customerId.push(privilege.customerId[x]);
  }

  return Customers.find({_id: {$in: customerId}});
});

Meteor.publish('bookingsWithoutBaggage', function() {
  return Bookings.find();
});

Meteor.publish('bookingUpdate', function(bookingId) {
  return BookingUpdates.find({invoiceId: bookingId});
});

Meteor.publish('availablebycalendar', function(bookingId, calendar) {

});

Meteor.publish('equipmentCalendarsByStartStateEndState', function(details) {

  var bookingId = details.bookingId;
  var month = details.month;
  var groupId = details.groupId;

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId, groupCounter: groupId}, {fields: {itemId: 1}}).fetch();

  var equipmentIdArray = [];

  for(x in bookingLineItems) {
    equipmentIdArray.push(bookingLineItems[x].itemId);
  }

  var month_string = month.split(" ");
  var month;

  if(month_string[0] == "January") {
    month = "01";
  } else if(month_string[0] == "February") {
    month = "02";
  } else if(month_string[0] == "March") {
    month = "03";
  } else if(month_string[0] == "April") {
    month = "04";
  } else if(month_string[0] == "May") {
    month = "05";
  } else if(month_string[0] == "June") {
    month = "06";
  } else if(month_string[0] == "July") {
    month = "07";
  } else if(month_string[0] == "August") {
    month = "08";
  } else if(month_string[0] == "September") {
    month = "09";
  } else if(month_string[0] == "October") {
    month = "10";
  } else if(month_string[0] == "November") {
    month = "11";
  } else if(month_string[0] == "December") {
    month = "12";
  }

  var monthArray = [];
  monthArray.push(month + " " + month_string[1]);

  return EquipmentCalendars.find({month: {$in: monthArray}, equipmentId: {$in: equipmentIdArray}});
});

Meteor.publish('logsByBooking', function(bookingId) {
  return BookingLogs.find({invoiceId: bookingId});
});

Meteor.publish('logsByOther', function(otherId) {
  return OtherLogs.find({invoiceId: otherId});
});

Meteor.publish('logsByOther', function(otherId) {
  return OtherLogs.find({invoiceId: otherId});
});

Meteor.publish('bookingStatusesStripped', function() {

  return BookingStatuses.find({}, {fields: {quickbooksInvoiceId: 1, invoiceId: 1}});

});

Meteor.publish('specificBookingLineItem', function(bookingLineItemId) {
  return BookingLineItems.find({_id: bookingLineItemId});
});

Meteor.publish('bookinglineitemsByBooking', function(bookingId) {
  return BookingLineItems.find({invoiceId: bookingId});
});

Meteor.publish('inventoryItemByBookingLineItem', function(bookingLineItemId) {

  return Inventory.find({_id: BookingLineItems.findOne({_id: bookingLineItemId}).itemId});
});

Meteor.publish('bookinglineitemsByBooking2', function(obj) {
  var bookingId = obj.bookingId;
  var groupId = obj.groupId;

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId, groupCounter: groupId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    arr.push(bookingLineItems[x].itemId);
  }

  return BookingLineItems.find({itemId: {$in: arr}});
});

Meteor.publish('equipmentcalendarsByBooking2', function(obj) {
  var bookingId = obj.bookingId;

  console.log("inside equipmentcalendarsByBooking2");
  console.log(EquipmentCalendars.find({invoiceId: bookingId}).fetch());

  return EquipmentCalendars.find({invoiceId: bookingId});
});

// Meteor.publish('bookinggroupsByBooking', function(bookingId) {
//   return BookingGroups.find({invoiceId: bookingId});
// });

Meteor.publish('bookinggroupsByBooking', function(bookingId) {

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  var equipmentCalendars = EquipmentCalendars.find({_id: {$in: arr}}).fetch();

  var bookingarr = [];
  bookingarr.push(bookingId);

  for(x in equipmentCalendars) {
    bookingarr.push(equipmentCalendars[x].invoiceId);
  }

  return BookingGroups.find({invoiceId:{$in: bookingarr}});
});

Meteor.publish('calendarsbybooking2', function(bookingId) {
  return Calendars.find({invoiceId: bookingId});
});

Meteor.publish('bookingstatusesbybooking', function(bookingId) {

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  var equipmentCalendars = EquipmentCalendars.find({_id: {$in: arr}}).fetch();

  var bookingarr = [];
  bookingarr.push(bookingId);

  for(x in equipmentCalendars) {
    bookingarr.push(equipmentCalendars[x].invoiceId);
  }

  return BookingStatuses.find({invoiceId:{$in: bookingarr}});
});

Meteor.publish('calendarsbybooking', function(bookingId) {
  // return Calendars.find({invoiceId: bookingId});
  var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});

    var totalDates = bookingStatus.totalDates;

    var monthArray = [];

    for(x in totalDates) {
      var string = totalDates[x].split(" ");
      if(monthArray.indexOf(string[1] + " " + string[2]) == -1) {
        monthArray.push(string[1] + " " + string[2]);
      }
    }

    return Calendars.find({months: {$in: monthArray}});
});

// Meteor.publish('bookingsigninsbybooking', function(bookingId) {
//   return BookingSignIns.find({invoiceId: bookingId});
// });

Meteor.publish('bookingsigninsbybooking', function(bookingId) {

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  var equipmentCalendars = EquipmentCalendars.find({_id: {$in: arr}}).fetch();

  var bookingarr = [];
  bookingarr.push(bookingId);

  for(x in equipmentCalendars) {
    bookingarr.push(equipmentCalendars[x].invoiceId);
  }

  return BookingSignIns.find({invoiceId:{$in: bookingarr}});
});

// Meteor.publish('bookingsignoutsbybooking', function(bookingId) {
//   return BookingSignOuts.find({invoiceId: bookingId});
// });

Meteor.publish('bookingsignoutsbybooking', function(bookingId) {

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  var equipmentCalendars = EquipmentCalendars.find({_id: {$in: arr}}).fetch();

  var bookingarr = [];
  bookingarr.push(bookingId);

  for(x in equipmentCalendars) {
    bookingarr.push(equipmentCalendars[x].invoiceId);
  }

  return BookingSignOuts.find({invoiceId:{$in: bookingarr}});
});

Meteor.publish('bookingprivilegesbybooking', function(bookingId) {
  return BookingPrivileges.find({invoiceId: bookingId});
});

// Meteor.publish('bookingpricesByBooking', function(bookingId) {
//   return BookingPrices.find({invoiceId: bookingId});
// });

Meteor.publish('bookingpricesByBooking', function(bookingId) {

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  var equipmentCalendars = EquipmentCalendars.find({_id: {$in: arr}}).fetch();

  var bookingarr = [];
  bookingarr.push(bookingId);

  for(x in equipmentCalendars) {
    bookingarr.push(equipmentCalendars[x].invoiceId);
  }

  return BookingPrices.find({invoiceId:{$in: bookingarr}});
});

Meteor.publish('bookingPricesByCustomer', function(customerId) {
  var bookingCustomers = BookingCustomers.find({customerId: customerId}, {fields: {invoiceId: 1}}).fetch();

  var idArray = [];

  for(x in bookingCustomers) {
    idArray.push(bookingCustomers[x].invoiceId);
  }

  return BookingPrices.find({invoiceId: {$in: idArray}});
});

// Meteor.publish('bookinggrouppricesByBooking', function(bookingId) {
//   return BookingGroupPrices.find({invoiceId: bookingId});
// });

Meteor.publish('bookinggrouppricesByBooking', function(bookingId) {

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  var equipmentCalendars = EquipmentCalendars.find({_id: {$in: arr}}).fetch();

  var bookingarr = [];
  bookingarr.push(bookingId);

  for(x in equipmentCalendars) {
    bookingarr.push(equipmentCalendars[x].invoiceId);
  }

  return BookingGroupPrices.find({invoiceId:{$in: bookingarr}});
});

Meteor.publish('bookinggeneralremarksByBooking', function(bookingId) {
  return BookingGeneralRemarks.find({invoiceId: bookingId});
});

// Meteor.publish('bookingacknowledgeremarksByBooking', function(bookingId) {
//   return BookingAcknowledgeRemarks.find({invoiceId: bookingId});
// });

Meteor.publish('bookingacknowledgeremarksByBooking', function(bookingId) {

  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  var equipmentCalendars = EquipmentCalendars.find({_id: {$in: arr}}).fetch();

  var bookingarr = [];
  bookingarr.push(bookingId);

  for(x in equipmentCalendars) {
    bookingarr.push(equipmentCalendars[x].invoiceId);
  }

  return BookingAcknowledgeRemarks.find({invoiceId:{$in: bookingarr}});
});


Meteor.publish('bookingprojectsByBooking', function(bookingId) {
  return BookingProjects.find({invoiceId: bookingId});
});

Meteor.publish('bookingCustomers', function() {
  return BookingCustomers.find();
});

Meteor.publish('bookingStatuses', function() {
  return BookingStatuses.find();
});

Meteor.publish('bookingcustomersByBooking', function(bookingId) {
  var bookingCustomer = BookingCustomers.findOne({invoiceId: bookingId});
  return Customers.find({_id: bookingCustomer.customerId});
});

Meteor.publish('bookingcustomersByBooking2', function(bookingId) {
  return BookingCustomers.find({invoiceId: bookingId});
});

Meteor.publish('overdueBookings', function() {

  return BookingStatuses.find({type: "Booking", status: {$ne: "Void"},overdue: true});
});

Meteor.publish('overdueCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},overdue: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('othersbycustomeridarray', function(customerIdArray) {
  return Others.find({customerId: {$in: customerIdArray}});
});

Meteor.publish('bookingcustomersbycustomeridarray', function(customerIdArray) {
  return BookingCustomers.find({customerId: {$in: customerIdArray}});
});

Meteor.publish('overdueBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},overdue: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('uncollectedBookings', function() {

  return BookingStatuses.find({type: "Booking", status: {$ne: "Void"},uncollected: true});
});

Meteor.publish('uncollectedCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},uncollected: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('uncollectedBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},uncollected: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('unresolvedBookings', function() {

  return BookingStatuses.find({type: "Booking", resolved: false, status: {$ne: "Void"}});
});

Meteor.publish('unresolvedCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", resolved: false, status: {$ne: "Void"}}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('unresolvedBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", resolved: false, status: {$ne: "Void"}}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('packBookings', function() {

  return BookingStatuses.find({type: "Booking", status: {$ne: "Void"},packed: false});
});

Meteor.publish('packCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},packed: false}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('packBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},packed: false}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('readyBookings', function() {

  return BookingStatuses.find({type: "Booking", status: {$ne: "Void"},packed: true});
});

Meteor.publish('readyCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},packed: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('readyBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},packed: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('unacknowledgedBookings', function() {

  return BookingStatuses.find({type: "Booking", status: {$ne: "Void"},acknowledged: false});
});

Meteor.publish('unacknowledgedCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},acknowledged: false}, {fields: {invoiceId: 1}}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('unacknowledgedBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},acknowledged: false}, {fields: {invoiceId: 1}}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('returnBookings', function() {

  return BookingStatuses.find({type: "Booking", status: {$ne: "Void"},return: true});
});

Meteor.publish('returnCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},return: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('returnBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},return: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('unpaidBookings', function() {

  return BookingStatuses.find({type: "Booking", status: {$ne: "Void"},unpaid: true});
});

Meteor.publish('unpaidCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},unpaid: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({type: "Booking", status: {$ne: "Void"},unpaid: true}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('unpaidBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({type: "Booking", status: {$ne: "Void"},overdue: true}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

// Meteor.publish('bookings', function() {
//   return Bookings.find({}, {fields:{logs: 0, quickbooksInvoiceId: 0, quickbooksInvoiceQueryId: 0, customerNumber: 0, customerEmail: 0, customerAddress: 0, customerIC: 0, privileges: 0, noOfItems: 0, gst: 0, balanceDue: 0, total: 0, customerPackagesUsed: 0, payment: 0, linkedInvoices: 0, remarks: 0}});
// });

Meteor.publish('customerNameCompany', function() {
  return Customers.find({}, {fields:{name: 1, company: 1}});
});

Meteor.publish('inventoryItem', function(id) {
  return Inventory.find({_id: id});
});

Meteor.publish('bookings', function() {
  return Bookings.find();
});

Meteor.publish('bookingByDates', function(id) {
  var booking = Bookings.findOne({_id: id});
  var datesArray = [];
  for(x in booking.equipmentDetails) {
    for(y in booking.equipmentDetails[x].dates) {
      var before = moment(booking.equipmentDetails[x].dates[y]).subtract(2, 'days').format("DD MM YYYY");
      if(datesArray.indexOf(before) == -1) {
        datesArray.push(before);
      }
      if(datesArray.indexOf(moment(booking.equipmentDetails[x].dates[y]).subtract(1, 'days').format("DD MM YYYY")) == -1) {
        datesArray.push(moment(booking.equipmentDetails[x].dates[y]).subtract(1, 'days').format("DD MM YYYY"));
      }
      var after = moment(booking.equipmentDetails[x].dates[y]).format("DD MM YYYY");
      if(datesArray.indexOf(after) == -1) {
        datesArray.push(after);
      }
    }
  }
  var bookingIds = [];

  var bookings = Bookings.find({totalDates: {$in: datesArray}}, {fields:{ quickbooksInvoiceId: 0, quickbooksInvoiceQueryId: 0, customerNumber: 0, customerEmail: 0, customerAddress: 0, customerIC: 0, privileges: 0, noOfItems: 0, gst: 0, balanceDue: 0, total: 0, customerPackagesUsed: 0, payment: 0, linkedInvoices: 0, remarks: 0}}).fetch();
  for(x in bookings) {
    bookingIds.push(bookings[x]._id);
  }




  return Bookings.find({totalDates: {$in: datesArray}}, {fields:{quickbooksInvoiceId: 0, quickbooksInvoiceQueryId: 0, customerNumber: 0, customerEmail: 0, customerAddress: 0, customerIC: 0, privileges: 0, noOfItems: 0, gst: 0, balanceDue: 0, total: 0, customerPackagesUsed: 0, payment: 0, linkedInvoices: 0, remarks: 0}});
});

Meteor.publish('invoiceNeedingUpdateByBooking', function(id) {

  return InvoiceNeedingUpdate.find({bookingId: id});
});

Meteor.publish('bookingcustomersbycustomer', function(id) {

  var idArray = [];
  idArray.push(id);

  return BookingCustomers.find({customerId: {$in: idArray}});
});


Meteor.publish('bookingstatusbycustomer', function(invoiceArray) {

  return BookingStatuses.find({invoiceId: {$in: invoiceArray}});
});

Meteor.publish('invoiceNeedingUpdateByOther', function(id) {

  return InvoiceNeedingUpdate.find({otherId: id});
});

Meteor.publish('bookingsByCustomer', function(invoiceArray) {
  return Bookings.find({_id: {$in: invoiceArray}});
});

Meteor.publish('clashedBookings', function() {

  return BookingStatuses.find({clash: true});
});

Meteor.publish('clashedCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({clash: true}, {fields: {invoiceId: 1}}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields: {name: 1, company: 1}});

});

Meteor.publish('clashedBookingCustomersByBookings', function() {

  var bookingStatuses = BookingStatuses.find({clash: true}, {fields: {invoiceId: 1}}).fetch();

  var invoiceIdArray = [];

  for(x in bookingStatuses) {
    invoiceIdArray.push(bookingStatuses[x].invoiceId);
  }

  

  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}}, {fields: {customerId: 1, invoiceId: 1}});

});

Meteor.publish('bookingsPast3Months', function() {
  var dateArray = [];
  for(x = 1; x < 90; x++) {
    dateArray.push(moment().subtract(x, 'days').format("DD MM YYYY"));
  }
  return Bookings.find({type:"Booking", status:{$ne: "Void"}, totalDates: {$in: dateArray}});
});


Meteor.publish('quickbooksInvoices', function() {
  return QuickbooksInvoices.find();
});

Meteor.publish('meteorUsers', function() {
  return Meteor.users.find({}, {fields:{username: 1}});
});


Meteor.publish('bookingsByDates', function(id) {
  var booking = Bookings.findOne({_id: id});

  var totalDates = booking.totalDates;



  return Bookings.find({totalDates: {$in: totalDates}});
});

Meteor.publish('othersByCustomer', function(id) {

  return Others.find({customerId: id});
});

Meteor.publish('availableEquipments', function(id) {

  return AvailableEquipments.find({});
});

Meteor.publish('availableEquipmentsByBooking', function(bookingId) {
    var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});
    var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

    var itemIdArray = [];
    for(x in bookingLineItems) {
      itemIdArray.push(bookingLineItems[x].itemId);
    }

    if(itemIdArray.length == 0) {
      itemIdArray.push('1');
    }

    

    return AvailableEquipments.find({itemId: {$in: itemIdArray}, date: {$in: bookingStatus.totalDates}});
});

Meteor.publish('availableequipmentsbybooking', function(bookingId) {
    var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});

    var totalDates = bookingStatus.totalDates;

    var monthArray = [];

    for(x in totalDates) {
      var string = totalDates[x].split(" ");
      if(monthArray.indexOf(string[1] + " " + string[2]) == -1) {
        monthArray.push(string[1] + " " + string[2]);
      }
    }

    var dateArray = [];

    for(x in monthArray) {
      for(y = 1; y < 10; y++) {
        dateArray.push("0" + y + " " + monthArray[x]);
      }
      for(y = 10; y < 32; y++) {
        dateArray.push(y + " " + monthArray[x]);
      }
    }

    var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

    var itemIdArray = [];
    for(x in bookingLineItems) {
      itemIdArray.push(bookingLineItems[x].itemId);
    }

    if(itemIdArray.length == 0) {
      itemIdArray.push('1');
    }

    return AvailableEquipments.find({itemId: {$in: itemIdArray}, date: {$in: dateArray}});
});

// Meteor.publish('privilegeByBooking', function(id) {
//   if(BookingPrivileges.findOne({invoiceId: id}) != undefined) {
//     var privileges = BookingPrivileges.findOne({invoiceId: id}).privileges;
//     var privilegesId = [];
//     for(x in privileges) {
//       privilegesId.push(privileges[x].id);
//     }
//     return Privileges.find({_id: {$in: privilegesId}});
//   } else {
//     return null;
//   }
// });

Meteor.publish('privilegeByCustomer', function(id) {
  var arr = [];
  arr.push(id);
  return Privileges.find({customerId: {$in: arr}});
});

Meteor.publish('privilegeByCustomerBooking', function(id) {
  var booking = Bookings.findOne({_id: id});
  var arr = [];
  arr.push(booking.customerId);
  return Privileges.find({customerId: {$in: arr}});
});

Meteor.publish('privilege', function(id) {
  return Privileges.find({_id: id});
});

Meteor.publish("users", function () {
       return Meteor.users.find({});
});

Meteor.publish('logsPaginate', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });
  return Logs.find({}, options);
});

Meteor.publish('othersPaginate', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });
  return Others.find({}, options);
});

Meteor.publish('bookingCustomersByAllBookings', function(bookingIdArray) {
  return BookingCustomers.find({invoiceId: {$in: bookingIdArray}});
});

Meteor.publish('bookingStatusesByAllBookings', function(bookingIdArray) {
  return BookingStatuses.find({invoiceId: {$in: bookingIdArray}});
});

Meteor.publish('bookingStatusesByAllCustomers', function(customerIdArray) {

  var bookingCustomers = BookingCustomers.find({customerId: {$in: customerIdArray}}).fetch();
  var invoiceIdArray = [];
  for(x in bookingCustomers) {
    invoiceIdArray.push(bookingCustomers[x].invoiceId);
  } 

  return BookingStatuses.find({invoiceId: {$in: invoiceIdArray}});
});

Meteor.publish('bookingsByAllCustomers', function(customerIdArray) {

  var bookingCustomers = BookingCustomers.find({customerId: {$in: customerIdArray}}).fetch();
  var invoiceIdArray = [];
  for(x in bookingCustomers) {
    invoiceIdArray.push(bookingCustomers[x].invoiceId);
  } 

  return Bookings.find({_id: {$in: invoiceIdArray}});
});


Meteor.publish('customersByAllBookings', function(bookingIdArray) {
  var bookingCustomers = BookingCustomers.find({invoiceId: {$in: bookingIdArray}}).fetch();

  var customerIdArray = [];

  for(x in bookingCustomers) {
    customerIdArray.push(bookingCustomers[x].customerId);
  }

  return Customers.find({_id: {$in: customerIdArray}}, {fields:{name: 1, company: 1}});
});

Meteor.publish("equipemntCalendarsByStartAndEnd", function(bookingLineItems, startDate, endDate) {


  return EquipmentCalendars.find({startDate: {$gte: startDate, $lt: endDate}, endDate: {$gte: startDate, $lt: endDate}});

});

Meteor.publish('quotationsPaginate', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });

  var bookingStatuses = BookingStatuses.find({type: "Quotation"}, {fields: {invoiceId: 1}}).fetch();

  var arr = [];

  for(x in bookingStatuses) {
    arr.push(bookingStatuses[x].invoiceId);
  }

  return Bookings.find({_id: {$in: arr}}, options);
});

Meteor.publish('bookingsPaginate', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });

  var bookingStatuses = BookingStatuses.find({type: "Booking"}, {fields: {invoiceId: 1}}).fetch();

  var arr = [];

  for(x in bookingStatuses) {
    arr.push(bookingStatuses[x].invoiceId);
  }

  return Bookings.find({_id: {$in: arr}}, options);
});

Meteor.publish('bookingLogsPaginate', function(options) {
  check(options, {
    sort: Object,
    limit: Number
  });

  return BookingLogs.find({}, options);
});


Meteor.publish('logs', function(owner) {
  var user = Meteor.users.findOne({_id: owner});
  if(user.profile.type == "Admin") {
    return Logs.find({});
  } else {
    return Logs.find({owner: owner});
  }
});

Meteor.publish('customerPackages', function(_id) {
  return CustomerPackages.find();
});

Meteor.publish('customerPackageByCustomer', function(_id) {

  return CustomerPackages.find({customerId: _id});
});

Meteor.publish('bookingoverbookedbybooking', function(bookingId) {
  return BookingOverbooked.find({invoiceId: bookingId});
});

Meteor.publish('customerPackageByBooking', function(_id) {

  var booking = Bookings.findOne({_id: _id});

  return CustomerPackages.find({customerId: booking.customerId});
});

Meteor.publish('privileges', function(_id) {
  return Privileges.find();
});

Meteor.publish('notifications', function(_id) {
  return Notifications.find();
});

Meteor.publish('privilegesByCustomer', function(_id) {

  var idArray = [];
  idArray.push(_id);

  return Privileges.find({customerId: {$in: idArray}});
});

Meteor.publish('privilegesSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Privileges.search(query);
});

Meteor.publish('customerPackage', function(_id) {
  return CustomerPackages.find({_id: _id});
});


Meteor.publish('customersSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Customers.search(query);
});

Meteor.publish('customerNumberSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Customers.numberSearch(query);
});

Meteor.publish('customerCompanySearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Customers.companySearch(query);
});

Meteor.publish('customerAddressSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Customers.addressSearch(query);
});

Meteor.publish('customerEmailSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Customers.emailSearch(query);
});




Meteor.publish('calendars', function(details) {
  return Calendars.find();
});

Meteor.publish('repairs', function() {
  return Repairs.find();
});

Meteor.publish('overbookedCalendars', function(dates, equipments) {

  return EquipmentCalendars.find({equipmentId: {$in: equipments}, dates: {$in: dates}});
});

Meteor.publish('clashCalendars', function(clashCalendarArray) {

  var equipmentCalendar = EquipmentCalendars.findOne({_id: clashCalendarArray[1]});

  var overallMonths = equipmentCalendar.months;
  var equipmentId = equipmentCalendar.equipmentId;

  var firstMonth = equipmentCalendar.months[0];
  var lastMonth = equipmentCalendar.months[1];

  var firstMonthArray = firstMonth.split(" ");
  var lastMonthArray = lastMonth.split(" ");

  if(firstMonthArray[0] == "01") {

    var year = parseInt(lastMonthArray[1]) - 1;

    overallMonths.push("12 " + year);
  } 

  if(lastMonthArray[0] == "12") {

    var year = parseInt(lastMonthArray[1]) + 1;

    overallMonths.push("01 " + year);
  } 

  console.log(EquipmentCalendars.find({_id: {$in: clashCalendarArray}}).count());
  console.log(EquipmentCalendars.find({months: {$in: overallMonths}, equipmentId: equipmentId}).count());

  return EquipmentCalendars.find({months: {$in: overallMonths}, equipmentId: equipmentId});
});

Meteor.publish('equipmentCalendars', function() {
  return EquipmentCalendars.find();
});

Meteor.publish('mainCalendarsStartDayAndEndDay', function(startDay, endDay) {


  if(startDay == null || endDay == null) {
    var dateArray = [];
    dateArray.push(moment().format('DD MM YYYY'));
  } else {
    var dateArray = [];
    while(moment(parseInt(startDay)).format("DD MM YYYY") != moment(parseInt(endDay)).format("DD MM YYYY")) {

      dateArray.push(moment(parseInt(startDay)).format('DD MM YYYY'));
      startDay = moment(parseInt(startDay)).add(1, 'days').format('x');

    }
  }

  return Calendars.find({dates: {$in: dateArray}});

});

Meteor.publish('mainCalendarsStartAndEnd', function(startMonth, endMonth, bookings, quotations, extras, customers) {

  var durationArray = [];
  var startString = startMonth.split(" ");
  var endString = endMonth.split(" ");

  if(startString[0] > endString[0]) {
    //means go to next year
    var nextMonth = parseInt(startString) + 1;
    nextMonth = String(nextMonth);
    if(nextMonth.length == 1) {
      nextMonth = "0"+nextMonth;
    }
    durationArray.push(nextMonth + " " + startString[1]);

    var nextMonth = parseInt(endString) - 1;
    nextMonth = String(nextMonth);
    if(nextMonth.length == 1) {
      nextMonth = "0"+nextMonth;
    }
    durationArray.push(nextMonth + " " + endString[1]);
  } else {
    var previousMonth = parseInt(endString) - 1;
    previousMonth = String(previousMonth);
    if(previousMonth.length == 1) {
      previousMonth = "0"+previousMonth;
    }
    durationArray.push(previousMonth + " " + endString[1]);
  }

  durationArray.push(startMonth);
  durationArray.push(endMonth);

  if(bookings == true && quotations == true) {
      if(customers != null) {
        if(extras == true) {
          return Calendars.find({months: {$in: durationArray}, customerId: {$in: customers}});
        } else {
          var typeArray = [];
          typeArray.push("bookingStartDate");
          typeArray.push("bookingEndDate");
          return Calendars.find({months: {$in: durationArray}, type: {$nin: typeArray}, customerId: {$in: customers}});
        }
      } else {
        if(extras == true) {
          return Calendars.find({months: {$in: durationArray}});
        } else {
          var typeArray = [];
          typeArray.push("bookingStartDate");
          typeArray.push("bookingEndDate");
          return Calendars.find({months: {$in: durationArray}, type: {$nin: typeArray}});
        }
      }
  } else if(bookings == true) {
    if(customers != null) {
      if(extras == true) {
        var typeArray = [];
        typeArray.push("booking");
        typeArray.push("bookingStartDate");
        typeArray.push("bookingEndDate");
        return Calendars.find({months: {$in: durationArray}, type: {$in: typeArray}, customerId: {$in: customers}});
      } else {
        var typeArray = [];
        typeArray.push("quotation");
        typeArray.push("bookingStartDate");
        typeArray.push("bookingEndDate");
        return Calendars.find({months: {$in: durationArray}, type: {$nin: typeArray}, customerId: {$in: customers}});
      }
    } else {
      if(extras == true) {
        var typeArray = [];
        typeArray.push("booking");
        typeArray.push("bookingStartDate");
        typeArray.push("bookingEndDate");
        return Calendars.find({months: {$in: durationArray}, type: {$in: typeArray}});
      } else {
        var typeArray = [];
        typeArray.push("quotation");
        typeArray.push("bookingStartDate");
        typeArray.push("bookingEndDate");
        return Calendars.find({months: {$in: durationArray}, type: {$nin: typeArray}});
      }
    }
  } else if(quotations == true) {
    var typeArray = [];
    typeArray.push("quotation");
    typeArray.push("quotationStartDate");
    typeArray.push("quotationEndDate");
    if(customers != null) {
      return Calendars.find({months: {$in: durationArray}, type: {$in: typeArray}, customerId: {$in: customers}});
    } else {
      return Calendars.find({months: {$in: durationArray}, type: {$in: typeArray}});
    }
  } else {
    return false;
  }
});

Meteor.publish('calendarsStartAndEnd', function(startMonth, endMonth, customers, bookings, quotations) {
  if(customers != null) {

    var startMonthArray = startMonth.split(" ");
    var startMonth = startMonthArray[0];
    var startYear = startMonthArray[1];

    var endMonthArray = endMonth.split(" ");
    var endMonth = endMonthArray[0];
    var endYear = endMonthArray[1];

    var startMonth = parseInt(startMonth);
    var endMonth = parseInt(endMonth);
    var startYear = parseInt(startYear);
    var endYear = parseInt(endYear);

    var durationArray = [];

    for (i = startYear; i <= endYear; i++) {
      for(y = startMonth; y <= endMonth; y++) {
        durationArray.push(y +  " " + i);
      }
    };
    if(bookings == true && quotations == true) {
      return Calendars.find({months: {$in: durationArray}, customerId: {$in: customers}});
    } else if(bookings == true) {
      return Calendars.find({months: {$in: durationArray}, customerId: {$in: customers}, type: 'booking'});
    } else if(quotations == true) {
      return Calendars.find({months: {$in: durationArray}, customerId: {$in: customers}, type: 'quotation'});
    } else {
      return false;
    }
  } else {

    var startMonthArray = startMonth.split(" ");
    var startMonth = startMonthArray[0];
    var startYear = startMonthArray[1];

    var endMonthArray = endMonth.split(" ");
    var endMonth = endMonthArray[0];
    var endYear = endMonthArray[1];

    var startMonth = parseInt(startMonth);
    var endMonth = parseInt(endMonth);
    var startYear = parseInt(startYear);
    var endYear = parseInt(endYear);

    var durationArray = [];

    for (i = startYear; i <= endYear; i++) {
      for(y = startMonth; y <= endMonth; y++) {
        durationArray.push(y +  " " + i);
      }
    };



    if(bookings == true && quotations == true) {

      return Calendars.find({months: {$in: durationArray}});
    } else if(bookings == true) {
      var typeArray = [];
      typeArray.push("bookings");
      typeArray.push("bookingStartDate");
      typeArray.push("bookingEndDate");

      return Calendars.find({months: {$in: durationArray}, type: {$in: typeArray}});
    } else if(quotations == true) {
      var typeArray = [];
      typeArray.push("quotations");
      typeArray.push("quotationStartDate");
      typeArray.push("quotationEndDate");
      return Calendars.find({months: {$in: durationArray}, type: {$in: typeArray}});
    } else {
      return false;
    }
  }

});

// Meteor.publish('equipmentCalendarsStartAndEnd', function(startMonth, endMonth, equipments) {

//   if(equipments != null) {

//     var startMonthArray = startMonth.split(" ");
//     var startMonth = startMonthArray[0];
//     var startYear = startMonthArray[1];

//     var endMonthArray = endMonth.split(" ");
//     var endMonth = endMonthArray[0];
//     var endYear = endMonthArray[1];

//     var startMonth = parseInt(startMonth);
//     var endMonth = parseInt(endMonth);
//     var startYear = parseInt(startYear);
//     var endYear = parseInt(endYear);

//     var durationArray = [];

//     for (i = startYear; i <= endYear; i++) {
//       for(y = startMonth; y <= endMonth; y++) {
//         durationArray.push(y +  " " + i);
//       }
//     };

//     return EquipmentCalendars.find({months: {$in: durationArray}, equipmentId: {$in: equipments}});
//   } else {

//     var startMonthArray = startMonth.split(" ");
//     var startMonth = startMonthArray[0];
//     var startYear = startMonthArray[1];

//     var endMonthArray = endMonth.split(" ");
//     var endMonth = endMonthArray[0];
//     var endYear = endMonthArray[1];

//     var startMonth = parseInt(startMonth);
//     var endMonth = parseInt(endMonth);
//     var startYear = parseInt(startYear);
//     var endYear = parseInt(endYear);

//     var durationArray = [];

//     for (i = startYear; i <= endYear; i++) {
//       for(y = startMonth; y <= endMonth; y++) {
//         durationArray.push(y +  " " + i);
//       }
//     };

//     return EquipmentCalendars.find({months: {$in: durationArray}});

//   }

// });

Meteor.publish('equipmentCalendarsStartAndEnd', function(startMonth, endMonth, equipments, dates) {

  var durationArray = [];
  var startString = startMonth.split(" ");
  var endString = endMonth.split(" ");

  var nextMonth = parseInt(startString) + 1;
  var nextMonthString = String(nextMonth);
  if(nextMonthString.length == 1) {
    nextMonth = "0"+nextMonth;
  }


  durationArray.push(nextMonth + " " + startString[1]);

  var previousMonth = parseInt(endString) - 1;
  var previousMonthString = String(previousMonth);
  if(previousMonthString.length == 1) {
    previousMonth = "0"+previousMonth;
  }

  durationArray.push(previousMonth + " " + endString[1]);

  durationArray.push(startMonth);
  durationArray.push(endMonth);

  if(equipments != null) {
    if(dates != null) {
      return EquipmentCalendars.find({months: {$in: durationArray}, equipmentId: {$in: equipments}, dates: {$in: dates}});
    } else {
      return EquipmentCalendars.find({months: {$in: durationArray}, equipmentId: {$in: equipments}});
    }
  }
});

Meteor.publish('customerByBooking', function(id) {
  var bookingCustomer = BookingCustomers.findOne({invoiceId: id});

  return Customers.find({_id: bookingCustomer.customerId});
});

Meteor.publish('duplicateInventory', function() {
  return DuplicateInventory.find();
});

Meteor.publish('customerByOther', function(id) {

  

  return Customers.find({_id: Others.findOne({_id: id}).customerId});
});

Meteor.publish('customer', function(_id) {
  return Customers.find({_id: _id});
});

Meteor.publish('categories', function() {
  return Categories.find({}, {fields: {name: 1}});
});

Meteor.publish('brands', function() {
  return Brands.find({}, {fields: {name: 1, category: 1}});
});

Meteor.publish('inventories', function() {
  return Inventory.find();
});

Meteor.publish('inventoriesByBooking', function(bookingId) {
  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  var itemId = [];

  for(x in bookingLineItems) {
    itemId.push(bookingLineItems[x].itemId);
  }

  return Inventory.find({_id: {$in: itemId}});

});

Meteor.publish('inventorySearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Inventory.search(query);
});

Meteor.publish('customerSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Customers.search(query);
});

Meteor.publish('qbSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return BookingStatuses.search(query);
});

Meteor.publish('qbOthersSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Others.search(query);
});

Meteor.publish('qbCustomerSearch', function(invoiceIdArray) {
  return BookingCustomers.find({invoiceId: {$in: invoiceIdArray}});
});

Meteor.publish('qbBookingSearch', function(invoiceIdArray) {
  return Bookings.find({_id: {$in: invoiceIdArray}});
});

Meteor.publish('repairSearch', function(query) {
  check(query, String);

  if (_.isEmpty(query)) {
    return this.ready();
  }

  return Repairs.search(query);
});

Meteor.publishComposite('inventory', function(_id) {
  return {
    find: function() {
      return Inventory.find({_id: _id});
    },
    children: [
    ]
  };
});

Meteor.publishComposite('inventoryByCategory', function(category) {
  return {
    find: function() {

      return Inventory.find({category: category});
    },
    children: [
    ]
  };
});

Meteor.publishComposite('brandsByCategory', function(category) {
  return {
    find: function() {
      return Brands.find({category: category});
    },
    children: [
    ]
  };
});

Meteor.publish('equipmentcalendarsbybooking', function(bookingId) {
  // var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

  // var equipmentCalendars = EquipmentCalendars.find({invoiceId: bookingId}, {fields:{_id: 1}}).fetch();

  // var equipmentCalendarArray = [];

  // for(x in equipmentCalendars) {
  //   equipmentCalendarArray.push(equipmentCalendars[x]._id);
  // }

  // for(x in bookingLineItems) {
  //   if(bookingLineItems[x].clashableSerialNumbers.length > 0) {
  //     for(y in bookingLineItems[x].clashableSerialNumbers) {
  //       equipmentCalendarArray = equipmentCalendarArray.concat(bookingLineItems[x].clashableSerialNumbers[y].originalCalendars);
  //       equipmentCalendarArray = equipmentCalendarArray.concat(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars);
  //     }
  //   }
  // }

  // return EquipmentCalendars.find({_id: {$in: equipmentCalendarArray}});

  var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});

    var totalDates = bookingStatus.totalDates;

    var monthArray = [];

    for(x in totalDates) {
      var string = totalDates[x].split(" ");
      if(monthArray.indexOf(string[1] + " " + string[2]) == -1) {
        monthArray.push(string[1] + " " + string[2]);
      }
    }

    var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

    var itemIdArray = [];
    for(x in bookingLineItems) {
      itemIdArray.push(bookingLineItems[x].itemId);
    }

    if(itemIdArray.length == 0) {
      itemIdArray.push('1');
    }

    return EquipmentCalendars.find({equipmentId: {$in: itemIdArray}, months: {$in: monthArray}});
});

Meteor.publish("equipmentcalendarsbybooking3", function(bookingId) {
  var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();
  var arr = [];

  for(x in bookingLineItems) {
    if(bookingLineItems[x].clash == true) {
      for(y in bookingLineItems[x].clashableSerialNumbers) {
        for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
          arr.push(bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]);
        }
      }
    }
  }

  return EquipmentCalendars.find({_id: {$in: arr}});
});

Meteor.publish('clashbookinglineitembybooking', function(bookingId) {
    var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}).fetch();

    var clashIds = [];

    for(x in bookingLineItems) {
      if(bookingLineItems[x].clashableSerialNumbers.length > 0) {
        for(y in bookingLineItems[x].clashableSerialNumbers) {
          for(z in bookingLineItems[x].clashableSerialNumbers[y].clashCalendars) {
            clashIds.push(EquipmentCalendars.findOne({_id: bookingLineItems[x].clashableSerialNumbers[y].clashCalendars[z]}).bookingLineItemId);
          }
        }
      }
    }

    


    return BookingLineItems.find({_id: {$in: clashIds}});
});

Meteor.publish('booking', function(_id) {
  var booking = Bookings.findOne({_id: _id});

  var bookingIds = [];
  bookingIds.push(_id);

  if(booking.clash == true) {
    for(a in booking.equipmentDetails) {
      for(b in booking.equipmentDetails[a].items) {
        for(c in booking.equipmentDetails[a].items[b].clashableSerialNumbers) {
          for(d in booking.equipmentDetails[a].items[b].clashableSerialNumbers[c].clashCalendars) {
            var calendar = EquipmentCalendars.findOne({_id: booking.equipmentDetails[a].items[b].clashableSerialNumbers[c].clashCalendars[d]});
            bookingIds.push(Bookings.findOne({_id: calendar.invoiceId})._id);
          }

        }
      }
    }
  }

  return Bookings.find({_id: {$in: bookingIds}});
});

Meteor.publishComposite('other', function(_id) {
  return {
    find: function() {
      return Others.find({_id: _id});
    },
    children: [
    ]
  };
});

Meteor.publishComposite('quotation', function(_id) {
  return {
    find: function() {
      return Quotations.find({_id: _id});
    },
    children: [
    ]
  };
});

})();
