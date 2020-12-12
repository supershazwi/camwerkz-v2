Template.addIndividualToPrivilege.rendered = function() {
  Session.setTemp('searchCustomerQuery', '');
  Session.setTemp('customerArray', Privileges.findOne({_id: Router.current().params._id}).customerId);
  if(Customers.find().count() == Session.get('customerArray').length) {
    document.getElementById("checkAllCustomersCheckbox").checked = true;
  }
}

Tracker.autorun(function() {
  if (Session.get('searchCustomerQuery')) {
    Meteor.subscribe('customersSearch', Session.get('searchCustomerQuery'));
  }
});

Template.addIndividualToPrivilege.events({
  'keyup input': function (event, template) {
    Session.setTemp('searchCustomerQuery', event.target.value);
    if($("#searchCustomer").val() != "") {
      $("#checkAllCustomers").css('display', 'none');
    } else {
      $("#checkAllCustomers").css('display', 'block');
    }
  },

  'click a': function (event, template) {
    IonModal.close();
  },

  'click .item-checkbox': function(e) {
    if(e.target.localName == "input") {
      if(e.target.checked == true) { //check the radio checkbox to mark that i want to include an individual to a privilege
        var customerArray = Session.get('customerArray');
        
        if(e.currentTarget.id == "checkAllCustomers") { //select all customers
          customerArray = []; 
          var customers = Customers.find({}, {fields: {_id: 1}}).fetch();
          for (x in customers) {
            customerArray.push(customers[x]._id);
          }
        } else { //select individual customer
          customerArray.push(e.currentTarget.id);
          
          var all = true;
          var customers = Customers.find({}, {fields: {_id: 1}}).fetch();
          for(x in customers) {
            if(customerArray.indexOf(customers[x]._id) == -1) {
              all = false;
            }
          }
          if(all)
            document.getElementById("checkAllCustomersCheckbox").checked = true;
        }
        Session.setTemp('customerArray', customerArray); 
      } else { //uncheck the radio checkbox to mark that i do not want to include an individual to a privilege
        var customerArray = Session.get('customerArray');
        
        if(e.currentTarget.id == "checkAllCustomers") {
          customerArray = [];  
        } else {
          document.getElementById("checkAllCustomersCheckbox").checked = false;
          if(Session.get('customerArray').indexOf(e.currentTarget.id) != -1) {
            for(x in customerArray) {
              if(customerArray[x] == e.currentTarget.id) {
                customerArray.splice(x, 1);
              }
            } 
          }
        }
        Session.setTemp('customerArray', customerArray);
      }
    }
  },

  'click #submit': function(e) {
    var attr = new Object();
    attr._id = Router.current().params._id;
    attr.customerId = Session.get("customerArray");
    attr.privilege = Privileges.findOne({_id: Router.current().params._id});

    Meteor.call('addCustomerToPrivilege', attr, function(error, result) {
    });
  },
  'click #checkAllCustomers': function(e) {
    Meteor.call('addAllCustomersToPrivilege', Router.current().params._id, function(error, result) {
    });
  }
});

Template.addIndividualToPrivilege.helpers({
  customers: function() {
    return Customers.search(Session.get('searchCustomerQuery'));
  },
  searchCustomerQuery: function() {
    return Session.get('searchCustomerQuery');
  },
  checkboxChecked: function() {
    if(Session.get("customerArray").indexOf(this._id) != -1) {
      return true;
    } else {
      return false;
    }
  },
  allCustomersChecked: function() {
    return Privileges.findOne({_id: Router.current().params._id}).allCustomersChecked;
  },
  allEquipmentsChecked: function() {
    return Privileges.findOne({_id: Router.current().params._id}).allEquipmentsChecked;
  }
});
