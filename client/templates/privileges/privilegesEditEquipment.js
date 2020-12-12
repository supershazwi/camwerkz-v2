Template.privilegesEditEquipment.created = function () {
  Meteor.subscribe('categories');
  Meteor.subscribe('brands');
};

Template.privilegesEditEquipment.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
  $(".brands").css("display", "none");
  $(".customerPackages").css("display", "none");
  Session.setTemp('equipmentArray', Privileges.findOne({_id: Router.current().params._id}).equipments);
};

Tracker.autorun(function() {
  if (Session.get('searchInventoryQuery')) {
    Meteor.subscribe('inventorySearch', Session.get('searchInventoryQuery'));
  }
});

Template.privilegesEditEquipment.events({
  'click .item-checkbox': function(e) {
    console.log(e.target.localName);
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var equipmentArray = Session.get('equipmentArray');
        var str = e.currentTarget.id.split("_");
        if(str[0] == "all") {
          var inventory = Inventory.find({brand: str[1], category: str[2]}).fetch();
          for(x in inventory) {
            if(equipmentArray.indexOf(inventory[x]._id) == -1) {
              equipmentArray.push(inventory[x]._id);
            }
          }
        } else {
          equipmentArray.push(e.currentTarget.id); 
          var inventory = Inventory.find({brand: Session.get('customerPackageBrand'), category: Session.get('customerPackageCategory')}).fetch();
          var all = true;
          for(x in inventory) {
            if(equipmentArray.indexOf(inventory[x]._id) == -1) {
              all = false;
            }
          }
          if(all)
            document.getElementById("checkAll_"+Session.get('customerPackageBrand')+"_"+Session.get('customerPackageCategory')+"_Checkbox").checked = true;
        }
        Session.setTemp('equipmentArray', equipmentArray);
      } else {
        document.getElementById("checkAll_"+Session.get('customerPackageBrand')+"_"+Session.get('customerPackageCategory')+"_Checkbox").checked = false;
        if(Session.get('equipmentArray').indexOf(e.currentTarget.id) != -1) {
          var equipmentArray = Session.get('equipmentArray');
          for(x in equipmentArray) {
            if(equipmentArray[x] == e.currentTarget.id) {
              equipmentArray.splice(x, 1);
              Session.setTemp('equipmentArray', equipmentArray);
            }
          }
        }
      }
    }
  },
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
  'click .addAllCategory': function(event, template) {
     var attr = new Object();
     attr._id = Router.current().params._id;
     attr.category = event.target.id.substr(6);
     Meteor.call('addAllCategory', attr, function(error, result) { 
        IonModal.close();
        IonKeyboard.close();
     });
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
    
    // check whether all equipments are selected
    var inventory = Inventory.find({brand: Session.get('customerPackageBrand'), category: Session.get('customerPackageCategory')}).fetch();
    var allSelected = true;
    for(x in inventory) {
      if(Session.get("equipmentArray").indexOf(inventory[x]._id) == -1) {
        allSelected = false;
      }
    }
      
    console.log(Session.get('customerPackageBrand'));
    console.log(Session.get('customerPackageCategory'));

    // if(allSelected == true) {
    //   document.getElementById("checkAll_"+Session.get('customerPackageBrand')+"_"+Session.get('customerPackageCategory')+"_Checkbox").checked = true;
    // } else {
    //   document.getElementById("checkAll_"+Session.get('customerPackageBrand')+"_"+Session.get('customerPackageCategory')+"_Checkbox").checked = false;
    // }
    
    $(".categories").css("display", "none");
    $(".brands").css("display", "none");
    $(".customerPackages").css("display", "none");
    $(".equipments").css("display", "");
  },
  
  'click .customerPackage': function(event, template) {
    IonModal.close();
    IonKeyboard.close();

    var itemAttributes = Session.get("itemAttributes");
    itemAttributes.packageClicked = event.target.id;

    Meteor.call('privilegesEditEquipment', itemAttributes, function(error, result) {
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
  },
  'click #addAllEquipments': function() {
    
    var attr = new Object();
    attr._id = Router.current().params._id;
    attr.equipments = [];
    attr.type = "all";
    
    //equipment array must contain all IDs of equipments
    var inventories = Inventory.find({}).fetch();
    for(x in inventories) {
      attr.equipments.push(inventories[x]._id);
    }
    
    IonModal.close();
    IonKeyboard.close();
    
    Meteor.call('privilegesEditEquipment', attr, function(error, result) {
    });
  },
  'click #submit': function(e) {
    var attr = new Object();
    attr._id = Router.current().params._id;
    attr.equipments = Session.get("equipmentArray");
    attr.type = "notAll";

    Meteor.call('privilegesEditEquipment', attr, function(error, result) {
    });
  }
});

Template.privilegesEditEquipment.helpers({
  categoryClicked: function() {
    return Session.get('customerPackageCategory');
  },
  brandClicked: function() {
    return Session.get('customerPackageBrand');
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
  search: function() {
    if(Session.get("searchInventoryQuery") != "") {
      return false;
    } else {
      return true;
    }
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
  },
  checkboxChecked: function() {
    if(Session.get("equipmentArray").indexOf(this._id) != -1) {
      return true;
    } else {
      return false;
    }
  }
});
