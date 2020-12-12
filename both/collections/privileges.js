Privileges = new Mongo.Collection('privileges');

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Privileges.search = function(query) {
  if (!query) {
    return;
  }

  return Privileges.find({
    name: { $regex: RegExp.escape(query), $options: 'i' },
  }, {
    limit: 20
  });
};

Meteor.methods({
  removePrivilege: function(attributes) {

    var bookingPrivilege = BookingPrivileges.findOne({invoiceId: attributes['_id']});
    var bookingGroupPrices = BookingGroupPrices.find({invoiceId: attributes['_id']}).fetch();

    bookingPrivilege.status = false;

    delete bookingPrivilege._id;
    BookingPrivileges.update({invoiceId: attributes['_id']}, {$set: bookingPrivilege});

    for(x in bookingGroupPrices) {

      bookingGroupPrices[x].privilege.value = 0;
      bookingGroupPrices[x].privilege.percentage = 0;
      bookingGroupPrices[x].privilege.originalPercentage = 0;

      var bookingGroupPriceId = bookingGroupPrices[x]._id;

      delete bookingGroupPrices[x]._id;
      BookingGroupPrices.update({_id: bookingGroupPriceId}, {$set: bookingGroupPrices[x]});
    }
  },
  addPrivilege2: function(attributes) {

    var bookingPrivilege = BookingPrivileges.findOne({invoiceId: attributes['_id']});
    var bookingGroupPrices = BookingGroupPrices.find({invoiceId: attributes['_id']}).fetch();

    var bookingCustomer = BookingCustomers.findOne({invoiceId: attributes['_id']});

    var customerArray = [];
    customerArray.push(bookingCustomer.customerId);

    var privilege = Privileges.findOne({customerId: {$in: customerArray}});

    bookingPrivilege.status = true;

    delete bookingPrivilege._id;
    BookingPrivileges.update({invoiceId: attributes['_id']}, {$set: bookingPrivilege});

    for(x in bookingGroupPrices) {

      bookingGroupPrices[x].privilege.value = (bookingGroupPrices[x].subTotal - bookingGroupPrices[x].subDiscount) * (privilege.discoutnValue / 100); 
      bookingGroupPrices[x].privilege.percentage = privilege.discountValue;
      bookingGroupPrices[x].privilege.originalPercentage = privilege.discountValue;

      var bookingGroupPriceId = bookingGroupPrices[x]._id;

      delete bookingGroupPrices[x]._id;
      BookingGroupPrices.update({_id: bookingGroupPriceId}, {$set: bookingGroupPrices[x]});
    }



    // var total = 0;
    // for(x in booking.equipmentDetails) {
    //   var cumulatedSubAmount = 0;
    //   var cumulatedSubDiscount = 0;
    //   booking.equipmentDetails[x].privilege.percentage = booking.privileges[0].value;
    //   booking.equipmentDetails[x].privilege.edited = false;

    //   for(y in booking.equipmentDetails[x].items) {
    //     if(booking.equipmentDetails[x].items[y].total == -1) {
    //       cumulatedSubAmount += booking.equipmentDetails[x].items[y].rate * booking.equipmentDetails[x].items[y].days;
    //       // cumulatedSubAmount += (booking.equipmentDetails[x].items[y].subAmount+booking.equipmentDetails[x].items[y].discountOverwrite);
    //       if(booking.equipmentDetails[x].items[y].discountOverwrite != undefined) {
    //         cumulatedSubDiscount += booking.equipmentDetails[x].items[y].discountOverwrite;
    //       }
    //     } else if(booking.equipmentDetails[x].items[y].packageClicked == undefined) {
    //       cumulatedSubAmount += (((booking.equipmentDetails[x].items[y].rate + booking.equipmentDetails[x].items[y].discount) * booking.equipmentDetails[x].items[y].originalPriced) + ((booking.equipmentDetails[x].items[y].discount) * booking.equipmentDetails[x].items[y].discountPriced));
    //       if(booking.equipmentDetails[x].items[y].discountOverwrite != undefined) {
    //         cumulatedSubDiscount += booking.equipmentDetails[x].items[y].discountOverwrite;
    //       }
    //     } else {
    //       cumulatedSubAmount += (booking.equipmentDetails[x].items[y].discountPriced * booking.equipmentDetails[x].items[y].rate) + (booking.equipmentDetails[x].items[y].originalPriced * (booking.equipmentDetails[x].items[y].rate + booking.equipmentDetails[x].items[y].discount));
    //       cumulatedSubDiscount += (booking.equipmentDetails[x].items[y].discountPriced * booking.equipmentDetails[x].items[y].rate)
    //     }
    //   }

    //   booking.equipmentDetails[x].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
    //   booking.equipmentDetails[x].privilege.value = parseFloat(booking.equipmentDetails[x].subTotal * booking.equipmentDetails[x].privilege.percentage / 100);
    //   booking.equipmentDetails[x].subTotal -= booking.equipmentDetails[x].privilege.value;
    //   booking.equipmentDetails[x].subDiscount = cumulatedSubDiscount;
    //   total += booking.equipmentDetails[x].subTotal;
    // }



    // booking.gst = total * 0.07;
    // booking.total = total + booking.gst;

    // totalPaid = 0;
    // if(booking.payment.length != 0) {
    //   for(x in booking.payment) {
    //     totalPaid += parseFloat(booking.payment[x].amount);
    //   }

    //   booking.balanceDue = parseFloat(booking.total - totalPaid);
    // } else {
    //   booking.balanceDue = parseFloat(booking.total);
    // }
  },
  checkWhetherCustomerExistInPrivileges: function(customerId) {
    var arr = [];
    arr.push(customerId);

    return (Privileges.findOne({customerId: {$in: arr}}) != undefined);
  },
  deletePrivilege: function(id) {
    var privilege = Privileges.findOne({_id: id});

    var logAttributes = {
        type: "privileges",
        url: "",
        content: "Removed " + privilege['name'] + ".",
        createdAt: new Date(),
        owner: Meteor.user()._id
    };
    Logs.insert(logAttributes);

    //delete item in inventory table
    Privileges.remove(id);
  },
  addPrivilege: function(privilegeAttributes) {

  	privilegeAttributes.discountValue = parseInt(privilegeAttributes.discountValue);

    var privilege = _.extend(privilegeAttributes, {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: Meteor.user().username,
      updatedBy: Meteor.user().username,
      logs: [
        {
            "content" : Meteor.user().username + " created privilege.",
            "owner" : Meteor.user().username,
            "dateTime" : new Date()
        },
      ],
      allCustomersChecked: false,
      allEquipmentsChecked: false
    });

    var privilegeId = Privileges.insert(privilege);

    if(privilegeAttributes.customerId.length == 0) {
      var logAttributes = {
          type: "privileges",
          url: privilegeId,
          content: "Created privilege " + privilegeAttributes.name + ".",
          createdAt: new Date(),
          owner: Meteor.user()._id
      };
      Logs.insert(logAttributes);
    } else {
      var logAttributes = {
          type: "privileges",
          url: privilegeId,
          content: "Created privilege " + privilegeAttributes.name + " for " + Customers.findOne({_id: privilegeAttributes.customerId[0]}).name + ".",
          createdAt: new Date(),
          owner: Meteor.user()._id
      };
      Logs.insert(logAttributes);
    }


    Router.go('privileges.show', {_id: privilegeId});
  },
  removeAllCustomersFromPrivilege: function(privilegeId) {
    var privilege = Privileges.findOne({_id: privilegeId});

    var logObject = new Object();
    logObject.content = Meteor.user().username + " removed all customers.";
    logObject.dateTime = new Date();
    logObject.owner = Meteor.user().username;

    privilege.logs.push(logObject);

    privilege.customerId = [];

    delete privilege._id;

    Privileges.update({_id: privilegeId}, {$set: privilege});
  },
  removeAllEquipmentsFromPrivilege: function(privilegeId) {
    var privilege = Privileges.findOne({_id: privilegeId});

    var logObject = new Object();
    logObject.content = Meteor.user().username + " removed all equipments.";
    logObject.dateTime = new Date();
    logObject.owner = Meteor.user().username;

    privilege.logs.push(logObject);

    privilege.equipments = [];

    delete privilege._id;

    Privileges.update({_id: privilegeId}, {$set: privilege});
  },
  updatePrivilege: function(privilegeAttributes) {
    var logArray = Privileges.findOne({_id: privilegeAttributes['_id']}).logs;
    var currentDateTime = new Date();

    if(privilegeAttributes['name'] != privilegeAttributes['privilege']['name']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated privilege name from " + privilegeAttributes['privilege']['name'] + " to " + privilegeAttributes['name'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }
    if(privilegeAttributes['discountType'] != privilegeAttributes['privilege']['discountType']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated privilege discount type from " + privilegeAttributes['privilege']['discountType'] + " to " + privilegeAttributes['discountType'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }
    if(privilegeAttributes['discountValue'] != privilegeAttributes['privilege']['discountValue']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated privilege discount value from " + privilegeAttributes['privilege']['discountValue'] + " to " + privilegeAttributes['discountValue'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }
    if(privilegeAttributes['details'] != privilegeAttributes['privilege']['details']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated privilege details from " + privilegeAttributes['privilege']['details'] + " to " + privilegeAttributes['details'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }

    var privilege = _.extend(privilegeAttributes, {
      updatedAt: new Date(),
      updatedBy: Meteor.user().username,
      logs: logArray
    });

    var privilegeId = String(privilegeAttributes['_id']);

    delete privilege._id;
    delete privilege.privilege;

    Privileges.update({_id: privilegeId}, {$set: privilege});
  },
  removeCustomerFromPrivilege: function(privilegeAttributes) {
    Privileges.update({_id: privilegeAttributes['_id']}, {$pull: {customerId: privilegeAttributes['customerId']}});
  },
  removeEquipmentFromPrivilege: function(privilegeAttributes) {
    Privileges.update({_id: privilegeAttributes['_id']}, {$pull: {equipments: privilegeAttributes['equipmentId']}});
  },
  addCustomerToPrivilege: function(privilegeAttributes) {
    var privilege = privilegeAttributes['privilege'];
    privilege.customerId = privilegeAttributes['customerId'];

    delete privilege._id;
    Privileges.update({_id: privilegeAttributes['_id']}, {$set: privilege});
  },
  addAllCustomersToPrivilege: function(privilegeId) {

    //Privileges.update({_id: privilegeId }, {$set: {}});
  },
  addEquipmentToPrivilege: function(privilegeAttributes) {
    var privilege = Privileges.findOne({_id: privilegeAttributes['_id']});
    if(privilegeAttributes['type'] == 'all') {
      privilege.equipments = [];
    }
    privilege.equipments = privilegeAttributes['equipments'];
    delete privilege._id;
    Privileges.update({_id: privilegeAttributes['_id']}, {$set: privilege});
  },
  addAllCategory: function(privilegeAttributes) {
    var privilege = Privileges.findOne({_id: privilegeAttributes['_id']});
    var inventories = Inventory.find({category: privilegeAttributes['category']}).fetch();
    for (x in inventories) {
      //i needa check whether the equipments under this particular category is already included in the privileges
      if(privilege.equipments.indexOf(inventories[x]._id) == -1) {
        privilege.equipments.push(inventories[x]._id);
      }
    }

    delete privilege._id;
    Privileges.update({_id: privilegeAttributes['_id']}, {$set: privilege});
  }
});
