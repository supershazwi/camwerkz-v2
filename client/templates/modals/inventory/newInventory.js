Template.newInventory.rendered = function() {

  Session.setTemp("itemQuantity", 0);
  Session.clear("brandDuplicate");
  Session.clear("categoryDuplicate");
  Session.clear("itemDuplicate")

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
      onItemAdd: function () {
          Session.setTemp("itemQuantity", Session.get("itemQuantity") + 1);
      },
      onItemRemove: function () {
          Session.setTemp("itemQuantity", Session.get("itemQuantity") - 1);
      }
  });

  $('.selectize-input').css('padding','4px 8px 4px 8px');
  $('.selectize-control').css('margin-top','10px');
  $('.selectize-control').css('margin-bottom','5px');
  $('.selectize-control').css('padding','0px');
}

AutoForm.hooks({
  'inventory-new-form': {
    onSuccess: function (operation, result, template) {
      IonModal.close();
      IonKeyboard.close();
      Router.go('inventory.show', {_id: result});
    }
  }
});

Template.newInventory.events({
	'keyup #item': function(e) {
		var item = Inventory.findOne({item: $("#item").val()});
	    if(typeof item == 'undefined') {
	    	Session.clear('itemDuplicate');
	    }
	    else {
	    	Session.setTemp('itemDuplicate', true);
	    }
  	},
    'keyup #newBrand': function(e) {
      var brand = Brands.findOne({name: $("#newBrand").val()});
      if(typeof brand == 'undefined') {
        Session.clear('brandDuplicate');
      }
      else {
        Session.setTemp('brandDuplicate', true);
      }
    },
    'keyup #newCategory': function(e) {
      var category = Categories.findOne({name: $("#newCategory").val()});
      if(typeof category == 'undefined') {
        Session.clear('categoryDuplicate');
      }
      else {
        Session.setTemp('categoryDuplicate', true);
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
      document.getElementById("categoryOptions").selectedIndex = "0";
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
      document.getElementById("brandOptions").selectedIndex = "0";
    },
  	'submit form': function(e) {
      console.log("Inside submit form");
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
	    	  item: $("#item").val(),
          brand: brand,
	      	category: category,
          supplier: $("#supplier").val(),
          price: $("#price").val(),
	      	serialNo: $("#serialNo").val(),
	      	rate: $("#rate").val(),
          quantity: $("#quantity").val(),
          bookableQuantity: parseInt($("#quantity").val())
	    };

	    IonModal.close();
    	IonKeyboard.close();

	    Meteor.call('addInventoryItem', itemAttributes, function(error, result) {
	    });
  	}
});

Template.newInventory.helpers({
  isDisabled: function() {
    if(Session.get("brandDuplicate") || Session.get("categoryDuplicate") || Session.get("itemDuplicate")) {
      return "disabled";
    }
  },
  categorySelect: function() {
    if(Router.current().options.route._path == "/inventory") {
      return false;
    } else {
      return true;
    }
  },
  brandSelect: function() {
    if(Router.current().options.route._path == "/inventory") {
      return false;
    } else if(Router.current().options.route._path == "/brands") {
      return false;
    } else {
      return true;
    }
  },
  itemDuplicate: function() {
  	return Session.get('itemDuplicate');
  },
  itemStatus: function() {
  	if(Session.get('itemDuplicate')) {
  		return "red";
  	}
  },
  brandDuplicate: function() {
    console.log(Session.get('brandDuplicate'));
    return Session.get('brandDuplicate');
  },
  brandStatus: function() {
    if(Session.get('brandDuplicate')) {
      return "red";
    }
  },
  categoryDuplicate: function() {
    return Session.get('categoryDuplicate');
  },
  categoryStatus: function() {
    if(Session.get('categoryDuplicate')) {
      return "red";
    }
  },
  itemQuantity: function() {
    return Session.get("itemQuantity");
  },
  emailDuplicate: function() {
  	return Session.get('emailDuplicate');
  },
  emailStatus: function() {
  	if(Session.get('emailDuplicate')) {
  		return "red";
  	}
  },
  category: function() {

    return Session.get('category');
  },
  brand: function() {
    return Session.get('brand');
  },
  brandOptions: function() {
    if(Router.current().options.route._path == "/inventory") {
      var brands = _.uniq(Brands.find({}, {
          sort: {name: 1}, fields: {name: true}
      }).fetch().map(function(x) {
          return x.name;
      }), true);

      return brands;
    } else if(Router.current().options.route._path == "/brands") {
      var brands = _.uniq(Brands.find({category: Session.get('category')}, {
          sort: {name: 1}, fields: {name: true}
      }).fetch().map(function(x) {
          return x.name;
      }), true);

      return brands;
    } else {
      return Session.get('brand');
    }
  }, 
  categoryOptions: function() {
    if(Router.current().options.route._path == "/inventory") {
      var categories = _.uniq(Categories.find({}, {
          sort: {name: 1}, fields: {name: true}
      }).fetch().map(function(x) {
          return x.name;
      }), true);

      return categories;
    } else {
      return Session.get('category');
    }
  }
});