BookingCustomers = new Mongo.Collection('bookingcustomers');

Meteor.methods({
	updateBookingCustomerName: function(details) {

		var customerArray = [];
		customerArray.push(details['customerId']);

		var customer = Customers.findOne({_id: details['customerId']});

		var privilege = Privileges.findOne({customerId: {$in: customerArray}});

		if(privilege != undefined) {
			var privilegeObject = new Object();
			privilegeObject.status = true;
			privilegeObject.value = privilege.discountValue;
			privilegeObject.name = privilege.name;
			privilegeObject.invoiceId = details['_id'];

			BookingPrivileges.insert(privilegeObject);

			var bookingGroupPrices = BookingGroupPrices.find({invoiceId: details['_id']}).fetch();
			for(x in bookingGroupPrices) {
				bookingGroupPrices[x].privilege.value = parseFloat(privilege.discountValue * bookingGroupPrices[x].afterTotal / 100);
				bookingGroupPrices[x].privilege.percentage = privilege.discountValue;
				bookingGroupPrices[x].privilege.originalPercentage = privilege.discountValue;
				bookingGroupPrices[x].privilege.edited = false;

				var bookingGroupPriceId = bookingGroupPrices[x]._id;
				delete bookingGroupPrices[x]._id;

				BookingGroupPrices.update({_id: bookingGroupPriceId}, {$set: bookingGroupPrices[x]});
			}
		} else {
			BookingPrivileges.remove({invoiceId: details['_id']});

			var bookingGroupPrices = BookingGroupPrices.find({invoiceId: details['_id']}).fetch();
			for(x in bookingGroupPrices) {
				bookingGroupPrices[x].privilege.value = 0;
				bookingGroupPrices[x].privilege.percentage = 0;
				bookingGroupPrices[x].privilege.originalPercentage = 0;
				bookingGroupPrices[x].privilege.edited = false;

				var bookingGroupPriceId = bookingGroupPrices[x]._id;
				delete bookingGroupPrices[x]._id;

				BookingGroupPrices.update({_id: bookingGroupPriceId}, {$set: bookingGroupPrices[x]});
			}
		}

		BookingCustomers.update({invoiceId: details['_id']}, {$set:{customerId: details['customerId']}});

		var equipmentCalendars = EquipmentCalendars.find({invoiceId: details['_id']}).fetch();

		for(x in equipmentCalendars) {
			var title = equipmentCalendars[x].title.split(":");
			equipmentCalendars[x].title = customer.name + ":" + title[1];

			equipmentCalendars[x].customerName = customer.name;
			equipmentCalendars[x].customerId = details['customerId'];

			var equipmentCalendarsId = equipmentCalendars[x]._id;
			delete equipmentCalendars[x]._id;

			EquipmentCalendars.update({_id: equipmentCalendarsId}, {$set: equipmentCalendars[x]});
		}

		var calendars = Calendars.find({invoiceId: details['_id']}).fetch();

		for(x in calendars) {
			var title = calendars[x].title.split(" ");
			calendars[x].title = title[0] + " " + customer.name + " " + title[title.length - 2] + " " + title[title.length - 1];

			calendars[x].customerName = customer.name;
			calendars[x].customerId = details['customerId'];

			var calendarId = calendars[x]._id;
			delete calendars[x]._id;

			Calendars.update({_id: calendarId}, {$set: calendars[x]});
		}
	}
})