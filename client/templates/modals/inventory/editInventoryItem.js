Template.editInventoryItem.rendered = function() {
  var item = Inventory.findOne({_id: Router.current().params._id});
	Session.setTemp("currentItemName", item.item);

  var element = document.getElementById('brandOptions');
  element.value = item.brand;

  var element = document.getElementById('categoryOptions');
  element.value = item.category;

  Session.setTemp("itemQuantity", item.quantity);

  var serialNoAffected = [];

  Session.setTemp("serialNoAffected", serialNoAffected);

  $('#serialNo').selectize({
      plugins: ['remove_button'],
      delimiter: ',',
      persist: false,
      create: function(input) {
          return {
              value: input,
              text: input
          }
      },
      onItemAdd: function (value) {
          Session.setTemp("itemQuantity", Session.get("itemQuantity") + 1);
          
          var serialNoObject = new Object();
          serialNoObject.serialNo = value;
          serialNoObject.action = "added";

          var serialNoAffected = Session.get("serialNoAffected");
          serialNoAffected.push(serialNoObject);

          Session.setTemp("serialNoAffected", serialNoAffected);
      },
      onItemRemove: function (value) {
          Session.setTemp("itemQuantity", Session.get("itemQuantity") - 1);

          var serialNoObject = new Object();
          serialNoObject.serialNo = value;
          serialNoObject.action = "removed";

          var serialNoAffected = Session.get("serialNoAffected");
          serialNoAffected.push(serialNoObject);

          Session.setTemp("serialNoAffected", serialNoAffected);
      }
  });

  $('.selectize-input').css('padding','4px 8px 4px 8px');
  $('.selectize-control').css('margin-top','10px');
  $('.selectize-control').css('margin-bottom','5px');
  $('.selectize-control').css('padding','0px');
}

Template.editInventoryItem.helpers({
  itemInfo: function () {
    return Inventory.findOne({_id: Router.current().params._id});
  },
  itemDuplicate: function() {
  	return Session.get('itemDuplicate');
  },
  itemStatus: function() {
  	if(Session.get('itemDuplicate')) {
  		return "red";
  	}
  },
  emailDuplicate: function() {
  	return Session.get('emailDuplicate');
  },
  emailStatus: function() {
  	if(Session.get('emailDuplicate')) {
  		return "red";
  	}
  },
  serialNo: function() {
    var inventoryItem = Inventory.findOne({_id: Router.current().params._id});
    var serialNoObject = inventoryItem.serialNo;
    var serialNoArray = [];
    for (var i in serialNoObject) {
        serialNoArray.push(serialNoObject[i]['serialNo']);
    }
    var serialNoString = serialNoArray.join(",");
    return serialNoString;
  },
  itemQuantity: function() {
    return Session.get("itemQuantity");
  },
  brandOptions: function() {
      var brands = _.uniq(Brands.find({}, {
          sort: {name: 1}, fields: {name: true}
      }).fetch().map(function(x) {
          return x.name;
      }), true);

      return brands;
  }, 
  categoryOptions: function() {
      var categories = _.uniq(Categories.find({}, {
          sort: {name: 1}, fields: {name: true}
      }).fetch().map(function(x) {
          return x.name;
      }), true);

      return categories;
  }, 
});

Template.editInventoryItem.events({
	'keyup #item': function(e) {
		var item = Inventory.findOne({item: $("#item").val()});
		
	    if(typeof item == 'undefined') {
	    	Session.clear('itemDuplicate');
	    }
	    else {
	    	if($("#item").val() != Session.get("currentItemName")) 
	    		Session.setTemp('itemDuplicate', true);
	    	else
	    		Session.clear('itemDuplicate');
	    }
  	},
    'change #categoryOptions': function(e) {
      if($("#categoryOptions").val() == "addCategory") {
        $("#categoryOptions").css("display", "none");
        $("#newCategory").css("display", "block");
        $("#undoAddCategory").css("display", "inline");
        document.getElementById("newCategory").focus();
      } 
    },
    'click #undoAddCategory': function(e) {
      e.preventDefault(); 
      $("#categoryOptions").css("display", "block");
      $("#newCategory").css("display", "none");
      $("#undoAddCategory").css("display", "none");
      
      var element = document.getElementById('categoryOptions');
      element.value = Session.get("inventoryItem")['category'];
    },
    'change #brandOptions': function(e) {
      if($("#brandOptions").val() == "addBrand") {
        $("#brandOptions").css("display", "none");
        $("#newBrand").css("display", "block");
        $("#undoAddBrand").css("display", "inline");
        document.getElementById("newBrand").focus();
      } 
    },
    'click #undoAddBrand': function(e) {
      e.preventDefault(); 
      $("#brandOptions").css("display", "block");
      $("#newBrand").css("display", "none");
      $("#undoAddBrand").css("display", "none");
      
      var element = document.getElementById('brandOptions');
      element.value = Session.get("inventoryItem")['brand'];
    },
  	'click [data-action="showDeleteConfirm"]': function(event, template) {
		IonPopup.confirm({
		  title: 'Delete Item',
		  template: 'Are you <strong>really</strong> sure?',
		  onOk: function() {

		    Meteor.call('deleteInventoryItem', Router.current().params._id, function(error, result) {
	  			Router.go('items'); 
		    });
		  },
		  onCancel: function() {
		  }
		});
	},
  	'submit form': function(e) {
	    e.preventDefault();  

      if($("#brandOptions").val() == "addBrand") {
        var brand = $("#newBrand").val();
      } else if($("#brand").val() != undefined) {
        var brand = $("#brand").val();
      } else {
        var brand = $("#brandOptions").val();
      }

      brand = brand.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

      if($("#categoryOptions").val() == "addCategory") {
        var category = $("#newCategory").val();
      } else if($("#category").val() != undefined) {
        var category = $("#category").val();
      } else {
        var category = $("#categoryOptions").val();
      }

      category = category.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});

	    var itemAttributes = {
          _id: Router.current().params._id,
	    	  item: $("#item").val(),
          brand: brand,
	      	category: category,
	      	serialNo: $("#serialNo").val(),
          price: $("#price").val(),
          supplier: $("#supplier").val(),
          serialNoAffected: Session.get("serialNoAffected"),
	      	rate: $("#rate").val(),
          quantity: $("#quantity").val(),
          inventoryItem: Inventory.findOne({_id: Router.current().params._id}),
          updateType: "edit"
	    };

	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('updateInventoryItem', itemAttributes, function(error, result) {
	    });
  	}
});