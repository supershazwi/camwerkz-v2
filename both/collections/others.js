Others = new Mongo.Collection('others');

Others.search = function(query) {

  
  if (!query) {
   return Others.find({quickbooksInvoiceId: {$in: query}}, {sort: {quickbooksInvoiceId: 1}});
  }

  
  return Others.find({
    quickbooksInvoiceId: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 20
  });
};

Meteor.methods({
  updateOtherLinePrice: function(details) {
    console.log("inside updateOtherLinePrice");
    console.log(details);

    var string = details['id'].split("_");
    var id;
    if(string.length == 3) {
      id = string[1] + "_" + string[2];
    } else {
      id = string[0] + "_" + string[1];
    }
    

    var other = Others.findOne({_id: details['_id']});
    for(x in other.equipmentDetails[0].items) {
      if(other.equipmentDetails[0].items[x].id == id) {
        other.equipmentDetails[0].items[x].subAmount = other.equipmentDetails[0].items[x].price * other.equipmentDetails[0].items[x].quantity;
        break;
      }
    }

    delete other._id;
    Others.update({_id: details['_id']}, {$set: other});
  },
  updateOverallOtherPrice: function(otherId) {
    var other = Others.findOne({_id: otherId});

    var subDiscount = 0;
    var finalTotal = 0;
    var subTotal = 0;

    for(x in other.equipmentDetails[0].items) {
      subDiscount += other.equipmentDetails[0].items[x].discount;
      finalTotal += other.equipmentDetails[0].items[x].subAmount;
    }

    other.equipmentDetails[0].subTotal = finalTotal - subDiscount;
    other.equipmentDetails[0].subDiscount = subDiscount;

    other.gst = parseFloat((finalTotal - subDiscount) * 0.07).toFixed(2);
    other.total = parseFloat((finalTotal - subDiscount) * 1.07).toFixed(2);
    other.balanceDue = other.total;

    for(x in other.payment) {
      other.balanceDue -= other.payment[x].amount;
    }

    delete other._id;
    Others.update({_id: otherId}, {$set: other});
  },
  signOtherCustomerSignOutRemarks: function(details) {
    var other = Others.findOne({_id: details['_id']});

    var itemArray = [];

    for(x in other.customerSignOut) {
      if(other.customerSignOut[x].status == "Unsigned") {
        other.customerSignOut[x].image = details['image'];
        other.customerSignOut[x].signedBy = details['signedBy'];
        other.customerSignOut[x].ic = details['ic'];
        other.customerSignOut[x].number = details['number'];
        other.customerSignOut[x].status = "Signed";
        other.customerSignOut[x].signedAt = new Date();

        for(y in other.customerSignOut[x].items) {
          itemArray.push(other.customerSignOut[x].items[y].item);
        }
      }
    }

    var acknowledged = true;

    if(acknowledged) {
      for(x in other.customerSignOut) {
        if(other.customerSignOut[x].status == "Unsigned") {
          acknowledged = false;
          break;
        }
      }
    }

    other.acknowledged = acknowledged;

    delete other._id;
    Others.update({_id: details['_id']}, {$set: other});

    return itemArray;
  },
  updateOtherProjectName: function(details) {
    var other = Others.findOne({_id: details['_id']});
    other.projectName = details['projectName'];

    delete other._id;
    Others.update({_id: details['_id']}, {$set: other});
  },
  addOtherCustomQuantity: function(details) {
    console.log("addOtherCustomItemQuantity");
    console.log(details);

    var other = Others.findOne({_id: details['_id']});
    var string = details['id'].split("_");

    var id = string[1] + "_" + string[2];

    for(x in other.equipmentDetails[0].items) {
      if(other.equipmentDetails[0].items[x].id == id) {
          other.equipmentDetails[0].items[x].quantity = parseInt(details['quantity']);
        break;
      }
    }
    
     delete other._id;
    Others.update({_id: details['_id']}, {$set: other});

    return "Done";
  },
  addOtherCustomItem: function(details) {

    console.log("inside addOtherCustomItem");
    console.log(details);

    var other = Others.findOne({_id: details['_id']});
    var string = details['id'].split("_");
    var id = string[1] + "_" + string[2];

    for(x in other.equipmentDetails[0].items) {
      if(other.equipmentDetails[0].items[x].id == id) {
        var originalItem = other.equipmentDetails[0].items[x].item;
        var originalCategory = other.equipmentDetails[0].items[x].category;

        other.equipmentDetails[0].items[x].item = details['item'];
        other.equipmentDetails[0].items[x].category = details['category'];

        break;
      }
    }

    var counter = 0;

    for(x in other.customerSignOut) {
      if(other.customerSignOut[x].status == "Signed") {
        counter++;
      }
    }

    other.customerSignOut[string[1]].items[string[2]].item = details['item'];

    if(originalItem != details['item']) {
      var log = new Object(); 
      log.owner = Meteor.user().username;
      log.dateTime = new Date();
      log.content = Meteor.user().username + " updated " + originalItem + " to " + details['item'] + ".";
      other.logs.push(log);
    } 

    if(originalCategory != details['category']) {
      var log = new Object(); 
      log.owner = Meteor.user().username;
      log.dateTime = new Date();
      log.content = Meteor.user().username + " updated " + originalCategory + " of " + originalItem + " to " + details['category'] + ".";
      other.logs.push(log);
    } 
    

    delete other._id;
    Others.update({_id: details['_id']}, {$set: other});

    return "Done";

  },
	changeOtherSerialNoStatus: function(details) {
    var other = Others.findOne({_id: details['_id']});
    var string = details['id'].split("_");
    var done = false;
    for(x in other.equipmentDetails[string[0]].items) {
      if(other.equipmentDetails[string[0]].items[x].id == details['id']) {
        var log = new Object();
        log.content = Meteor.user().username + " labelled " + other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " as " + details['status'] + ".";
        log.owner = Meteor.user().username;
        log.dateTime = new Date();

        other.logs.push(log);

        var logAttributes = {
            type: "others",
            url: details['_id'],
            content: "Labelled " + other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " of Invoice #" + details['_id'] + " as " + details['status'] + ".",
            createdAt: new Date(),
            owner: Meteor.user()._id
        }; 
        Logs.insert(logAttributes);

        for(y in other.equipmentDetails[string[0]].items[x].serialNumbers) {
          if(other.equipmentDetails[string[0]].items[x].serialNumbers[y].serialNo == details['serialNo']) {
            other.equipmentDetails[string[0]].items[x].serialNumbers[y].status = details['status'];
            if(details['status'] == "Missing" || details['status'] == "Damaged") {
              var remarkAcknowledge = new Object();
              remarkAcknowledge.id = other.remarksRequiringAcknowledgement.length;
              
              remarkAcknowledge.remark = Meteor.user().username + " labelled " + other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " as " + details['status'] + ".";
              remarkAcknowledge.createdAt = new Date();
              remarkAcknowledge.serialNo = details['serialNo'];
              remarkAcknowledge.status = details['status'];
              remarkAcknowledge.item = other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item;
              remarkAcknowledge.lineItem = other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " serial no: " + details['serialNo'];
              remarkAcknowledge.createdBy = Meteor.user().username;
              remarkAcknowledge.status = "Unsigned";
              remarkAcknowledge.resolved = false;
              remarkAcknowledge.signedAt = null;
              remarkAcknowledge.signedBy = null;
              remarkAcknowledge.image = null;
              other.remarksRequiringAcknowledgement.push(remarkAcknowledge);
            } else if(details['status'] == "Out") {
              var customerSignOut = new Object();
              var exists = false;
              var counter;
              for(z in other.customerSignOut) {
                if(other.customerSignOut[z].status == "Unsigned") {
                  counter = z;
                  exists = true;
                  break;
                }
              }
              if(exists) {
                var push = new Object();
                push.itemId = other.equipmentDetails[string[0]].items[x].itemId;
                push.equipmentGroup = string[0];
                push.serialNo = details['serialNo'];
                
                push.item = other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " serial no:" + details['serialNo'];
                other.customerSignOut[counter].items.push(push);
                other.customerSignOut[counter].status = "Unsigned";
                other.customerSignOut[counter].createdAt = new Date();
                other.customerSignOut[counter].createdBy = Meteor.user().username;
              } else {
                customerSignOut.id = other.customerSignOut.length;
                customerSignOut.items = [];
                var push = new Object();
                push.itemId = other.equipmentDetails[string[0]].items[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = string[0];
                push.item = other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " serial no:" + details['serialNo'];
                customerSignOut.items.push(push);
                customerSignOut.status = "Unsigned";
                customerSignOut.createdAt = new Date();
                customerSignOut.createdBy = Meteor.user().username;
                other.customerSignOut.push(customerSignOut);
              }
            } else if(details['status'] == "In") {
              
              var staffSignIn = new Object();
              var exists = false;
              var counter;
              for(z in other.staffSignIn) {
                if(other.staffSignIn[z].status == "Unsigned") {
                  counter = z;
                  exists = true;
                  break;
                }
              }
              if(exists) {
                var push = new Object();
                push.itemId = other.equipmentDetails[string[0]].items[x].itemId;
                push.equipmentGroup = string[0];
                push.serialNo = details['serialNo'];
                
                push.item = other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " serial no:" + details['serialNo'];
                other.staffSignIn[counter].items.push(push);
                other.staffSignIn[counter].status = "Unsigned";
                other.staffSignIn[counter].createdAt = new Date();
                other.staffSignIn[counter].createdBy = Meteor.user().username;
              } else {
                
                staffSignIn.id = other.staffSignIn.length;
                staffSignIn.items = [];
                var push = new Object();
                push.itemId = other.equipmentDetails[string[0]].items[x].itemId;
                push.serialNo = details['serialNo'];
                push.equipmentGroup = string[0];
                push.item = other.equipmentDetails[string[0]].items[x].brand + " " + other.equipmentDetails[string[0]].items[x].item + " serial no:" + details['serialNo'];
                staffSignIn.items.push(push);
                staffSignIn.status = "Unsigned";
                staffSignIn.createdAt = new Date();
                staffSignIn.createdBy = Meteor.user().username;
                other.staffSignIn.push(staffSignIn);
              }
            } else if(details['status'] == "N/A") {
              var exists = false;
              var counter;
              for(a in other.customerSignOut) {
                if(other.customerSignOut[a].status == "Unsigned") {
                  counter = a;
                  exists = true;
                  break;
                }
              }
              for(b in other.customerSignOut[counter].items) {
                if(other.customerSignOut[counter].items[b].itemId == other.equipmentDetails[string[0]].items[x].itemId) {
                  other.customerSignOut[counter].items.splice(b, 1);
                  break;
                }
              }
            }
            done = true;
            break;
          }
        }
        if(done = true) {
          break;
        }
      }
    }

    delete other._id;
    Others.update({_id: details['_id']}, {$set: other});
  },
  	removeOtherSerialNoRemark: function(details) {
  		var inventoryItem = Inventory.findOne({_id: details['inventoryId']});
	    var changed = false;

	    for(x in inventoryItem.serialNo) {
	      if(inventoryItem.serialNo[x].serialNo == details['serialNo']) {
	        inventoryItem.serialNo[x].remarks.splice(details['remarkId'], 1);
	        inventoryItem.serialNo[x].remarkCount -= 1;
	        
	        for(y in inventoryItem.serialNo[x].remarks) {
	          inventoryItem.serialNo[x].remarks[y].id = parseInt(y);
	        }

	        break;
	      }
	    }


	    delete inventoryItem._id;
	    Inventory.update({_id: details['inventoryId']}, {$set: inventoryItem});
  	},
  	changeOtherRemarkStatus: function(details) {
    var inventoryItem = Inventory.findOne({_id: details['inventoryId']});

    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].serialNo == details['serialNo']) {
        inventoryItem.serialNo[x].remarks[details['remarkId']].status = details['status'];
        break;
      }
    }

    delete inventoryItem._id;
    Inventory.update({_id: details['inventoryId']}, {$set: inventoryItem});
  },
  	addOtherSerialNoRemark: function(details) {
    var string = details['id'].split("_");
    var inventoryItem = Inventory.findOne({_id: string[1]});

    for(x in inventoryItem.serialNo) {
      if(inventoryItem.serialNo[x].serialNo == details['serialNo']) {
        var remarkObject = new Object();
        remarkObject.id = inventoryItem.serialNo[x].remarkCount;
        remarkObject.remark = details['remark'];
        remarkObject.routeId = string[1];
        remarkObject.serialNo = details['serialNo'];
        remarkObject.createdAt = new Date();
        remarkObject.udpatedAt = new Date();
        remarkObject.createdBy = Meteor.user().username;
        remarkObject.updatedBy = Meteor.user().username;
        remarkObject.status = "Open";
        inventoryItem.serialNo[x].remarks.push(remarkObject);

        inventoryItem.serialNo[x].remarkCount += 1;
        break;  
      }
    }

    delete inventoryItem._id;
    Inventory.update({_id: string[1]}, {$set: inventoryItem});
  },
  refreshPrice: function(id) {
    var other = Others.findOne({_id: id});

    var cumulatedSubAmount = 0;
    var cumulatedSubDiscount = 0;

    for(x in other.equipmentDetails[0].items) {
      cumulatedSubAmount += (other.equipmentDetails[0].items[x].price * other.equipmentDetails[0].items[x].quantity);
      cumulatedSubDiscount += (other.equipmentDetails[0].items[x].discount);
    }
    other.equipmentDetails[0].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
    other.equipmentDetails[0].subDiscount = cumulatedSubDiscount;

    var total = 0;
    for(x in other.equipmentDetails) {

      total += other.equipmentDetails[x].subTotal;
    }

  other.gst = parseFloat(total * 0.07);
  other.total = parseFloat(total + other.gst);

  if(other.payment.length != 0) {
    for(x in other.payment) {
      totalPaid += parseFloat(other.payment[x].amount);
    }

    other.balanceDue = parseFloat(other.total - totalPaid);
  } else {
    other.balanceDue = parseFloat(other.total);
  }

    delete other._id;
    Others.update({_id: id}, {$set: other});
  },
  updateOtherItemPrice: function(details) {
    console.log("inside updateOtherItemPrice");
    console.log(details);
  	var other = Others.findOne({_id: details['_id']});

  	for(x in other.equipmentDetails[0].items) {
  		if(other.equipmentDetails[0].items[x].id == details['id']) {
        if(details['price'] == -1) {
          other.equipmentDetails[0].items[x].subAmount = other.equipmentDetails[0].items[x].price * other.equipmentDetails[0].items[x].quantity;
        } else {
          other.equipmentDetails[0].items[x].price = details['price'];
          other.equipmentDetails[0].items[x].subAmount = details['price'] * other.equipmentDetails[0].items[x].quantity;
        }
  			break;
  		}
  	}

  	delete other._id;
  	Others.update({_id: details['_id']}, {$set: other});
  },
  updateOtherItemDiscount: function(details) {
  	var other = Others.findOne({_id: details['_id']});
  	for(x in other.equipmentDetails[0].items) {
  		if(other.equipmentDetails[0].items[x].id == details['id']) {
  			other.equipmentDetails[0].items[x].discount = details['discount'];
  			break;
  		}
  	}

  	delete other._id;
  	Others.update({_id: details['_id']}, {$set: other});
  },
  deleteOtherPayment: function(details) {
    var other = Others.findOne({_id: details['_id']});

    

    var amount = other.payment[details['paymentId']].amount;

    other.balanceDue += other.payment[details['paymentId']].amount;

    other.payment.splice(details['paymentId'], 1);

    for(x in other.payment) {
      other.payment[x].id = parseInt(x);
    }

    delete other._id;
    Others.update({_id: details['_id']}, {$set: other});

  },
  payForOther: function(details) {
    var other = Others.findOne({_id: details['_id']});

    var payment = new Object();
    payment.amount = parseFloat(details['amount']);
    payment.type = details['type'];
    payment.status = "Pending";
    
    if(details['serialNo'] != undefined) {
      payment.serialNo = details['serialNo'];
    }
    payment.id = other.payment.length;

    other.payment.push(payment);
    other.balanceDue -= parseFloat(details['amount']);

    delete other._id;
    Others.update({_id: details['_id']}, {$set: other});
  },
  	changeQuantityToOtherItem: function(details) {
    
  	var string = details['id'].split("_");

  	var other = Others.findOne({_id: details['_id']});

  	for(x in other.equipmentDetails[string[0]].items) {
  		if(other.equipmentDetails[string[0]].items[x].id == details['id']) {
  			other.equipmentDetails[string[0]].items[x].serialNumbers = details['serialNoArray'];
  			other.equipmentDetails[string[0]].items[x].quantity = details['serialNoArray'].length;
  			break;
  		}
  	}

    var cumulatedSubAmount = 0;
    var cumulatedSubDiscount = 0;

    for(x in other.equipmentDetails[string[0]].items) {
      cumulatedSubAmount += (other.equipmentDetails[string[0]].items[x].price * other.equipmentDetails[string[0]].items[x].quantity);
      cumulatedSubDiscount += (other.equipmentDetails[string[0]].items[x].discount);
    }
    other.equipmentDetails[string[0]].subTotal = cumulatedSubAmount - cumulatedSubDiscount;
    other.equipmentDetails[string[0]].subDiscount = cumulatedSubDiscount;

    var total = 0;
    for(x in other.equipmentDetails) {

      total += other.equipmentDetails[x].subTotal;
    }
  other.gst = parseFloat(total * 0.07);
  other.total = parseFloat(total + other.gst);

  if(other.payment.length != 0) {
    for(x in other.payment) {
      totalPaid += parseFloat(other.payment[x].amount);
    }

    other.balanceDue = parseFloat(other.total - totalPaid);
  } else {
    other.balanceDue = parseFloat(other.total);
  }

  	delete other._id;
  	Others.update({_id: details['_id']}, {$set: other});
  },
  removeOtherItem: function(details) {
  	var other = Others.findOne({_id: details['_id']});

    console.log(details); 
   
    var id = details['id'];

    for(x in other.equipmentDetails[0].items) {
      if(other.equipmentDetails[0].items[x].id == id) {

        var string = id.split("_");

        other.equipmentDetails[0].items.splice(x, 1);
        other.customerSignOut[string[0]].items.splice(string[1], 1);

        break;
      }
    }

    for(x in other.equipmentDetails[0].items) {
      var string = other.equipmentDetails[0].items[x].id.split("_");

      other.equipmentDetails[0].items[x].id = string[1] + "_" + x;
    }

  	delete other._id;
  	Others.update({_id: details['_id']}, {$set: other});


    return "Done";
  },
  updateOtherPrice: function(id) {
  	var other = Others.findOne({_id: id});

  	var total = 0;
  	var balanceDue = 0;
  	var subTotal = 0;
  	var gst = 0;
  	var totalPaid = 0;
  	var totalDiscount = 0;

  	for(x in other.equipmentDetails[0].items) {
  		other.equipmentDetails[0].items[x].subAmount = parseFloat((other.equipmentDetails[0].items[x].price * other.equipmentDetails[0].items[x].quantity) - (other.equipmentDetails[0].items[x].discount * other.equipmentDetails[0].items[x].quantity));
  		total += parseFloat(other.equipmentDetails[0].items[x].subAmount);
  		subTotal += parseFloat(other.equipmentDetails[0].items[x].subAmount);
  		balanceDue += parseFloat(other.equipmentDetails[0].items[x].subAmount);
  		totalDiscount += parseFloat(other.equipmentDetails[0].items[x].discount * other.equipmentDetails[0].items[x].quantity);
  	}
  	other.equipmentDetails[0].subDiscount = parseFloat(totalDiscount);
  	other.equipmentDetails[0].subTotal = parseInt(subTotal);
  	other.gst = parseFloat(total * 0.07);
  	other.total = parseFloat(total + other.gst);

  	if(other.payment.length != 0) {
  		for(x in other.payment) {
  			totalPaid += parseFloat(other.payment[x].amount);
  		}

  		other.balanceDue = parseFloat(other.total - totalPaid);
  	} else {
  		other.balanceDue = parseFloat(other.total);
  	}

  	delete other._id;
  	Others.update({_id: id}, {$set: other});
  },
  deleteOther: function(id) {

    var other = Others.findOne({_id: id});
    var customerId = other.customerId;

    Others.remove({_id: id});
    return customerId;
  },
  voidOther: function(id) {

    // Others.update({_id: id}, {$set: {status: "Void"}});

    return "OK";
  },
  deleteOtherRemark: function(details) {
    
     var other = Others.findOne({_id: details.current}); 

    for(x in other.remarks) {
      if(other.remarks[x].id == details.remarkId) {

        other.remarks.splice(x, 1);
      }
     }

     for(x in other.remarks) {
      other.remarks[x].id = parseInt(x);
     }

     delete other._id;
     Others.update({_id: details.current}, {$set: other});
  },
  updateOtherRemark: function(remarkDetails) {
    var other = Others.findOne({_id: remarkDetails['_id']});
    other.remarks = remarkDetails['remarks'];

    if(remarkDetails['remarks'][remarkDetails['clicked']].status == "Open") {
      var log = new Object();
      var number = parseInt(remarkDetails['clicked']) + 1;
      log.content = Meteor.user().username + " opened Remark #" + number + ".";
      log.owner = Meteor.user().username;
      log.dateTime = new Date();
    } else {
      var log = new Object();
      var number = parseInt(remarkDetails['clicked']) + 1;
      log.content = Meteor.user().username + " closed Remark #" + number + ".";
      log.owner = Meteor.user().username;
      log.dateTime = new Date();
    }

    other.logs.push(log);

    delete other._id;
    Others.update({_id: remarkDetails['_id']}, {$set: other});
  },
  addOtherRemark: function(remarkDetails) {

    

    var otherId = remarkDetails['_id'];

    var other = Others.findOne({_id: remarkDetails['_id']});

    var remark = new Object();

    if(other.remarks.length == 0) {
      var remark = new Object();
      remark.id = 0;
      remark.remark = remarkDetails['remark'];
      remark.createdAt = new Date();
      remark.createdBy = Meteor.user().username;
      remark.status = "Open";

      other.remarks.push(remark);
    } else {
      var remark = new Object();
      remark.id = other.remarks[other.remarks.length - 1].id + 1;
      remark.remark = remarkDetails['remark'];
      remark.createdAt = new Date();
      remark.createdBy = Meteor.user().username;
      remark.status = "Open";

      other.remarks.push(remark);
    }

    var log = new Object();
    log.content = Meteor.user().username + " added Remark #" + other.remarks.length + " - " + remark.remark + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    other.logs.push(log);

    delete other._id;
    Others.update({_id: remarkDetails['_id']}, {$set: other});
  },
	addOtherItem: function(itemDetails) {

    console.log("inside addOtherItem");
    console.log(itemDetails);

	    var other = Others.findOne({_id: itemDetails['_id']});

      delete other._id;

      var log = new Object(); 
      log.owner = Meteor.user().username;
      log.dateTime = new Date();
      log.content = Meteor.user().username + " added an item.";
      other.logs.push(log);

      other.equipmentDetails[0].items.push(itemDetails);

      var exists = false;

      var ct;

      for(x in other.customerSignOut) {
        if(other.customerSignOut[x].status == "Unsigned") {

          ct = x;

          exists = true;
          break;
        }
      }

      

      if(other.customerSignOut.length == 0 || exists == false) {

        console.log("inside false exists");
        ct = other.customerSignOut.length;

        var obj = new Object();
        obj.id = other.customerSignOut.length;
        obj.status = "Unsigned";
        obj.createdAt = new Date();
        obj.createdBy = Meteor.user().username;
        obj.items = [];
        other.customerSignOut.push(obj);

        var obj2 = new Object();
        obj2.groupCounter = itemDetails['groupCounter'];
        obj2.category = "";
        obj2.item = "";
        obj2.quantity = 0;

        other.customerSignOut[ct].items.push(obj2);
      } else {
        var obj2 = new Object();
        obj2.groupCounter = itemDetails['groupCounter'];
        obj2.category = "";
        obj2.item = "";
        obj2.quantity = 0;

        other.customerSignOut[ct].items.push(obj2);
      }

      


      Others.update({_id: itemDetails['_id']}, {$set: other}); 

	  },
	updateInvoiceCustomerName: function(details) {
	    var other = Others.findOne({_id: details['_id']});
	    var customer = Customers.findOne({_id: details['customerId']});

	    other.customerId = customer._id;
	    other.customerName = customer.name;
	    other.customerCompany = customer.company;
	    other.customerNumber = customer.contact;
	    other.customerEmail = customer.email;

	    delete other._id;
	    Others.update({_id: details['_id']}, {$set: other});
  	},
	addOthers: function(customerDetails) {
		var equipmentDetails = [];
	    var obj = new Object();
	    obj.id = 0;
	    obj.items = [];
	    obj.subTotal = 0;
	    obj.subDiscount = 0;

	    equipmentDetails.push(obj);

	    var logs = [];

	    var log = new Object();
	    log.content = Meteor.user().username + " created invoice.";
	    log.owner = Meteor.user().username;
	    log.dateTime = new Date();

	    logs.push(log);

	    var involvedUsers = [];
	    involvedUsers.push(Meteor.user().username);

	    var otherId = Others.insert({
        quickbooksInvoiceId: "Pending",
        quickbooksInvoiceQueryId: "Pending",
	      customerId: String(customerDetails['id']),
	      customerCompany: customerDetails['company'],
	      customerName: customerDetails['name'],
	      customerNumber: customerDetails['number'],
	      customerEmail: customerDetails['email'],
	      status: "Unpaid",
	      noOfItems: 0,
	      balanceDue: 0,
	      gst: 0,
	      total: 0,
	      customerPackagesUsed: [],
	      payment: [],
	      linkedInvoices: [],
	      equipmentDetails: equipmentDetails,
	      remarks: [],
	      remarksRequiringAcknowledgement: [],
	      staffSignIn: [],
	      customerSignOut: [],
	      involvedUsers: involvedUsers,
	      logs: logs,
	      createdBy: Meteor.user()._id,
	      createdAt: new Date()
	    });

      var othersLogObject = new Object();

      othersLogObject.invoiceId = otherId;
      othersLogObject.logs = [];

      var logObject = new Object();
      logObject.content = Meteor.user().username + " created invoice.";
      logObject.owner = Meteor.user().username;
      logObject.dateTime = new Date();

      othersLogObject.logs.push(logObject);

      OtherLogs.insert(othersLogObject);

      // bookingupdates

      var bookingupdatesObject = new Object();

      bookingupdatesObject.invoiceId = otherId;
      bookingupdatesObject.status = "OK";

      BookingUpdates.insert(bookingupdatesObject);

      var invoiceNeedingUpdate = InvoiceNeedingUpdate.insert({
        otherId: otherId
      });
    

	    return otherId;		
	}
});