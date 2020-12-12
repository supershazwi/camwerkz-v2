Template.bookingsAddBookingItems.created = function () {
  this.subscribe('inventories');
  this.subscribe('categories');
  this.subscribe('brands');
  this.subscribe('bookinggroupsByBooking', Router.current().params._id);
  this.subscribe('bookinglineitemsByBooking', Router.current().params._id);
};

Template.bookingsAddBookingItems.rendered = function () {
  var arr = [];
  Session.setTemp("removeItemsClicked", arr);
  $("#brands").css("display", "none");
  $(".customerPackages").css("display", "none");
  Session.setTemp('searchInventoryQuery', '');
  var equipmentIds = [];
  var bookingLineItems = BookingLineItems.find({invoiceId: Router.current().params._id, groupCounter: parseInt(Session.get("bookingGroupClicked"))}).fetch();
  for(x in bookingLineItems) {
    equipmentIds.push(bookingLineItems[x].itemId);
  }
  Session.setTemp("equipmentArray", equipmentIds);
  Session.setTemp("originalEquipmentArray", equipmentIds);
};

Tracker.autorun(function() {
  if (Session.get('searchInventoryQuery')) {
    Meteor.subscribe('inventorySearch', Session.get('searchInventoryQuery'));
  }
});

Template.bookingsAddBookingItems.events({
  'click #saveItems': function(e) {
    document.getElementById("saveItems").disabled = true;
    var itemAttributes = {
        _id: Router.current().params._id,
        id: Session.get("bookingGroupClicked"),
        equipmentArray: Session.get("equipmentArray")
    };

    var temp = Session.get("removeItemsClicked");
    var arr2 = [];
    for(x in temp) {
      arr2.push(BookingLineItems.findOne({groupCounter: parseInt(Session.get("bookingGroupClicked")), itemId: temp[x]}));
    }

    for(x in arr2) {
      var attributes = {
          _id: Router.current().params._id,
          id: arr2[x]._id
      };

      Meteor.call('removeBookingLineItem', attributes, function(error, result) {

        Meteor.call('removeAffectedItems', arr2[x]);

        Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        });
        Meteor.call("updateBookingStatus", Router.current().params._id);

        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " removed " + arr2[x].brand + " " + arr2[x].item + ".",
          universalContent: Meteor.user().username + " removed " + arr2[x].brand + " " + arr2[x].item + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      });
    }

    Meteor.call('saveBulkItems', itemAttributes, function(error, result) {
      Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      if(result == "OK") {
        Router.go('bookings.show', {_id: Router.current().params._id}, {});
      }
    });
  },
  'click #back': function(e) {
    Router.go('bookings.show', {_id: Router.current().params._id}, {});
  },
  'click .item-checkbox': function(e) {
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        if(Session.get("removeItemsClicked").indexOf(e.currentTarget.id)) {
          var temp = Session.get("removeItemsClicked");
          temp.splice(temp.indexOf(e.currentTarget.id));
          Session.setTemp("removeItemsClicked", temp);
        }
        var equipmentArray = Session.get('equipmentArray');
        equipmentArray.push(e.currentTarget.id);
        Session.setTemp("equipmentArray", equipmentArray);
      } else {

        var temp = Session.get("removeItemsClicked");
        temp.push(e.currentTarget.id);
        Session.setTemp("removeItemsClicked", temp);

        console.log("inside click item checkbox");
        console.log(e.currentTarget.id);

        // we want to find the booking line item  to delete and also to delete equipment calendar

        

        var equipmentArray = Session.get('equipmentArray');
        if(equipmentArray.indexOf(e.currentTarget.id) != -1) {
          equipmentArray.splice(equipmentArray.indexOf(e.currentTarget.id), 1);
        }
        Session.setTemp("equipmentArray", equipmentArray);
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

    var bookingGroup = BookingGroups.findOne({invoiceId: Router.current().params._id, groupId: parseInt(Session.get("bookingGroupClicked"))});

    if(event.target.id == "Custom") {

      var itemAttributes = {
          item: "",
          groupCounter: Session.get("bookingGroupClicked"),
          category: "Custom Item Rental",
          days: bookingGroup.noOfDates,
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
          invoiceId: Router.current().params._id,
          status: "N/A",
          clash: false,
          check: false,
          sortNumber: 13
      };

      Meteor.call('addCustomBookingLineItem', itemAttributes, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
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

    var category = item['category'];

    var sortNumber;

    if(category == "Studio Usage") {
      sortNumber = 0;
    } else if(category == "Cameras") {
      sortNumber = 1;
    } else if(category == "Electronics") {
      sortNumber = 2;
    } else if(category == "Monitors") {
      sortNumber = 3;
    } else if(category == "Accessories") {
      sortNumber = 4;
    } else if(category == "Batteries") {
      sortNumber = 5;
    } else if(category == "Cards") {
      sortNumber = 6;
    } else if(category == "Tripods") {
      sortNumber = 7;
    } else if(category == "Sound") {
      sortNumber = 8;
    } else if(category == "Lens") {
      sortNumber = 9;
    } else if(category == "Filters") {
      sortNumber = 10;
    } else if(category == "Lights") {
      sortNumber = 11;
    } else if(category == "Grips") {
      sortNumber = 12;
    } else {
      sortNumber = 13;
    }

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
        check: false,
        sortNumber: sortNumber
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

Template.bookingsAddBookingItems.helpers({
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
      equipmentObjects = Inventory.find({_id: {$in: Session.get("equipmentArray")}}).fetch();

      var accessories = [];
      var batteries = [];
      var cameras = [];
      var cards = [];
      var electronics = [];
      var filters = [];
      var grips = [];
      var lens = [];
      var lights = [];
      var monitors = [];
      var sound = [];
      var studio = [];
      var tripods = [];
      var custom = [];

      for(x in equipmentObjects) {
        if(equipmentObjects[x].category == "Studio Usage") {
          studio.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Cameras") {
          cameras.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Electronics") {
          electronics.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Monitors") {
          monitors.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Accessories") {
          accessories.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Batteries") {
          batteries.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Cards") {
          cards.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Tripods") {
          tripods.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Sound") {
          sound.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Lens") {
          lens.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Filters") {
          filters.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Lights") {
          lights.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Grips") {
          grips.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "") {
          custom.push(equipmentObjects[x]);
        }
        if(equipmentObjects[x].category == "Custom Item Rental") {
          custom.push(equipmentObjects[x]);
        }
      }

      equipmentObjects = [];

      if(studio.length > 0) {
        for(x in studio) {
          equipmentObjects.push(studio[x]);
        }
      }
      if(cameras.length > 0) {
        for(x in cameras) {
          equipmentObjects.push(cameras[x]);
        }
      }
      if(electronics.length > 0) {
        for(x in electronics) {
          equipmentObjects.push(electronics[x]);
        }
      }
      if(monitors.length > 0) {
        for(x in monitors) {
          equipmentObjects.push(monitors[x]);
        }
      }
      if(accessories.length > 0) {
        for(x in accessories) {
          equipmentObjects.push(accessories[x]);
        }
      }
      if(batteries.length > 0) {
        for(x in batteries) {
          equipmentObjects.push(batteries[x]);
        }
      }
      if(cards.length > 0) {
        for(x in cards) {
          equipmentObjects.push(cards[x]);
        }
      }
      if(tripods.length > 0) {
        for(x in tripods) {
          equipmentObjects.push(tripods[x]);
        }
      }
      if(sound.length > 0) {
        for(x in sound) {
          equipmentObjects.push(sound[x]);
        }
      }
      if(lens.length > 0) {
        for(x in lens) {
          equipmentObjects.push(lens[x]);
        }
      }
      if(filters.length > 0) {
        for(x in filters) {
          equipmentObjects.push(filters[x]);
        }
      }
      if(lights.length > 0) {
        for(x in lights) {
          equipmentObjects.push(lights[x]);
        }
      }
      if(grips.length > 0) {
        for(x in grips) {
          equipmentObjects.push(grips[x]);
        }
      }
      if(custom.length > 0) {
        for(x in custom) {
          equipmentObjects.push(custom[x]);
        }
      }

      return equipmentObjects;
    }
  },
  categoryBackground: function() {
    if(this.category == "Studio Usage") {
      return "#A68B6A";
    }
    if(this.category == "Cameras") {
      return "#B64926";
    }
    if(this.category == "Electronics") {
      return "#225378";
    }
    if(this.category == "Monitors") {
      return "#962D3E";
    }
    if(this.category == "Accessories") {
      return "#2A2C2B";
    }
    if(this.category == "Batteries") {
      return "#7E8AA2";
    }
    if(this.category == "Cards") {
      return "#9967C8";
    }
    if(this.category == "Tripods") {
      return "#723147";
    }
    if(this.category == "Sound") {
      return "#00A388";
    }
    if(this.category == "Lens") {
      return "#2185C5";
    }
    if(this.category == "Filters") {
      return "#FFDC00";
    }
    if(this.category == "Lights") {
      return "#FF9800";
    }
    if(this.category == "Grips") {
      return "#374140";
    }
  },
  addBrandBackground: function() {
    if(Session.get("customerPackageCategory") == "Studio Usage") {
      return "#A68B6A";
    }
    if(Session.get("customerPackageCategory") == "Cameras") {
      return "#B64926";
    }
    if(Session.get("customerPackageCategory") == "Electronics") {
      return "#225378";
    }
    if(Session.get("customerPackageCategory") == "Monitors") {
      return "#962D3E";
    }
    if(Session.get("customerPackageCategory") == "Accessories") {
      return "#2A2C2B";
    }
    if(Session.get("customerPackageCategory") == "Batteries") {
      return "#7E8AA2";
    }
    if(Session.get("customerPackageCategory") == "Cards") {
      return "#9967C8";
    }
    if(Session.get("customerPackageCategory") == "Tripods") {
      return "#723147";
    }
    if(Session.get("customerPackageCategory") == "Sound") {
      return "#00A388";
    }
    if(Session.get("customerPackageCategory") == "Lens") {
      return "#2185C5";
    }
    if(Session.get("customerPackageCategory") == "Filters") {
      return "#FFDC00";
    }
    if(Session.get("customerPackageCategory") == "Lights") {
      return "#FF9800";
    }
    if(Session.get("customerPackageCategory") == "Grips") {
      return "#374140";
    }
  },
  addCategoryBackground: function() {
    if(this == "Studio Usage") {
      return "#A68B6A";
    }
    if(this == "Cameras") {
      return "#B64926";
    }
    if(this == "Electronics") {
      return "#225378";
    }
    if(this == "Monitors") {
      return "#962D3E";
    }
    if(this == "Accessories") {
      return "#2A2C2B";
    }
    if(this == "Batteries") {
      return "#7E8AA2";
    }
    if(this == "Cards") {
      return "#9967C8";
    }
    if(this == "Tripods") {
      return "#723147";
    }
    if(this == "Sound") {
      return "#00A388";
    }
    if(this == "Lens") {
      return "#2185C5";
    }
    if(this == "Filters") {
      return "#FFDC00";
    }
    if(this == "Lights") {
      return "#FF9800";
    }
    if(this == "Grips") {
      return "#374140";
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

    if(customerPackagesArray != undefined && customerPackagesArray.length % 2 == 0) { //even
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
      var equipmentList = Inventory.find({category: Session.get("customerPackageCategory"), brand: Session.get("customerPackageBrand")}, {sort: {item: 1}}).fetch();
      return equipmentList;
    }
  }
});