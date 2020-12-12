Template.inventoryDuplicate.created = function () {
  Meteor.subscribe("duplicateInventory");

  Meteor.subscribe("inventories", {
    onReady: function () { console.log("ready", arguments);
      Session.setTemp('duplicateCount', document.getElementsByClassName('item-duplicate').length);
      console.log(document.getElementsByClassName('item-duplicate').length);
    },
    onError: function () { console.log("onError", arguments); }
  });
};

Template.inventoryDuplicate.rendered = function () {
  Meteor.setInterval(function () {
    if(document.getElementsByClassName('item-duplicate').length != Session.get("duplicateCount")) {
      Meteor.call("insertDuplicate");

      Session.setTemp('duplicateCount', document.getElementsByClassName('item-duplicate').length);
    }
  }, 5000);
};

Template.inventoryDuplicate.helpers({
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  },
  duplicateLog: function() {
    return DuplicateInventory.find();
  },
 duplicates: function() {
  var inventory = Inventory.find({}, {fields:{item: 1}}).fetch();

  var arrToReturn = [];

  for(x in inventory) {
    if(arrToReturn[inventory[x].item] == undefined) {
      arrToReturn[inventory[x].item] = new Object();
      arrToReturn[inventory[x].item].count = 0;
    }

    arrToReturn[inventory[x].item].count++;
  }

  var arrToReturn2 = [];

  var duplicateArr = [];

  for(x in inventory) {
    if(arrToReturn[inventory[x].item].count > 1 && duplicateArr.indexOf(inventory[x].item) == -1) {
      var obj = new Object();
      obj.item = inventory[x].item;
      obj.count = arrToReturn[inventory[x].item].count;

      arrToReturn2.push(obj);
      duplicateArr.push(inventory[x].item);
    }
  }

  return arrToReturn2;
 }
});

Template.inventoryDuplicate.events({
  
});