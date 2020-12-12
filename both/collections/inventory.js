Inventory = new Mongo.Collection('inventory');

RegExp.escape = function(s) {
  return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

Inventory.search = function(query) {
  if (!query) {
    return;
  }
  return Inventory.find({
    queryName: { $regex: RegExp.escape(query), $options: 'i' },
  }, {
    limit: 20
  });
};

Meteor.methods({
  deleteInventoryItem: function(itemId) {
    var inventoryItem = Inventory.findOne({_id: itemId});
    var inventoryItemQty = inventoryItem['quantity'];
    inventoryItemQty = inventoryItemQty * -1;

    var logAttributes = {
        type: "inventoryItem",
        url: itemId,
        content: "Removed " + inventoryItem['brand'] + " " + inventoryItem['item'] + ".",
        createdAt: new Date(),
        owner: Meteor.user()._id
    }; 
    Logs.insert(logAttributes);

    //delete item in inventory table
    Inventory.remove(itemId);
    
    //delete quantity in brands table
    Brands.update({name: inventoryItem['brand'], category: inventoryItem['category']}, {$inc: {noOfItems: inventoryItemQty}});

    //check whether quantity in brands table hit zero, if it is, delete brand row
    var brand = Brands.findOne({name: inventoryItem['brand'], category: inventoryItem['category']});
    if(brand['noOfItems'] == 0 || brand['noOfItems'] < 0) {
      Brands.remove({name: inventoryItem['brand'], category: inventoryItem['category']});
    } 

    //delete quantity in categories table
    Categories.update({name: inventoryItem['category']}, {$inc: {noOfItems: inventoryItemQty}});

    //check whether quantity in categories table hit zero, if it is, delete categories row
    var category = Categories.findOne({name: inventoryItem['category']});
    if(category['noOfItems'] == 0 || category['noOfItems'] < 0) {
      Categories.remove({name: inventoryItem['category']});
    } 

  },
  deleteInventoryCategory: function(category) {
    Categories.remove({name: category});
    Brands.remove({category: category});
  },
  addInventoryItem: function(itemAttributes) {

    var serialNoArray = itemAttributes['serialNo'].split(",");
    var serialNoArray2 = [];
    for (i = 0; i < serialNoArray.length; i++) { 
      var serialNo = new Object();
      serialNo.serialNo = serialNoArray[i];
      serialNo.status = "Available";
      serialNo.remarkCount = 0;
      serialNo.remarks = [];
      serialNo.id = i;
      serialNoArray2.push(serialNo);
    }

    itemAttributes['serialNo'] = serialNoArray2;

    var brand = Brands.findOne({name: itemAttributes['brand'], category: itemAttributes['category']});

    itemAttributes['quantity'] = parseInt(itemAttributes['quantity']);
    itemAttributes['rate'] = parseInt(itemAttributes['rate']);
    itemAttributes['price'] = parseInt(itemAttributes['price']);

    if(typeof brand == 'undefined') {
      var brandAttributes = {
          name: itemAttributes['brand'],
          category: itemAttributes['category'],
          noOfItems: itemAttributes['quantity']
      }; 
      Brands.insert(brandAttributes);
    } else {
      Brands.update({name: itemAttributes['brand'], category: itemAttributes['category']}, {$inc: {noOfItems: itemAttributes['quantity']}});
    }

    var category = Categories.findOne({name: itemAttributes['category']});
    if(typeof category == 'undefined') {
      var categoryAttributes = {
          name: itemAttributes['category'],
          noOfItems: itemAttributes['quantity']
      }; 
      Categories.insert(categoryAttributes);
    } else {
      Categories.update({name: itemAttributes['category']}, {$inc: {noOfItems: itemAttributes['quantity']}});
    }

    var item = _.extend(itemAttributes, {
      createdAt: new Date(),
      updatedAt: new Date(),
      queryName: itemAttributes['brand'] + " " + itemAttributes['item'],
      createdBy: Meteor.user().username,
      updatedBy: Meteor.user().username,
      remarkCount: 0,
      remarks: [],
      logs: [ 
        {
            "content" : Meteor.user().username + " created item.",
            "owner" : Meteor.user().username,
            "dateTime" : new Date()
        }, 
      ]
    });


    var itemId = Inventory.insert(item);

    Router.go('inventoryItem.show', {_id: itemId});
  },
  addInventoryItemRemark: function(remarkAttributes) {
    var inventoryItem = Inventory.findOne({_id: remarkAttributes['routeId']});
    var logArray = inventoryItem['logs'];

    var remarkId = parseInt(inventoryItem['remarkCount']);
    remarkId = remarkId + 1;

    var log = new Object();
    log.content = Meteor.user().username + " added remark " + remarkId + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    if(logArray == undefined) {
      logArray = [];
    }

    logArray.push(log);

    var remarkArray = inventoryItem['remarks'];
    var remarkCount = inventoryItem['remarkCount'];
    remarkCount = remarkCount + 1;

    var remark = new Object();
    remark.id = remarkCount - 1;
    remark.remark = remarkAttributes['remark'];
    remark.routeId = remarkAttributes['routeId'];
    remark.createdAt = new Date();
    remark.updatedAt = new Date();
    remark.createdBy = Meteor.user().username;
    remark.updatedBy = Meteor.user().username;
    remark.status = "Open";

    if(remarkArray == undefined) {
      remarkArray = [];
    }

    remarkArray.push(remark);

    inventoryItem.remarks = remarkArray;
    inventoryItem.remarkCount = remarkCount;
    inventoryItem.logs = logArray;
    inventoryItem.updatedAt = new Date();
    inventoryItem.updatedBy = Meteor.user().username;

    var inventoryItemId = String(remarkAttributes['routeId']);

    delete inventoryItem._id;

    Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
  },
  addItemRemark: function(remarkAttributes) {
    var inventoryItem = Inventory.findOne({_id: remarkAttributes['routeId']});
    var logArray = inventoryItem['logs'];

    var remarkId = parseInt(inventoryItem['serialNo'][remarkAttributes['itemIdClicked']]['remarkCount']);
    remarkId = remarkId + 1;

    var log = new Object();
    log.content = Meteor.user().username + " added remark " + remarkId + " for item serial no: " + remarkAttributes['serialNoClicked'] + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    if(logArray == undefined) {
      logArray = [];
    }

    logArray.push(log);

    var remarkArray = inventoryItem['serialNo'][remarkAttributes['itemIdClicked']]['remarks'];
    var remarkCount = inventoryItem['serialNo'][remarkAttributes['itemIdClicked']]['remarkCount']
    remarkCount = remarkCount + 1;

    var remark = new Object();
    remark.id = remarkCount - 1;
    remark.remark = remarkAttributes['remark'];
    remark.routeId = remarkAttributes['routeId'];
    remark.serialNo = remarkAttributes['serialNoClicked'];
    remark.createdAt = new Date();
    remark.updatedAt = new Date();
    remark.createdBy = Meteor.user().username;
    remark.updatedBy = Meteor.user().username;
    remark.status = "Open";

    if(remarkArray == undefined) {
      remarkArray = [];
    }

    remarkArray.push(remark);

    inventoryItem['serialNo'][remarkAttributes['itemIdClicked']].remarks = remarkArray;
    inventoryItem['serialNo'][remarkAttributes['itemIdClicked']].remarkCount = remarkCount;
    inventoryItem.logs = logArray;
    inventoryItem.updatedAt = new Date();
    inventoryItem.updatedBy = Meteor.user().username;

    var inventoryItemId = String(remarkAttributes['routeId']);

    delete inventoryItem._id;

    Inventory.update({_id: inventoryItemId}, {$set: inventoryItem});
  },
  updateInventoryItem: function(itemAttributes) {

    console.log("inside updateInventoryItem");
    console.log(itemAttributes);

    if(itemAttributes['updateType'] == 'itemStatus') {

      if(itemAttributes['inventoryItem']['serialNo'][[itemAttributes['target']]]['status'] != itemAttributes['status']) {
        if(itemAttributes['status'] == "Available") {

          Repairs.remove({itemId: itemAttributes['_id'], serialNo: itemAttributes['serialNo'][itemAttributes['target']].serialNo});
          
          Meteor.call("checkFutureAffectedBookings", itemAttributes);

        } else {
          //update inventory bookable quantity

          if(itemAttributes['inventoryItem']['serialNo'][[itemAttributes['target']]]['status'] == "Available") {
            itemAttributes['bookableQuantity'] = itemAttributes['bookableQuantity'] - 1;
          }

          // check future equipment calendars so as to check whether or not affected serial number affects future bookings
          // bookings must have periods that are current day and after current day

          Meteor.call("checkFutureAffectedBookings", itemAttributes);

          // must check whether there is already the item in the repair table
          if(Repairs.findOne({itemId: itemAttributes['_id'], serialNo: itemAttributes.serialNo[itemAttributes.target].serialNo}) == undefined) {
            Repairs.insert({
              item: itemAttributes['inventoryItem'].item,
              brand: itemAttributes['inventoryItem'].brand,
              status: itemAttributes['status'],
              queryName: itemAttributes['inventoryItem'].brand + " " + itemAttributes['inventoryItem'].item,
              serialNo: itemAttributes['inventoryItem']['serialNo'][[itemAttributes['target']]]['serialNo'],
              itemId: itemAttributes['_id'],
              createdAt: new Date(),
              createdBy: Meteor.user().username
            }); 
          } else {
            Repairs.update({itemId: itemAttributes['_id'], serialNo: itemAttributes.serialNo[itemAttributes.target].serialNo}, {$set: {status: itemAttributes['status']}});
          }
        }
      }
    } else if(itemAttributes['updateType'] == 'edit') {
      console.log("inside updateInventoryItem edit");
      console.log("itemAttributes");
      console.log(itemAttributes);
      // must get difference of quantity so that i can minus off brand and category tables
      
      var oldInventoryItem = Inventory.findOne({_id: itemAttributes['_id']});
      var originalInventoryItem = itemAttributes['inventoryItem'];
      var differenceInQuantity = parseInt(itemAttributes['quantity'] - originalInventoryItem['quantity']);
      var currentDateTime = new Date();

      Brands.update({name: originalInventoryItem['brand'], category: originalInventoryItem['category']}, {$inc: {noOfItems: differenceInQuantity}});
      Categories.update({name: originalInventoryItem['category']}, {$inc: {noOfItems: differenceInQuantity}});

      AvailableEquipments.update({itemId: itemAttributes['_id']}, {$inc: {remainingQuantity: differenceInQuantity}}, {multi: true});

      var category = Categories.find({name: originalInventoryItem['category']}).fetch()[0];
      delete category._id;
      if(category.noOfItems - itemAttributes['quantity'] == 0) {
        Categories.remove({name: originalInventoryItem['category']});
      } else {
        var negativeQuantity = itemAttributes['quantity'] * -1;
        Categories.update({name: originalInventoryItem['category']}, {$inc: {noOfItems: negativeQuantity}});
      }

      if(Categories.find({name: itemAttributes['category']}).fetch().length == 0) {
        var categoryAttributes = {
            name: itemAttributes['category'],
            noOfItems: parseInt(itemAttributes['quantity'])
        }; 
        Categories.insert(categoryAttributes);
      } else {
        Categories.update({name: itemAttributes['category']}, {$inc: {noOfItems: parseInt(itemAttributes['quantity'])}});
      }

      var brand = Brands.find({name: originalInventoryItem['brand'], category: originalInventoryItem['category']}).fetch()[0];
      
      delete brand._id;
      if(brand.noOfItems - itemAttributes['quantity'] == 0) {
        Brands.remove({name: originalInventoryItem['brand'], category: originalInventoryItem['category']});
      } else {
        var negativeQuantity = itemAttributes['quantity'] * -1;
        Brands.update({name: originalInventoryItem['brand'], category: originalInventoryItem['category']}, {$inc: {noOfItems: negativeQuantity}});
      }

      if(Brands.find({name: itemAttributes['brand'], category: itemAttributes['category']}).fetch().length == 0) {
        var brandAttributes = {
            name: itemAttributes['brand'],
            category: itemAttributes['category'],
            noOfItems: parseInt(itemAttributes['quantity'])
        }; 
        Brands.insert(brandAttributes);
      } else {
        Brands.update({name: itemAttributes['brand'], category: itemAttributes['category']}, {$inc: {noOfItems: parseInt(itemAttributes['quantity'])}});
      }

      for(i = 0; i < itemAttributes['serialNoAffected'].length; i++) {
        if(itemAttributes['serialNoAffected'][i]['action'] == "removed") {
          console.log("removed");
          Inventory.update({_id: itemAttributes['_id']}, {$pull: {serialNo: {serialNo: itemAttributes['serialNoAffected'][i]['serialNo']}}});

        } else {
          console.log("added");
          Inventory.update({_id: itemAttributes['_id']}, {$push: {serialNo: {id: 0, serialNo: itemAttributes['serialNoAffected'][i]['serialNo'], status: "Available", remarkCount: 0, remarks: []}}});
        }
      }

      var inventoryItem = Inventory.findOne({_id: itemAttributes['_id']});
      var bookableQuantity = 0;

      for(i = 0; i < itemAttributes['quantity']; i++) {
        inventoryItem.serialNo[i].id = parseInt(i);
        if(inventoryItem.serialNo[i].status == "Available") {
          bookableQuantity++;
        }
      }

      inventoryItem.item = itemAttributes['item'];
      inventoryItem.brand = itemAttributes['brand'];
      inventoryItem.price = parseFloat(itemAttributes['price']).toFixed(2);
      inventoryItem.rate = parseFloat(itemAttributes['rate']).toFixed(2);
      inventoryItem.quantity = parseInt(itemAttributes['quantity']);
      inventoryItem.supplier = itemAttributes['supplier'];
      inventoryItem.category = itemAttributes['category'];
      inventoryItem.queryName = itemAttributes['brand'] + " " + itemAttributes['item'];
      inventoryItem.updatedAt = new Date();
      inventoryItem.updatedBy = Meteor.user().username;
      inventoryItem.bookableQuantity = bookableQuantity;

      delete inventoryItem._id;

      Inventory.update({_id: itemAttributes['_id']}, {$set: inventoryItem});
    } else if(itemAttributes['updateType'] == "remarks") {
      var logArray = itemAttributes['inventoryItem']['logs'];

      var remarkId = parseInt(itemAttributes['remarkId']);
      remarkId = remarkId + 1;

      var log = new Object();
      log.content = Meteor.user().username + " marked remark " + remarkId + " from " + itemAttributes['inventoryItem']['remarks'][itemAttributes['remarkId']]['status'] + " to " + itemAttributes['remarks'][itemAttributes['remarkId']]['status'] + ".";
      log.owner = Meteor.user().username;
      log.dateTime = new Date();

      logArray.push(log);

      var item = _.extend(itemAttributes, {
        updatedAt: new Date(),
        updatedBy: Meteor.user().username,
        logs: logArray
      });

      var inventoryItemId = String(itemAttributes['_id']);

      delete item._id; 
      delete item.inventoryItem; 
      delete item.updateType;
      delete item.remarkId;
      Inventory.update({_id: inventoryItemId}, {$set: item});
    }
  },
  removeSerialNoRemarkFromInventory: function(details) {
    var inventoryItem = Inventory.findOne({_id: details['_id']}); 
    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].serialNo == details['serialNo']) {
        
        var remarkId = parseInt(details['remarkId']);
        remarkId += 1;

        var log = new Object();
        log.content = Meteor.user().username + " removed remark " + remarkId + ": " + inventoryItem.serialNo[x].remarks[details['remarkId']].remark + " from item serial no: " + details['serialNo'] + "." 
        log.owner = Meteor.user().username;
        log.dateTime = new Date();

        inventoryItem.logs.push(log);

        inventoryItem.serialNo[x].remarks.splice(details['remarkId'], 1);
        inventoryItem.serialNo[x].remarkCount -= 1;
        
        for(y in inventoryItem.serialNo[x].remarks) {
          inventoryItem.serialNo[x].remarks[y].id = parseInt(y);
        }

        break;
      }
    }

    delete inventoryItem._id;
    Inventory.update({_id: details['_id']}, {$set: inventoryItem});
  },
  updateInventoryItemRemark: function(itemAttributes) {

    var inventoryItem = Inventory.findOne({_id: itemAttributes['_id']});
    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].serialNo == itemAttributes['serialNo']) {
        inventoryItem.serialNo[x].remarks[itemAttributes['remarkId']].status = itemAttributes['status'];

        var remarkId = parseInt(itemAttributes['remarkId']);
        remarkId = remarkId + 1;

        var log = new Object();
        if(itemAttributes['status'] == "Close") {
          log.content = Meteor.user().username + " marked remark " + remarkId + " of item serial no: " + itemAttributes['serialNo'] + " from Open to Close.";
        } else {
          log.content = Meteor.user().username + " marked remark " + remarkId + " of item serial no: " + itemAttributes['serialNo'] + " from Close to Open.";
        }
        log.owner = Meteor.user().username;
        log.dateTime = new Date();

        inventoryItem.logs.push(log);

        delete inventoryItem._id;
        Inventory.update({_id: itemAttributes['_id']}, {$set: inventoryItem});
        break;
      }
    }
  }
});