Template.viewItemRemark.rendered = function() {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
}

Template.viewItemRemark.helpers({
  itemRemark: function () {
    var inventoryItem = Inventory.findOne({_id: Router.current().params._id});

    for (i = 0; i < inventoryItem['serialNo'][Session.get("itemIdClicked")]['remarks'].length; i++) { 
        inventoryItem['serialNo'][Session.get("itemIdClicked")]['remarks'][i]['createdAt'] = moment(inventoryItem['serialNo'][Session.get("itemIdClicked")]['remarks'][i]['createdAt']).format('Do MMMM YYYY, h:mma');
    }

    return inventoryItem['serialNo'][Session.get("itemIdClicked")]['remarks'].reverse();
  },
  remarkChecked: function() {
    if(this['status'] == 'Open') {
      return "remarkOpen";
    } else {
      return "remarkClose";
    }
  },
  remarkId: function() {
    var id = parseInt(this.id);
    id = id + 1;
    return id;
  },
  checkboxChecked: function() {
  	if(this['status'] == 'Open') {
      return false;
    } else {
      return true;
    }
  }
});

Template.viewItemRemark.events({
  'click .removeRemark': function(e) {
    var string = e.currentTarget.id.split("_");
    var attributes = {
        _id: Router.current().params._id,
        remarkId: string[0],
        serialNo: string[1]
    };
    Meteor.call('removeSerialNoRemarkFromInventory', attributes, function(error, result) {
    });
  },
  'click .remark': function(e) {
    var string = e.currentTarget.id.split("_");
  	var inventoryItem = Inventory.findOne({_id: Router.current().params._id});

  	if(e.target.localName == "input") {
  		if(e.target.checked == true) {

        var itemAttributes = {
          _id: Router.current().params._id,
          remarkId: string[0],
          serialNo: string[1],
          status: "Close"
        };

        Meteor.call('updateInventoryItemRemark', itemAttributes, function(error, result) {
        });
      } else {
        var itemAttributes = {
          _id: Router.current().params._id,
          remarkId: string[0],
          serialNo: string[1],
          status: "Open"
        };

        Meteor.call('updateInventoryItemRemark', itemAttributes, function(error, result) {
        });
      }
  	}
  }
});