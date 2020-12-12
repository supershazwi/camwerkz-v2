Template.addQuotationItem.created = function () {
  this.autorun(function () {
    this.subscription = Meteor.subscribe('inventories');
    this.subscription = Meteor.subscribe('categories');
    this.subscription = Meteor.subscribe('brands');
  }.bind(this));
};

Template.addQuotationItem.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  $("#brands").css("display", "none");
  $("#customerPackages").css("display", "none");
  this.autorun(function () {
    if (!this.subscription.ready()) {
      IonLoading.show();
    } else {
      IonLoading.hide();
      Session.clearTemp();
      Session.setTemp('searchInventoryQuery', '');
    }
  }.bind(this));
};

Tracker.autorun(function() {
  if (Session.get('searchInventoryQuery')) {
    Meteor.subscribe('inventorySearch', Session.get('searchInventoryQuery'));
  }
});

Template.addQuotationItem.events({
  'keyup input': function (event, template) {
    Session.setTemp('searchInventoryQuery', event.target.value);

    if(event.target.value == "") {
      if(Session.get('currentStep') == 'equipments') {
        $(".categories").css("display", "none");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "");
        $(".customerPackages").css("display", "none");
      } else if (Session.get('currentStep') == 'brands') {
        $(".categories").css("display", "none");
        $(".brands").css("display", "");
        $(".equipments").css("display", "none");
        $(".customerPackages").css("display", "none");
      } else if (Session.get('currentStep') == 'customerPackages') { 
        $(".categories").css("display", "none");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "none");  
        $(".customerPackages").css("display", "");
      } else {
        $(".categories").css("display", "");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "none");  
        $(".customerPackages").css("display", "none");
      }
    }
  },

  'click #close': function (event, template) {
    IonModal.close();
  },
  'click .category': function(event, template) {
    Session.setTemp('customerPackageCategory', event.target.id);
    Session.setTemp('currentStep', 'brands');
    
    Meteor.call('clickCategory', event.target.id, function(error, result) {

      Session.setTemp('distinctBrands', result);

      $(".categories").css("display", "none");
      $(".brands").css("display", "");
      $(".equipments").css("display", "none");
      $(".customerPackages").css("display", "none");
    });
  },
  'click .brand': function(event, template) {
    Session.setTemp('customerPackageBrand', event.target.id);
    Session.setTemp('currentStep', 'equipments');
    $(".categories").css("display", "none");
    $(".brands").css("display", "none");
    $(".customerPackages").css("display", "none");
    $(".equipments").css("display", "");
  },
  'click .equipment': function(event, template) {

    var item = Inventory.findOne({_id: event.target.id});

    var itemAttributes = {
        _id: Router.current().params._id,
        id: Session.get("quotationGroupClicked")+"_"+event.target.id,
        item: item['item'],
        category: item['category'],
        days: 0,
        subAmount: 0,
        availability: "in",
        originalPriced: 0,
        discountPriced: 0,
        discount: 0,
        booked: 0,
        rate: item['rate'],
        total: item['quantity'],
        itemId: item['_id'],
        status: "OK",
        clash: false,
        check: false
    };

    var customerPackages = CustomerPackages.find({items: {$elemMatch: {id: event.target.id}}}).fetch();
    
    //there's a customer package, prompt user which package to select
    if(customerPackages.length > 0) {
      Session.setTemp("itemAttributes", itemAttributes);
      Session.setTemp('currentStep', 'customerPackages');
      Session.setTemp('equipmentClicked', event.target.id);

      $(".categories").css("display", "none");
      $(".brands").css("display", "none");
      $(".equipments").css("display", "none");
      $(".customerPackages").css("display", "");
    } else {
      IonModal.close();
      IonKeyboard.close();

      Meteor.call('addQuotationItem', itemAttributes, function(error, result) {
      });
    }
  },
  'click .customerPackage': function(event, template) {
    IonModal.close();
    IonKeyboard.close();

    var itemAttributes = Session.get("itemAttributes");
    itemAttributes.packageClicked = event.target.id;

    Meteor.call('addQuotationItem', itemAttributes, function(error, result) {
    });
  },
  'click #backButton': function(event, template) {
    if(Session.get('currentStep') == 'equipments') {
      $(".categories").css("display", "none");
      $(".brands").css("display", "");
      $(".equipments").css("display", "none"); 
      $(".customerPackages").css("display", "none");
      Session.setTemp('currentStep', 'brands');
    } else if(Session.get('currentStep') == 'brands') {
      $(".categories").css("display", "");
      $(".brands").css("display", "none");
      $(".equipments").css("display", "none"); 
      $(".customerPackages").css("display", "none");  
      Session.clear('currentStep'); 
    } else if(Session.get('currentStep') == 'customerPackages') {
      $(".categories").css("display", "none");
      $(".brands").css("display", "none");
      $(".equipments").css("display", ""); 
      $(".customerPackages").css("display", "none");
      Session.setTemp('currentStep', 'equipments');
    }
  }
});

Template.addQuotationItem.helpers({
  searchInventoryQuery: function() {
    return Session.get('searchInventoryQuery');
  },
  categories: function () {
    var distinctCategories = _.uniq(Categories.find({}, {
        sort: {name: 1}, fields: {name: true}
    }).fetch().map(function(x) {
        return x.name;
    }), true);

    if(distinctCategories.length != 0) {
      if(distinctCategories.length % 2 == 0) { //number of distinctCategories is even
        var distinctCategoriesArray = []; 

        for (i = 0; i < distinctCategories.length; i++) { 
          if(i%2 == 0) {
            object = [];
            object.push(distinctCategories[i]);
          } else {
            object.push(distinctCategories[i]);
            distinctCategoriesArray.push(object);
          }
        }
      } else { //number of distinctCategories is odd
        var distinctCategoriesArray = []; 
        for (i = 0; i < distinctCategories.length; i++) { 
          if(i%2 == 0) {
            if(distinctCategories.length - 1 == i) {
              object = [];
              object.push(distinctCategories[i]);
              distinctCategoriesArray.push(object);
            } else {
              object = [];
              object.push(distinctCategories[i]);
            }
          } else {
            object.push(distinctCategories[i]);
            distinctCategoriesArray.push(object);
          }
        }
      }
    }

    return distinctCategoriesArray;
  },
  customerPackages: function () {
    
    var customerPackages = CustomerPackages.find({items: {$elemMatch: {id: Session.get("equipmentClicked")}}}, {
        sort: {name: 1}, fields: {name: true, items: true}
    }).fetch();

    if(customerPackages.length != 0) {
      var customerPackagesArray = [];
      for(x in customerPackages) {
        var obj = new Object();
        obj.name = customerPackages[x].name;
        obj.id = customerPackages[x]._id;
        for(y in customerPackages[x].items) {
          if(customerPackages[x].items[y].id == Session.get("equipmentClicked")) {
            obj.rate = customerPackages[x].items[y].rate;
            obj.quantity = customerPackages[x].items[y].quantity;
          }
        }

        customerPackagesArray.push(obj);
      }
    }

    if(customerPackagesArray.length % 2 == 0) { //even
      var array = [];
      var finalArray = [];
      for(x in customerPackagesArray) {
        if(x % 2 == 0) {
          array.push(customerPackagesArray[x]);
        } else {
          array.push(customerPackagesArray[x]);
          finalArray.push(array);
          array = [];
        }
      }
    } else { //odd
      var array = [];
      var finalArray = [];
      for(x in customerPackagesArray) {
        if(x % 2 == 0) {
          array.push(customerPackagesArray[x]);
          if((x+1) == customerPackagesArray.length) {
            finalArray.push(array);
          }
        } else {
          array.push(customerPackagesArray[x]);
          finalArray.push(array);
          array = [];
        }
      }
    }

    return finalArray;
  },
  brands: function() {
    if(Session.get("distinctBrands") == null) {
      var array = [];
      return array;
    } else {
      return Session.get("distinctBrands");
    }
  },
  rate: function() {
    return accounting.formatMoney(this.rate);
  },
  equipments: function() {

    if(Session.get('searchInventoryQuery')) {
      var inventory = Inventory.search(Session.get('searchInventoryQuery'));

      if(inventory.count() > 0) {
        $(".categories").css("display", "none");
        $(".customerPackages").css("display", "none");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "");
      }


      return inventory;
    } else {
      var equipmentList = Inventory.find({category: Session.get("customerPackageCategory"), brand: Session.get("customerPackageBrand")}).fetch();

      console.log(equipmentList);

      return equipmentList;
    }
  }
});
