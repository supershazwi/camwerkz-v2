Template.othersSerialNoSelect.created = function () {
  Meteor.subscribe('inventories');

  var other = Others.findOne({_id: Router.current().params._id}); 
    
      var serialNoArray = [];
      console.log(other);
      console.log(Session.get("equipmentGroup"));
      console.log(Session.get("equipmentSelectedId"));
    for(x in other.equipmentDetails[Session.get("equipmentGroup")].items) {
      if(other.equipmentDetails[Session.get("equipmentGroup")].items[x].itemId == Session.get("equipmentSelectedId")) {
        console.log('hello');
        serialNoArray = serialNoArray.concat(other.equipmentDetails[Session.get("equipmentGroup")].items[x].serialNumbers);
        break;
      }
    }

    Session.setTemp("serialNoArray", serialNoArray);

    console.log(Session.get("serialNoArray"));
};

Template.othersSerialNoSelect.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');

  
};

Template.othersSerialNoSelect.helpers({
  selectedEquipment: function() {
    return Session.get("equipmentSelected");
  },
  isDamaged: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Damaged");
      }
    }
  },
  isMissing: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Missing");
      }
    }
  },
  isSale: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Sale");
      }
    }
  },
  serialNumbers: function() {
    var item = Inventory.findOne({_id: Session.get("equipmentSelectedId")});
    return item.serialNo;
  },
  remarksExist: function() {
    if(this.remarkCount != 0) {
      return true;
    } else {
      return false;
    }
  },
  remarkOpen: function() {
    if(this.status == "Open") {
      return true;
    } else {
      return false;
    }
  },
  textDecoration: function() {
    if(this.status == "Open") {
      return "";
    } else {
      return "line-through";
    }
  },
  createdAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  checkboxChecked: function() {
  	var other = Others.findOne({_id: Router.current().params._id});
    for(x in other.equipmentDetails[Session.get("equipmentGroup")].items) {
      for(y in other.equipmentDetails[Session.get("equipmentGroup")].items[x].serialNumbers) {
        if(other.equipmentDetails[Session.get("equipmentGroup")].items[x].serialNumbers[y].serialNo == this.serialNo) {
          return true;
        }
      }
    }
  },
  displayCheckbox: function() {
    var statuses = ["Sent For Repair", "Waiting To Be Sent For Repair", "Missing", "Damaged"];
    if(!(statuses.indexOf(this.status) != -1)) {
      return "visible";
    } else {
      return "hidden";
    }
  }
});

Template.othersSerialNoSelect.events({
  'click .status': function(e) {
    console.log(e.target.localName);
    if(e.target.localName == "button") {
      var string = e.currentTarget.id.split("_");

      var attributes = {
          _id: Router.current().params._id,
          id: Session.get("equipmentGroup") + "_" + Session.get("equipmentSelectedId"),
          serialNo: string[0],
          status: string[1]
      };

      Meteor.call('changeOtherSerialNoStatus', attributes, function(error, result) {
      });
    }
  },
  'click #close': function(e) {
    e.preventDefault();

    IonModal.close();
    IonKeyboard.close();
  },
  'click .removeRemark': function(e) {
    var string = e.currentTarget.id.split("_");
    var attributes = {
        _id: Router.current().params._id,
        remarkId: string[0],
        serialNo: string[1],
        inventoryId: string[2]
    };
    Meteor.call('removeOtherSerialNoRemark', attributes, function(error, result) {
    });
  },
  'click .checkRemark': function(e) {
    var string = e.currentTarget.id.split("_");
    var status;
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        status = "Close";
      } else {
        status = "Open";
      }
      var attributes = {
          _id: Router.current().params._id,
          status: status,
          remarkId: string[0],
          serialNo: string[1],
          inventoryId: string[2]
      };

      Meteor.call('changeOtherRemarkStatus', attributes, function(error, result) {
      });
    }
  },
  'click .addRemark': function(e) {
    document.getElementById("remark_"+e.currentTarget.id).value = "";
    $("#li_"+e.currentTarget.id).css("display", "none");
    $("#addRemark_"+e.currentTarget.id).css("display", "block");
  },
  'click .submitRemark': function(e) {
    $("#addRemark_"+e.currentTarget.id).css("display", "none");
    $("#viewRemarks_"+e.currentTarget.id).css("display", "block");

    //add remarks to inventory item 
    var attributes = {
        _id: Router.current().params._id,
        id: Session.get("equipmentGroup") + "_" + Session.get("equipmentSelectedId"),
        serialNo: e.currentTarget.id,
        remark: document.getElementById("remark_"+e.currentTarget.id).value,
        status: "Open"
    };

    Meteor.call('addOtherSerialNoRemark', attributes, function(error, result) {
    });
  },
  'click .viewRemark': function(e) {
    $("#li_"+e.currentTarget.id).css("display", "none");
    $("#viewRemarks_"+e.currentTarget.id).css("display", "block");
  },
  'click .closeRemarks': function(e) {
    $("#li_"+e.currentTarget.id).css("display", "block");
    $("#viewRemarks_"+e.currentTarget.id).css("display", "none");
  },
  'click .cancelRemark': function(e) {
    $("#li_"+e.currentTarget.id).css("display", "block");
    $("#addRemark_"+e.currentTarget.id).css("display", "none");
  },
  'click .checkSerialNo': function(e) {
    var string = e.currentTarget.id.split("_");
    console.log(Session.get("serialNoArray"));
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var serialNoArray = Session.get('serialNoArray');
        var object = new Object();
        object.serialNo = string[1];
        object.status = "N/A";
        serialNoArray.push(object);
        Session.setTemp('serialNoArray', serialNoArray);
      } else {
        var serialNoArray = Session.get('serialNoArray');
        for(x in serialNoArray) {
          if(serialNoArray[x].serialNo == string[1]) {
            serialNoArray.splice(x, 1);
          }
        }
        Session.setTemp('serialNoArray', serialNoArray);
      }
        var attributes = {
          _id: Router.current().params._id,
          id: Session.get("equipmentGroup") + "_" + Session.get("equipmentSelectedId"),
          serialNoArray: Session.get("serialNoArray")
      };

      Meteor.call('changeQuantityToOtherItem', attributes, function(error, result) {
        // Meteor.call('updateOtherPrice', Router.current().params._id);
      });

      
    }
  },
});