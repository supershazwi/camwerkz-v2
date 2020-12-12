CustomerPackages = new Mongo.Collection('customerpackages');

Meteor.methods({
  addCustomerPackage: function(customerPackageAttributes) {

    var customerId = String(customerPackageAttributes['customer']['_id']);

    //logs

    Customers.update({_id: customerId}, {$push: {logs: {content: Meteor.user().username + " added customer package " + customerPackageAttributes['name'] + ".", owner: Meteor.user().username, dateTime: new Date()}}});


    var customerPackage = _.extend(customerPackageAttributes, {
      customerId: customerPackageAttributes['customer']['_id'],
      createdAt: new Date(),
      updatedAt: new Date(),
      bookings: [],
      createdBy: Meteor.user().username,
      updatedBy: Meteor.user().username,
      logs: [ 
        {
            "content" : Meteor.user().username + " created package.",
            "owner" : Meteor.user().username,
            "dateTime" : new Date()
        }, 
      ]
    });

    delete customerPackage.customer;

    var customerPackageId = CustomerPackages.insert(customerPackage);

    Router.go('customerPackages.show', {_id: customerPackageId});
  },
  addCustomerPackageItem: function(customerPackageItemAttributes) {

    

    var customerPackage = CustomerPackages.findOne({_id: customerPackageItemAttributes['_id']});

    var exists = false;

    if(customerPackage['items']) {
      for(i = 0; i < customerPackage['items'].length; i++) {
        if(customerPackage['items'][i]['id'] == customerPackageItemAttributes['itemId']) {
          exists = true;
          break;
        }
      }
    }

    if(exists == false) {

      var log = new Object();
      log.content = Meteor.user().username + " added " + customerPackageItemAttributes['item'] + " to customer package.";
      log.owner = Meteor.user().username;
      log.dateTime = new Date();

      var logs = customerPackage['logs'];
      logs.push(log);

      customerPackage['logs'] = logs;

      var item = new Object();
      item.id = customerPackageItemAttributes['itemId'];
      item.item = customerPackageItemAttributes['item'];
      item.brand = customerPackageItemAttributes['brand'];
      item.category = customerPackageItemAttributes['category'];
      item.rate = 0;
      item.quantity = 0;
      
      var items = customerPackage['items'];
      items.push(item);

      customerPackage['items'] = items;

      customerPackage['noOfItems'] = customerPackage['noOfItems'] + 1;

      delete customerPackage._id;

      CustomerPackages.update({_id: customerPackageItemAttributes['_id']}, {$set: customerPackage});
    }
  },
  editCustomerPackageItem: function(customerPackageItemAttributes) {

    customerPackageItemAttributes['rate'] = parseInt(customerPackageItemAttributes['rate']);
    customerPackageItemAttributes['quantity'] = parseInt(customerPackageItemAttributes['quantity']);

    var customerPackage = CustomerPackages.findOne({_id: customerPackageItemAttributes['_id']});
    
    var originalItem = new Object();

    //find original item before edit
    for(x in customerPackage['items']) {
      if(customerPackage['items'][x].id == customerPackageItemAttributes['id']) {
       originalItem = customerPackage['items'][x];
      }
    }

    //get the logs
    var logArray = customerPackage['logs'];

    var rateChanged = false;
    var quantityChanged = false;

    //check the different attributes
    if(customerPackageItemAttributes['rate'] != originalItem.rate) {
      var log = new Object();
      log.content = Meteor.user().username + " updated " + customerPackageItemAttributes['brand'] + " " + customerPackageItemAttributes['item'] + "'s rate from " + accounting.formatMoney(originalItem.rate) + " to " + accounting.formatMoney(customerPackageItemAttributes['rate']) + ".";
      log.owner = Meteor.user().username;
      log.dateTime = new Date();
      logArray.push(log);
      rateChanged = true;
    }
    if(customerPackageItemAttributes['quantity'] != originalItem.quantity) {
      var log = new Object();
      log.content = Meteor.user().username + " updated " + customerPackageItemAttributes['brand'] + " " + customerPackageItemAttributes['item'] + "'s quantity from " + originalItem.quantity + " to " + customerPackageItemAttributes['quantity'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = new Date();
      logArray.push(log);
      quantityChanged = true;
    }

    for(x in customerPackage['items']) {
      if(customerPackage['items'][x].id == customerPackageItemAttributes['id']) {
       if(rateChanged) {
        customerPackage['items'][x].rate = customerPackageItemAttributes['rate'];
       }
       if(quantityChanged) {
        customerPackage['items'][x].quantity = customerPackageItemAttributes['quantity'];
       }
      }
    }

    customerPackage['logs'] = logArray;

    delete customerPackage._id;
    
    CustomerPackages.update({_id: customerPackageItemAttributes['_id']}, {$set: customerPackage});
  },
  editCustomerPackage: function(customerPackageAttributes) {

    var dateTime = new Date();
    var logArray = customerPackageAttributes['customerPackage']['logs'];

    if(customerPackageAttributes['name'] != customerPackageAttributes['customerPackage']['name']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated customer package name from " + customerPackageAttributes['customerPackage']['name'] + " to " + customerPackageAttributes['name'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = dateTime;
      logArray.push(log);
    }
    if(customerPackageAttributes['details'] != customerPackageAttributes['customerPackage']['details']) {
      var log = new Object();
      log.content = Meteor.user().username + " updated customer package details from " + customerPackageAttributes['customerPackage']['details'] + " to " + customerPackageAttributes['details'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = dateTime;
      logArray.push(log);
    }

    var customerPackage = _.extend(customerPackageAttributes, {
      updatedAt: dateTime,
      updatedBy: Meteor.user().username,
      logs: logArray
    });

    var customerPackageId = String(customerPackageAttributes['customerPackage']['_id']);

    delete customerPackageAttributes.customerPackage;
    
    CustomerPackages.update({_id: customerPackageId}, {$set: customerPackage});
  },
  deletePackageItem: function(customerPackageItemAttributes) {

    var customerPackageId = String(customerPackageItemAttributes['currentPackageId']);

    var customerPackage = CustomerPackages.findOne({_id: customerPackageId});

    var log = new Object();
    log.content = Meteor.user().username + " deleted " + customerPackageItemAttributes['item'] + " from customer package.";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    var logs = customerPackage['logs'];
    logs.push(log);

    customerPackage['noOfItems'] = customerPackage['noOfItems'] - 1;

    delete customerPackage._id;

    CustomerPackages.update({_id: customerPackageId}, {$set: customerPackage});
    
    CustomerPackages.update( { _id: customerPackageId}, { $pull: { items: { id: customerPackageItemAttributes['id'] } } } );
  },
  deleteCustomerPackage: function(customerPackageId) {
    var customerPackageId = String(customerPackageId);

    var customerPackage = CustomerPackages.findOne({_id: customerPackageId});

    var customerId = String(customerPackage['customerId']);

    var customer = CustomerPackages.findOne({_id: customerId});

    //add log to customer
    Customers.update( { _id: customerId}, {$push: {logs: {content: Meteor.user().username + " deleted customer package " + customerPackage['name'] + ".", owner: Meteor.user().username, dateTime: new Date()}}});

    //delete customerPackage
    CustomerPackages.remove(customerPackageId);

    return customerId;
  },
  clickCategory: function(category) {

    var distinctBrands = _.uniq(Brands.find({category: category}, {
        sort: {name: 1}, fields: {name: true}
    }).fetch().map(function(x) {
        return x.name;
    }), true);

    if(distinctBrands.length != 0) {
      if(distinctBrands.length % 2 == 0) { //number of distinctBrands is even
        var distinctBrandsArray = []; 

        for (i = 0; i < distinctBrands.length; i++) { 
          if(i%2 == 0) {
            object = [];
            object.push(distinctBrands[i]);
          } else {
            object.push(distinctBrands[i]);
            distinctBrandsArray.push(object);
          }
        }
      } else { //number of distinctBrands is odd
        var distinctBrandsArray = []; 
        for (i = 0; i < distinctBrands.length; i++) { 
          if(i%2 == 0) {
            if(distinctBrands.length - 1 == i) {
              object = [];
              object.push(distinctBrands[i]);
              distinctBrandsArray.push(object);
            } else {
              object = [];
              object.push(distinctBrands[i]);
            }
          } else {
            object.push(distinctBrands[i]);
            distinctBrandsArray.push(object);
          }
        }
      }
    }

    return distinctBrandsArray;
  }
});