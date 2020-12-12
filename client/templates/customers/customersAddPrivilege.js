Template.customersAddPrivilege.rendered = function() {

  $("#showNotice").css("display", "none");

  var privileges = Privileges.find({}, {fields: {name: 1, details: 1}, sort: {name: 1}}).fetch();
      
  $('#privilegeSearch').selectize({
      plugins: ['remove_button'],
      delimiter: ',',
      persist: false,
      maxItems: null,
      valueField: '_id',
      labelField: 'name',
      searchField: ['name', 'details'],
      options: privileges,
      render: {
          item: function(item, escape) {
              return '<div>' +
                  (item.name ? '<span class="name"><strong>' + escape(item.name) + '</strong></span>' : '') +
                  (item.details ? ' <span class="email">' + escape(item.details) + '</span>' : '') +
              '</div>';
          },
          option: function(item, escape) {
              var label = item.name || item.item;
              var caption = item.name ? item.item : null;
              return '<div>' +
                  '<span class="label"><strong>' + escape(label) + '</strong></span>' +
                  (caption ? ' <span class="caption">' + escape(caption) + '</span>' : '') +
              '</div>';
          }
      },
      onDropdownOpen: function() {
        $("#packageName").css("height", "310px");
      },
      onDropdownClose: function() {
        $("#packageName").css("height", "96px");
      },
      onItemAdd: function(value, item) {
           if(Privileges.findOne({_id: value}) != undefined) {
            $(".newPrivilege").css("display", "none");
            $("#showNotice").css("display", "block");
            document.getElementById("addPrivilege").innerHTML = "Add to Privilege(s)";
          }   
        
      },  
      onItemRemove: function(value) {
        if($("#privilegeSearch").val() == "") {
          $(".newPrivilege").css("display", "block");
          $("#showNotice").css("display", "none");
          document.getElementById("addPrivilege").innerHTML = "Add New Privilege";
        }
      },
      create: true
  });

}

Template.customersAddPrivilege.events({
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

      var name = $("#privilegeSearch").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
        
      if($("#customerName").val() != undefined) {

        var customerId = [];
        customerId.push(Session.get("customer")._id);

        var privilegeAttributes = {
            name: name,
            details: $("#details").val(),
            discountType: $("#discountOptions").val(),
            equipments: [],
            discountValue: $("#discountValue").val(),
            customerId: customerId
        };
      } else {
        var privilegeAttributes = {
            name: name,
            details: $("#details").val(),
            discountType: $("#discountOptions").val(),
            equipments: [],
            discountValue: $("#discountValue").val(),
            customerId: []
        };
      }

	    IonModal.close();
    	IonKeyboard.close();

	    //Meteor.call('addPrivilege', privilegeAttributes, function(error, result) {
	    //});
  	}
});

Template.customersAddPrivilege.helpers({
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