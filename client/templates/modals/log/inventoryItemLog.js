Template.inventoryItemLog.created = function () {
};

Template.inventoryItemLog.rendered = function () {
};

Template.inventoryItemLog.helpers({
  logs: function () {
    var inventoryItem = Inventory.findOne({_id: Router.current().params._id});

    for (i = 0; i < inventoryItem['logs'].length; i++) { 
        inventoryItem['logs'][i]['dateTime'] = moment(inventoryItem['logs'][i]['dateTime']).format('Do MMMM YYYY, h:mma');

    }

    return inventoryItem['logs'].reverse();
  },
  dateTime: function() {
  	return this.dateTime;
  }
});

Template.inventoryItemLog.events({
 
});