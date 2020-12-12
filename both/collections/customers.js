Customers = new Mongo.Collection('customers');

Customers.before.insert(function (userId, doc) {
  doc.createdAt = new Date();
});

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Customers.search = function(query) {

  
  if (!query) {
   return Customers.find({name: {$in: query}}, {sort: {name: 1}});
  }

  
  return Customers.find({
    name: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 20
  });
};

Customers.numberSearch = function(query) {
  return Customers.find({
    contact: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 20
  });
};

Customers.companySearch = function(query) {
  return Customers.find({
    company: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 20
  });
};

Customers.addressSearch = function(query) {
  return Customers.find({
    address: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 20
  });
};

Customers.emailSearch = function(query) {
  return Customers.find({
    email: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 20
  });
};

Customers.quickbooksSearch = function(query) {



  if(Customers.find({quickbooksId: parseInt(query)}).fetch() != 0) {

    return Customers.find({quickbooksId: parseInt(query)});
  }

  if(Customers.find({quickbooksId: query}).fetch() != 0) {

    return Customers.find({quickbooksId: query});
  }
};

Customers.helpers({
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

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Meteor.methods({
  uploadImage: function(attributes) {
      var customer = Customers.findOne({_id: attributes['_id']});

      var image = new Object();
      image.data = attributes['data'];
      image.type = attributes['type'];

      customer.images.push(image);
      
      var icStatus = false;
      for(x in customer.images) {
        if(customer.images[x].type == "IC") {
          customer.icStatus = true;
          break;
        }
      }

      delete customer._id;

      Customers.update({_id: attributes['_id']}, {$set: customer});

      return true;
  },
  deleteImage: function(attributes) {
    Customers.update({_id: attributes['_id']}, {$pull: {images: { data: attributes['data'] }}});
    return true;
  },
  addCustomer: function(customerAttributes) {

    var customer = _.extend(customerAttributes, {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: Meteor.user().username,
      updatedBy: Meteor.user().username,
      quickbooksId: 0,
      logs: [ 
        {
            "content" : Meteor.user().username + " created customer.",
            "owner" : Meteor.user().username,
            "dateTime" : new Date()
        }, 
      ],
      images: [],
      icStatus: false
    });

    var customerId = Customers.insert(customer);

    customerAttributes['customerId'] = customerId;

    // Meteor.call('addQuickbooksCustomer', customerAttributes, function(error, result) {
    //   Router.go('customers.show', {_id: customerId});
    // });
  },

  pendingCustomer: function(customerId) {
    CustomerUpdates.update({customerId: customerId}, {$set: {status: "Pending"}});
  },
  pendingCreateCustomer: function() {
    CustomerUpdates.update({customerId: "0"}, {$set: {status: "Pending"}});
  },
  okCustomer: function(customerId) {
    CustomerUpdates.update({customerId: customerId}, {$set: {status: "OK"}});
  },
  updateCustomer: function(customerAttributes) {
    console.log("INside updatedcustomer");
    
    var outdatedCustomer = Customers.findOne({_id: customerAttributes['_id']});

    var logArray = outdatedCustomer.logs;
    var currentDateTime = new Date();
    var quickbooksId = outdatedCustomer.quickbooksId;

    if(customerAttributes['name'] != customerAttributes['customer']['name']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated customer name from " + customerAttributes['customer']['name'] + " to " + customerAttributes['name'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }
    if(customerAttributes['company'] != customerAttributes['customer']['company']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated customer company from " + customerAttributes['customer']['company'] + " to " + customerAttributes['company'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }
    if(customerAttributes['contact'] != customerAttributes['customer']['contact']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated customer contact from " + customerAttributes['customer']['contact'] + " to " + customerAttributes['contact'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }
    if(customerAttributes['email'] != customerAttributes['customer']['email']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated customer email from " + customerAttributes['customer']['email'] + " to " + customerAttributes['email'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = currentDateTime;
      logArray.push(log);
    }

    var customer = _.extend(customerAttributes, {
      updatedAt: new Date(),
      updatedBy: Meteor.user().username,
      logs: logArray
    });

    var customerId = String(customerAttributes['_id']);

    customerAttributes['quickbooksId'] = quickbooksId;

    delete customer._id;
    delete customer.customer;

    Customers.update({_id: customerId}, {$set: customer});

    var invoiceNeedingUpdate = InvoiceNeedingUpdate.findOne({customerIdd: customerAttributes['_id']});

    if(invoiceNeedingUpdate == null) {
      var invoiceNeedingUpdateObject = new Object();
      invoiceNeedingUpdateObject.bookingId = "0";
      invoiceNeedingUpdateObject.invoiceNumber = "0";
      invoiceNeedingUpdateObject.customerName = customer.name;
      invoiceNeedingUpdateObject.customerIdd = customerAttributes['_id'];

      InvoiceNeedingUpdate.insert(invoiceNeedingUpdateObject);
    }

    return customerAttributes;
  },
  deleteCustomer: function(customerId) {
    Customers.remove(customerId);
  }
});