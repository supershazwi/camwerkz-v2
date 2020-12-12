Template.addEquipmentToPrivilege.created = function () {
};

Template.addEquipmentToPrivilege.rendered = function () {
  $("#brands").css("display", "none");
  $(".customerPackages").css("display", "none");
  Session.setTemp('searchInventoryQuery', '');
  var equipmentIds = [];
  var booking = Bookings.findOne({_id: Router.current().params._id});
  for(x in booking.equipmentDetails[Session.get("bookingGroupClicked")].items) {
    equipmentIds.push(booking.equipmentDetails[Session.get("bookingGroupClicked")].items[x].itemId);
  }
  var newIds = [];
  Session.setTemp("newAddedArray", newIds);
  Session.setTemp("equipmentArray", equipmentIds);
  Session.setTemp("originalEquipmentArray", equipmentIds);
};

Tracker.autorun(function() {
  if (Session.get('searchInventoryQuery')) {
    Meteor.subscribe('inventorySearch', Session.get('searchInventoryQuery'));
  }
});

Template.addEquipmentToPrivilege.events({
  'click #addItems': function(e) {
    document.getElementById("addItems").disabled = true;
    console.log("ADDED");
    var itemAttributes = {
        _id: Router.current().params._id,
        id: Session.get("bookingGroupClicked"),
        equipmentArray: Session.get("newAddedArray")
    };

    Meteor.call('addBulkItems', itemAttributes, function(error, result) {
      if(result == "OK") {
        Router.go('bookings.show', {_id: Router.current().params._id}, {});
      }
    }); 
  },
  'click .item-checkbox': function(e) {
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var newAddedArray = Session.get("newAddedArray");
        var equipmentArray = Session.get('equipmentArray');
        equipmentArray.push(e.currentTarget.id);
        newAddedArray.push(e.currentTarget.id);
        Session.setTemp("newAddedArray", newAddedArray);
        Session.setTemp("equipmentArray", equipmentArray);
      } else {
        var newAddedArray = Session.get("newAddedArray");
        if(newAddedArray.indexOf(e.currentTarget.id) != -1) {
          newAddedArray.splice(newAddedArray.indexOf(e.currentTarget.id), 1);
        }
        Session.setTemp("newAddedArray", newAddedArray);
        var equipmentArray = Session.get('equipmentArray');
        if(equipmentArray.indexOf(e.currentTarget.id) != -1) {
          equipmentArray.splice(equipmentArray.indexOf(e.currentTarget.id), 1);
        }
        Session.setTemp("equipmentArray", equipmentArray);

          var booking = Bookings.findOne({_id: Router.current().params._id});
          var groupCounter;
          for(x in booking.equipmentDetails[Session.get("bookingGroupClicked")].items) {
            if(booking.equipmentDetails[Session.get("bookingGroupClicked")].items[x].itemId == e.currentTarget.id) {
              groupCounter = booking.equipmentDetails[Session.get("bookingGroupClicked")].items[x].groupCounter;
              break;
            }
          }

          var attributes = {
              _id: Router.current().params._id,
              id: Session.get("bookingGroupClicked")+"_"+e.currentTarget.id+"_"+groupCounter
          };

          Meteor.call('removeBookingItem', attributes, function(error, result) {
          });
      }
    }
  },
  'keyup input': function (event, template) {
    Session.setTemp('searchInventoryQuery', event.target.value);

    if(event.target.value == "") {
      if(Session.get('currentStep') == 'equipments') {
        $(".categories").css("display", "none");
        $(".custom").css("display", "none");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "");
        $(".customerPackages").css("display", "none");
      } else if (Session.get('currentStep') == 'brands') {
        $(".categories").css("display", "none");
        $(".custom").css("display", "none");
        $(".brands").css("display", "");
        $(".equipments").css("display", "none");
        $(".customerPackages").css("display", "none");
      } else if (Session.get('currentStep') == 'customerPackages') { 
        $(".categories").css("display", "none");
        $(".custom").css("display", "none");
        $(".brands").css("display", "none");
        $(".equipments").css("display", "none");  
        $(".customerPackages").css("display", "");
      } else {
        $(".categories").css("display", "");
        $(".custom").css("display", "");
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
    
    console.log(event.target.id);

    if(event.target.id == "Custom") {

      var booking = Bookings.findOne({_id: Router.current().params._id});
      var groupCounter = booking.equipmentDetails[Session.get("bookingGroupClicked")].items.length;

      var itemAttributes = {
          _id: Router.current().params._id,
          id: Session.get("bookingGroupClicked")+"_"+event.target.id+"_"+groupCounter,
          item: "",
          groupCounter: groupCounter,
          category: "",
          days: 0,
          subAmount: 0,
          unclashableSerialNumbers: [],
          clashableSerialNumbers: [],
          availability: "in",
          brand: "",
          originalPriced: 0,
          discountPriced: 0,
          discount: 0,
          booked: 0,
          rate: 0,
          total: -1,
          itemId: -1,
          status: "N/A",
          clash: false,
          check: false
      };

      Meteor.call('addBookingItem', itemAttributes, function(error, result) {
        Router.go('bookings.show', {_id: Router.current().params._id}, {});
      });      
    } else {
      Meteor.call('clickCategory', event.target.id, function(error, result) {

        Session.setTemp('distinctBrands', result);

        $(".categories").css("display", "none");
        $(".custom").css("display", "none");
        $(".brands").css("display", "");
        $(".equipments").css("display", "none");
        $(".customerPackages").css("display", "none");
      });
    }
  },
  'click .brand': function(event, template) {
    Session.setTemp('customerPackageBrand', event.target.id);
    Session.setTemp('currentStep', 'equipments');
    $(".categories").css("display", "none");
    $(".custom").css("display", "none");
    $(".brands").css("display", "none");
    $(".customerPackages").css("display", "none");
    $(".equipments").css("display", "");
  },
  'click .equipment': function(event, template) {

    var item = Inventory.findOne({_id: event.target.id});

    var booking = Bookings.findOne({_id: Router.current().params._id});
    var groupCounter = booking.equipmentDetails[Session.get("bookingGroupClicked")].items.length;

    var itemAttributes = {
        _id: Router.current().params._id,
        id: Session.get("bookingGroupClicked")+"_"+event.target.id,
        item: item['item'],
        groupCounter: groupCounter,
        category: item['category'],
        days: 0,
        subAmount: 0,
        unclashableSerialNumbers: [],
        clashableSerialNumbers: [],
        availability: "in",
        brand: item['brand'],
        originalPriced: 0,
        discountPriced: 0,
        discount: 0,
        booked: 0,
        rate: item['rate'],
        total: item['bookableQuantity'],
        itemId: item['_id'],
        status: "N/A",
        clash: false,
        check: false
    };

    var customerPackages = CustomerPackages.find({items: {$elemMatch: {id: event.target.id}}}).fetch();
    
    //there's a customer package, prompt user which package to select
    if(customerPackages.length > 0) {
      console.log("OUT HERE");
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
      

      Meteor.call('addBookingItem', itemAttributes, function(error, result) {
        Router.go('bookings.show', {_id: Router.current().params._id}, {});
      });
    }
  },
  'click .customerPackage': function(event, template) {
    IonModal.close();
    IonKeyboard.close();

    var itemAttributes = Session.get("itemAttributes");
    if(event.target.id != "nil")
      itemAttributes.packageClicked = event.target.id;

    

    Meteor.call('addBookingItem', itemAttributes, function(error, result) {
      Router.go('bookings.show', {_id: Router.current().params._id}, {});
    });
  },
  'click #backButton': function(event, template) {
    if(Session.get('currentStep') == 'equipments') {
      $(".custom").css("display", "none");
      $(".categories").css("display", "none");
      $(".brands").css("display", "");
      $(".equipments").css("display", "none"); 
      $(".customerPackages").css("display", "none");
      Session.setTemp('currentStep', 'brands');
    } else if(Session.get('currentStep') == 'brands') {
      $(".categories").css("display", "");
      $(".custom").css("display", "");
      $(".brands").css("display", "none");
      $(".equipments").css("display", "none"); 
      $(".customerPackages").css("display", "none");  
      Session.clear('currentStep'); 
    } else if(Session.get('currentStep') == 'customerPackages') {
      $(".categories").css("display", "none");
      $(".custom").css("display", "none");
      $(".brands").css("display", "none");
      $(".equipments").css("display", ""); 
      $(".customerPackages").css("display", "none");
      Session.setTemp('currentStep', 'equipments');
    }
  }
});

Template.addEquipmentToPrivilege.helpers({
  checkboxChecked: function() {
    if(Session.get("equipmentArray").indexOf(this._id) != -1) {
      return true;
    } else {
      return false;
    }
  },
  items: function() {
    if((Session.get("equipmentArray").length > 0)) {
      var equipmentObjects = [];
      equipmentObjects = Inventory.find({_id: {$in: Session.get("equipmentArray")}});

      return equipmentObjects;
    }
  },
  itemsExist: function() {
    return (Session.get("equipmentArray").length > 0);
  },
  previousStepExists: function() {
    return (Session.get('currentStep') != undefined);
  },
  previousStep: function() {
    if(Session.get("currentStep") == 'equipments') {
      return "Brands";
    } else if(Session.get("currentStep") == 'customerPackages') {
      return "Equipments";
    } else if(Session.get("currentStep") == 'brands') {
      return "Categories"; 
    }
  },
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
      return equipmentList;
    }
  }
});