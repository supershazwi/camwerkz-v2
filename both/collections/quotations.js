Quotations = new Mongo.Collection('quotations');

Meteor.methods({
	addQuotation: function(customerDetails) {

		var equipmentDetails = [];
		var obj = new Object();
		obj.id = 0;
		obj.dates = [];
		obj.noOfDates = 0;
		obj.items = [];
		obj.subTotal = 0;

		equipmentDetails.push(obj);

		var logs = [];

		var log = new Object();
		log.content = Meteor.user().username + " created quotation.";
		log.owner = Meteor.user().username;
		log.dateTime = new Date();

		logs.push(log);

		var involvedUsers = [];
    	involvedUsers.push(Meteor.user().username);

		var quotationId = Quotations.insert({
			customerId: customerDetails.id,
			customerCompany: customerDetails.company,
			customerName: customerDetails.name,
			noOfItems: 0,
			total: 0,
			equipmentDetails: equipmentDetails,
			remarks: [],
      		involvedUsers: involvedUsers,
			logs: logs,
			createdBy: Meteor.user()._id,
			createdAt: new Date()
		});

		return quotationId;
	},
	addQuotationRemark: function(remarkDetails) {
    var quotationId = remarkDetails['_id'];

    var quotation = Quotations.findOne({_id: remarkDetails['_id']});
    
    var remark = new Object();
    remark.id = quotation.remarks.length;
    remark.remark = remarkDetails['remark'];
    remark.createdAt = new Date();
    remark.createdBy = Meteor.user().username;
    remark.status = "Open";

    quotation.remarks.push(remark);

    var log = new Object();
    log.content = Meteor.user().username + " added Remark #" + quotation.remarks.length + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();

    quotation.logs.push(log);

    delete quotation._id;
    Quotations.update({_id: remarkDetails['_id']}, {$set: quotation});
  },
  deleteQuotation: function(id) {
    Quotations.remove(id);

    
    return true;
  },
  updateQuotationRemark: function(remarkDetails) {
    var quotation = Quotations.findOne({_id: remarkDetails['_id']});
    quotation.remarks = remarkDetails['remarks'];

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

    quotation.logs.push(log);

    delete quotation._id;
    Quotations.update({_id: remarkDetails['_id']}, {$set: quotation});
  },
  addQuotationItem: function(itemDetails) {
    var quotationId = itemDetails['_id'];
    var quotation = Quotations.findOne({_id: itemDetails['_id']});
    var string = itemDetails['id'].split("_");
    var duplicate = false;

    for (x in quotation.equipmentDetails[string[0]].items) {
      if(itemDetails['id'] == quotation.equipmentDetails[string[0]].items[x].id) {
        duplicate = true;
      }
    }

    if(!duplicate) {
      delete itemDetails._id;
      delete quotation._id;

      var log = new Object(); 
      log.owner = Meteor.user().username;
      log.dateTime = new Date();

      quotation.noOfItems += 1;

      //search customer packages whether or not customer is entitled to discounts
      if(itemDetails['packageClicked'] != undefined) {
        var customerPackage = CustomerPackages.findOne({_id: itemDetails['packageClicked']});
        for(x in customerPackage.items) { 
          if(customerPackage.items[x].id == itemDetails['itemId']) {
            itemDetails['discount'] = itemDetails['rate'] - customerPackage.items[x].rate;
            itemDetails['rate'] = customerPackage.items[x].rate;
            log.content = Meteor.user().username + " added " + itemDetails['item'] + " into Group #" + (parseInt(string[0])+1) + " and selected " + customerPackage.name + ".";
          }
        }
      } else {
        log.content = Meteor.user().username + " added " + itemDetails['item'] + " into Group #" + (parseInt(string[0])+1) + ".";
      }

      quotation.logs.push(log);

      if(quotation.equipmentDetails[string[0]].noOfDates > 0) {
        itemDetails['days'] = quotation.equipmentDetails[string[0]].noOfDates;
      }

      quotation.equipmentDetails[string[0]].items.push(itemDetails);

      //check for clashes
      

      Quotations.update({_id: quotationId}, {$set: quotation}); 
    }
  },
  removeQuotationItem: function(details) {

    var string = details['id'].split("_");

    var quotation = Quotations.findOne({_id: details['_id']});
    for(i = 0; i < quotation.equipmentDetails.length; i++) {
      for(j = 0; j < quotation.equipmentDetails[i].items.length; j++) {
        if(quotation.equipmentDetails[i].items[j].id == details['id']) {
          if(quotation.equipmentDetails[i].items[j].packageClicked != undefined && quotation.equipmentDetails[i].items[j].discountPriced > 0) {
            var customerPackage = CustomerPackages.findOne({_id: quotation.equipmentDetails[i].items[j].packageClicked});
            if(customerPackage.items) {
              for(x in customerPackage.items) { 
                if(customerPackage.items[x].id == string[1]) {
                  customerPackage.items[x].quantity += quotation.equipmentDetails[i].items[j].discountPriced;
                }
              }
            }

            delete customerPackage._id;
            CustomerPackages.update({_id: quotation.equipmentDetails[i].items[j].packageClicked}, {$set: customerPackage});
          }

          var log = new Object(); 
          log.content = Meteor.user().username + " removed " + quotation.equipmentDetails[i].items[j].item + " from Group #" + (parseInt(string[0])+1) + ".";
          log.owner = Meteor.user().username;
          log.dateTime = new Date();
          quotation.logs.push(log);

          quotation.noOfItems = quotation.noOfItems - 1;


          quotation.equipmentDetails[i].items.splice(j, 1);
        }
      }
    }

    delete quotation._id;

    Quotations.update({_id: details['_id']}, {$set: quotation});
  },
  removeQuotationGroup: function(details) {
    var quotation = Quotations.findOne({_id: details['_id']});
    for(i = 0; i < quotation.equipmentDetails.length; i++) {
      if(quotation.equipmentDetails[i].id == details['id']) {
         quotation.equipmentDetails.splice(i, 1);

          var log = new Object(); 
          log.content = Meteor.user().username + " removed Group #" + (i+1) + ".";
          log.owner = Meteor.user().username;
          log.dateTime = new Date();
          quotation.logs.push(log);
      }
    }

    for(i = 0; i < quotation.equipmentDetails.length; i++) {
      quotation.equipmentDetails[i].id = i;
    }

    delete quotation._id;

    Quotations.update({_id: details['_id']}, {$set: quotation});
  },
  addQuantityToQuotationItem: function(details) {
    var string = details['id'].split("_");

    var quotation = Quotations.findOne({_id: details['_id']});

    for(i = 0; i < quotation.equipmentDetails.length; i++) {
      for(j = 0; j < quotation.equipmentDetails[i].items.length; j++) {
        if(quotation.equipmentDetails[i].items[j].id == details['id']) {
          if(quotation.equipmentDetails[i].items[j].booked != quotation.equipmentDetails[i].items[j].total) {
            quotation.equipmentDetails[i].items[j].booked += 1; //add quantity to booked, i need to add quantity to both originalPriced and discountPriced

            var log = new Object(); 
            log.content = Meteor.user().username + " increased quantity of " + quotation.equipmentDetails[i].items[j].item + " in Group #" + (parseInt(string[0])+1) + " to " + quotation.equipmentDetails[i].items[j].booked + ".";
            log.owner = Meteor.user().username;
            log.dateTime = new Date();
            quotation.logs.push(log);

            if(quotation.equipmentDetails[i].items[j].packageClicked != undefined) {
              var customerPackage = CustomerPackages.findOne({_id: quotation.equipmentDetails[i].items[j].packageClicked});
              for(x in customerPackage.items) {
                if(customerPackage.items[x].id == string[1]) {
                  if(customerPackage.items[x].quantity > 0) {
                    customerPackage.items[x].quantity -= 1;
                    quotation.equipmentDetails[i].items[j].discountPriced += 1;
                  } else {
                    quotation.equipmentDetails[i].items[j].originalPriced += 1;
                  }
                }
              }

              delete customerPackage._id;
              CustomerPackages.update({_id: quotation.equipmentDetails[i].items[j].packageClicked}, {$set: customerPackage});
            } else {
              quotation.equipmentDetails[i].items[j].originalPriced += 1;
            }
          }
        }
      }
    }

    delete quotation._id;

    Quotations.update({_id: details['_id']}, {$set: quotation});
  },
  minusQuantityToQuotationItem: function(details) {
    var string = details['id'].split("_");

    var quotation = Quotations.findOne({_id: details['_id']});
    for(i = 0; i < quotation.equipmentDetails.length; i++) {
      for(j = 0; j < quotation.equipmentDetails[i].items.length; j++) {
        if(quotation.equipmentDetails[i].items[j].id == details['id']) {
          if(quotation.equipmentDetails[i].items[j].booked != 0) {
            quotation.equipmentDetails[i].items[j].booked -= 1;

            var log = new Object(); 
            log.content = Meteor.user().username + " decreased quantity of " + quotation.equipmentDetails[i].items[j].item + " in Group #" + (parseInt(string[0])+1) + " to " + quotation.equipmentDetails[i].items[j].booked + ".";
            log.owner = Meteor.user().username;
            log.dateTime = new Date();
            quotation.logs.push(log);

            if(quotation.equipmentDetails[i].items[j].packageClicked != undefined) {
              var customerPackage = CustomerPackages.findOne({_id: quotation.equipmentDetails[i].items[j].packageClicked});
              for(x in customerPackage.items) {
                if(customerPackage.items[x].id == string[1]) {
                  if(quotation.equipmentDetails[i].items[j].originalPriced > 0) {
                    quotation.equipmentDetails[i].items[j].originalPriced -= 1;
                  } else {
                    quotation.equipmentDetails[i].items[j].discountPriced -= 1; 
                    customerPackage.items[x].quantity += 1;
                  }
                }
              }

              delete customerPackage._id;
              CustomerPackages.update({_id: quotation.equipmentDetails[i].items[j].packageClicked}, {$set: customerPackage});
            } else {
              quotation.equipmentDetails[i].items[j].originalPriced -= 1;
            }
          }
        }
      }
    }

    delete quotation._id;

    Quotations.update({_id: details['_id']}, {$set: quotation});
  },
  addQuotationDatesToGroup: function(details) {
    var quotation = Quotations.findOne({_id: details['_id']});
    quotation.equipmentDetails[details['id']].dates = details['dates'];

    for(i = 0; i < details['dates'].length; i++) {
      quotation.equipmentDetails[details['id']].dates[i] = new Date(details['dates'][i]);
    }

    quotation.equipmentDetails[details['id']].noOfDates = details['dates'].length;
    for(x in quotation.equipmentDetails[details['id']].items) {
      quotation.equipmentDetails[details['id']].items[x].days = details['dates'].length;
    }

    delete quotation._id;
    delete quotation.dates;
    delete quotation.id;
    Quotations.update({_id: details['_id']}, {$set: quotation});
  },
  updateQuotationPrice: function(quotationId) {
    var quotation = Quotations.findOne({_id: quotationId});
    for(x in quotation.equipmentDetails) {
      var subTotal = 0;
      for(y in quotation.equipmentDetails[x].items) {

        quotation.equipmentDetails[x].items[y].subAmount = (quotation.equipmentDetails[x].items[y].originalPriced * (quotation.equipmentDetails[x].items[y].rate + quotation.equipmentDetails[x].items[y].discount) * quotation.equipmentDetails[x].items[y].days) + (quotation.equipmentDetails[x].items[y].discountPriced * quotation.equipmentDetails[x].items[y].rate * quotation.equipmentDetails[x].items[y].days);
        subTotal = subTotal + quotation.equipmentDetails[x].items[y].subAmount;
      }
      quotation.equipmentDetails[x].subTotal = subTotal;
    }
    delete quotation._id;
    Quotations.update({_id: quotationId}, {$set: quotation});
  },
  addQuotationGroup: function(quotationId) {
    var quotation = Quotations.findOne({_id: quotationId});

    var newGroup = new Object();
    newGroup.id = quotation.equipmentDetails.length;
    newGroup.dates = [];
    newGroup.noOfDates = 0;
    newGroup.items = [];
    newGroup.subTotal = 0;
    quotation.equipmentDetails.push(newGroup);

    var log = new Object(); 
    log.content = Meteor.user().username + " added Group #" + quotation.equipmentDetails.length + ".";
    log.owner = Meteor.user().username;
    log.dateTime = new Date();
    quotation.logs.push(log);

    delete quotation._id;
    Quotations.update({_id: quotationId}, {$set: quotation});
  },
  updateQuotationAvailability: function(details) {
    var quotation = Quotations.findOne({_id: details['_id']});

    var string = details['id'].split("_");

    for(x in quotation.equipmentDetails[string[0]].items) {
      if(quotation.equipmentDetails[string[0]].items[x].id == details['id']) {
        quotation.equipmentDetails[string[0]].items[x].availability = details['availability'];

        var log = new Object(); 
        log.content = Meteor.user().username + " marked " + quotation.equipmentDetails[string[0]].items[x].item + " in Group #" + (parseInt(string[0])+1) + " to " + details['availability'] + ".";
        log.owner = Meteor.user().username;
        log.dateTime = new Date();
        quotation.logs.push(log);
      }
    }

    delete quotation._id;
    Quotations.update({_id: details['_id']}, {$set: quotation});
  }
});