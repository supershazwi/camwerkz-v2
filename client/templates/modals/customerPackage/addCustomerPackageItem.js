Template.addCustomerPackageItem.created = function () {
  this.autorun(function () {
    this.subscription = Meteor.subscribe('inventories');
    this.subscription = Meteor.subscribe('categories');
    this.subscription = Meteor.subscribe('brands');
  }.bind(this));
};

Template.addCustomerPackageItem.rendered = function () {
  
  Session.setTemp('searchInventoryQuery', '');
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  $(".brands").css("display", "none");
  this.autorun(function () {
    if (!this.subscription.ready()) {
      IonLoading.show();
    } else {
      IonLoading.hide();
    }
  }.bind(this));
};

Tracker.autorun(function() {
  if (Session.get('searchInventoryQuery')) {
    Meteor.subscribe('inventorySearch', Session.get('searchInventoryQuery'));
  }
});

Template.addCustomerPackageItem.events({
  'keyup input': function (event, template) {
    Session.setTemp('searchInventoryQuery', event.target.value);

    if(event.target.value == "") {
      if(Session.get('currentStep') == 'equipments') {
        $(".categories").css("display", "none");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "");
      } else if (Session.get('currentStep') == 'brands') {
        $(".categories").css("display", "none");
        $(".brands").css("display", "");
        $(".equipments").css("display", "none");
      } else {
        $(".categories").css("display", "");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "none");  
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
    });
  },
  'click .brand': function(event, template) {
    Session.setTemp('customerPackageBrand', event.target.id);
    Session.setTemp('currentStep', 'equipments');
    $(".categories").css("display", "none");
    $(".brands").css("display", "none");
    $(".equipments").css("display", "");
  },
  'click .equipment': function(event, template) {

    var item = Inventory.findOne({_id: event.target.id});

    var itemAttributes = {
        _id: Router.current().params._id,
        item: item['item'],
        brand: item['brand'],
        category: item['category'],
        rate: 0,
        quantity: 0,
        itemId: event.target.id
    };

    IonModal.close();
    IonKeyboard.close();

    Meteor.call('addCustomerPackageItem', itemAttributes, function(error, result) {
    });

  },
  'click #backButton': function(event, template) {
    if(Session.get('currentStep') == 'equipments') {
      $(".categories").css("display", "none");
      $(".brands").css("display", "");
      $(".equipments").css("display", "none"); 
      Session.setTemp('currentStep', 'brands');
    } else if(Session.get('currentStep') == 'brands') {
      $(".categories").css("display", "");
      $(".brands").css("display", "none");
      $(".equipments").css("display", "none"); 
      Session.clear('currentStep');    
    }
  }
});

Template.addCustomerPackageItem.helpers({
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
  brands: function() {
    if(Session.get("distinctBrands") == undefined) {
      var array = [];
      return array;
    } else {
      return Session.get("distinctBrands");
    }
  },
  equipments: function() {

    if(Session.get('searchInventoryQuery')) {
      var inventory = Inventory.search(Session.get('searchInventoryQuery'));

      if(inventory.count() > 0) {
        $(".categories").css("display", "none");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "");
      }

      return inventory;
    } else {
      var equipmentList = Inventory.find({category: Session.get("customerPackageCategory"), brand: Session.get("customerPackageBrand")}).fetch();

      return equipmentList;
    }
  }
});
