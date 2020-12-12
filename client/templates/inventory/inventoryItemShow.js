Template.inventoryItemShow.created = function () {
  Meteor.subscribe('inventoryItem', Router.current().params._id);
  Meteor.subscribe('brands');
  Meteor.subscribe('logs', Meteor.user()._id);
  Meteor.subscribe('categories');
  Meteor.subscribe('repairs');
};

Template.inventoryItemShow.rendered = function () {
};

Template.inventoryItemShow.helpers({
  bookingId: function() {
    console.log(this);
  },
  serialGroup: function() {
    return parseInt(this.groupId) + 1;
  },
  booking: function() {
    return this;
  },
  highlighted: function() {
    if(this.serialNo == Session.get("serialNoSelected")) {
      return "#FFFF9D";
    } else {
      return "white";
    }
  },
  inventoryItem: function () {
    return Inventory.findOne({_id: Router.current().params._id})
  },
  affectedBookingsExist: function() {
    return this.affectedBookings.length > 0;
  },
  overallAffectedBookingsExist: function() {
    for(x in Inventory.findOne({_id: Router.current().params._id}).serialNo) {
      if(Inventory.findOne({_id: Router.current().params._id}).serialNo[x].affectedBookings != undefined) {
        if(Inventory.findOne({_id: Router.current().params._id}).serialNo[x].affectedBookings.length > 0) {
          return true;
        }
      }
    }

    return false;
  },
  rate: function() {
    var item = Inventory.findOne({_id: Router.current().params._id})
    return accounting.formatMoney(item['rate']);
  },
  currentId: function() {
    return Router.current().params._id;
  },
  remarksExist: function() {
    var item = Inventory.findOne({_id: Router.current().params._id})
    if(item['remarkCount'] > 0) {
      return true;
    } else {
      return false;
    }
  },
  createdAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  price: function() {
    return accounting.formatMoney(this.price);
  },
  remarks: function() {
    var item = Inventory.findOne({_id: Router.current().params._id});

    for (i = 0; i < item['remarkCount']; i++) { 
        item['remarks'][i]['createdAt'] = moment(item['remarks'][i]['createdAt']).format('Do MMMM YYYY, h:mma');
    }

    return item['remarks'].reverse();
  },
  remarkCount: function() {
    return this.remarkCount;
  },
  isAvailable: function() {
    if(this.status=="Available") {
      return "button-balanced";
    } else {
      return "button-stable";
    }
  },
  isQuoted: function() {
    if(this.status == "Quoted") {
      return "button-energized"; 
    } else {
      return "button-stable";
    }
  },
  isDamaged: function() {
    if(this.status == "Damaged") {
      return "button-positive"; 
    } else {
      return "button-stable";
    }
  },
  isMissing: function() {
    if(this.status == "Missing") {
      return "button-positive"; 
    } else {
      return "button-stable";
    }
  },
  isBooked: function() {
    if(this.status == "Booked") {
      return "button-positive"; 
    } else {
      return "button-stable";
    }
  },
  isSentForRepair: function() {
    if(this.status == "Sent For Repair") {
      return "button-positive"; 
    } else {
      return "button-stable";
    }
  },
  isWaitingToBeSentForRepair: function() {
    if(this.status == "Waiting To Be Sent For Repair") {
      return "button-positive"; 
    } else {
      return "button-stable";
    }
  },
  isUnderRepairStatus: function() {
    if(this.status == "Repair") 
      return true;
    else
      return false;
  }
});

Template.inventoryItemShow.events({
  'click [data-action="showDeleteConfirm"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Item',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        Meteor.call('deleteInventoryItem', Router.current().params._id, function(error, result) {
          Router.go('inventory');
        });
      },
      onCancel: function() {
      }
    });
  },
  'click .item-status': function(e) {
    var target = e.target.id;
    var targetArray = e.target.id.split("_");

    var inventoryItem = Inventory.findOne({_id: Router.current().params._id});
    var originalStatus = inventoryItem.serialNo[targetArray[0]].status;
    var inventoryItemSerialNo = inventoryItem['serialNo'];
    inventoryItemSerialNo[targetArray[0]]['status'] = targetArray[1];

    var itemAttributes = {
      _id: Router.current().params._id,
      status: targetArray[1],
      target: targetArray[0],
      bookableQuantity: inventoryItem['bookableQuantity'],
      serialNo: inventoryItem['serialNo'],
      inventoryItem: Inventory.findOne({_id: Router.current().params._id}),
      updateType: "itemStatus",
      originalStatus: originalStatus
    };

      Meteor.call('updateInventoryItem', itemAttributes, function(error, result) {
    });
  },
  'click .viewRemarks': function(e) {
    var targetArray = e.target.id.split("_");
    Session.setTemp("serialNoClicked", targetArray[0]);
    Session.setTemp("itemIdClicked", targetArray[1]);
  },
  'click .addRemark': function(e) {
    var targetArray = e.target.id.split("_");
    Session.setTemp("serialNoClicked", targetArray[0]);
    Session.setTemp("itemIdClicked", targetArray[1]);
  }
});
