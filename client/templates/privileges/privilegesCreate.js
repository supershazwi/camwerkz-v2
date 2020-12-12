Template.privilegesCreate.rendered = function() {
}

Template.privilegesCreate.events({
	'keyup #name': function(e) {
    var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
    var privilege = Privileges.findOne({name: name});
	    if(typeof privilege == 'undefined') {
	    	Session.clear('nameDuplicate');
	    }
	    else {
	    	Session.setTemp('nameDuplicate', true);
	    }
  	},
  	'click #addPrivilege': function(e) {
	    e.preventDefault();  

      var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
        
      if($("#customerName").val() != undefined) {

        var customerId = [];
        customerId.push(Session.get("customer")._id);

        var privilegeAttributes = {
            name: name,
            details: $("#details").val(),
            equipments: [],
            discountValue: $("#discountValue").val(),
            customerId: customerId
        };
      } else {
        var privilegeAttributes = {
            name: name,
            details: $("#details").val(),
            equipments: [],
            discountValue: $("#discountValue").val(),
            customerId: []
        };
      }

	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('addPrivilege', privilegeAttributes, function(error, result) {
	    });
  	}
});

Template.privilegesCreate.helpers({
  nameDuplicate: function() {
  	return Session.get('nameDuplicate');
  },
  customerExist: function() {
    if(Session.get("customer"))
      return true;
    else
      return false;
  },
  customerName: function() {
    return Session.get("customer").name;
  },  
  isDisabled:function() {
    if(Session.get("nameDuplicate")) {
      return "disabled";
    }
  },
  nameStatus: function() {
    if(Session.get('nameDuplicate')) {
      return "red";
    }
  },
});