Template.privilegesEdit.created = function () {
  Meteor.subscribe('privileges');
};

Template.privilegesEdit.rendered = function() {
  var privilege = Privileges.findOne({_id: Router.current().params._id});
  Session.setTemp("currentPrivilegeName", privilege.name);
  if(Session.get("nameDuplicate")) {
    Session.clear("nameDuplicate");
  }

  var element = document.getElementById('discountOptions');
  element.value = privilege.discountType;
}

Template.privilegesEdit.events({
	'keyup #name': function(e) {
    var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
    var privilege = Privileges.findOne({name: name});
	    if(typeof privilege == 'undefined') {
	    	Session.clear('nameDuplicate');
	    }
	    else {
	    	if(name != Session.get("currentPrivilegeName")) 
          Session.setTemp('nameDuplicate', true);
        else
          Session.clear('nameDuplicate');
	    }
  	},
  	'click #submit': function(e) {
	    e.preventDefault();  

      var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
        
      var privilegeAttributes = {
            _id: Router.current().params._id,
            name: name,
            details: $("#details").val(),
            discountType: $("#discountOptions").val(),
            discountValue: $("#discountValue").val(),
            privilege: Privileges.findOne({_id: Router.current().params._id})
        };

	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('updatePrivilege', privilegeAttributes, function(error, result) {
        Router.go('privileges.show', {_id: Router.current().params._id}, {});
	    });
  	}
});

Template.privilegesEdit.helpers({
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
  privilege: function() {
    return Privileges.findOne({_id: Router.current().params._id});
  }
});