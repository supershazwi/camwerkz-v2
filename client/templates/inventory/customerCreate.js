Template.customersCreate.created = function() {
  this.subscribe('customerUpdate', "0");
  Meteor.call('resetCustomerUpdate');
};

var hello;

Template.customersCreate.rendered = function() {
  Meteor.subscribe('bookings');
  Session.setTemp("firstNameMax", false);
  Session.setTemp("lastNameMax", false);
  Session.setTemp("middleNameMax", false);
  Session.setTemp("emailMax", false);
  Session.setTemp("contactMax", false);

  this.autorun(function () {

    if(Session.get("check") == true) {
      hello = Meteor.setInterval(function () {
        console.log("check");
        if(CustomerUpdates.findOne({customerId: "0"}).status == "OK" && CustomerUpdates.findOne({customerId: "0"}).route != undefined) {
          Session.setTemp("check", false);
          Meteor.clearInterval(hello);
          Router.go("customers.show", {_id: CustomerUpdates.findOne({customerId: "0"}).route});
        }
      }, 200);
    }

  }.bind(this));
};

Template.customersCreate.destroyed = function() {
  Meteor.clearInterval(hello);
};

AutoForm.hooks({
  'customers-new-form': {
    onSuccess: function (operation, result, template) {
      IonModal.close();
      IonKeyboard.close();
      Router.go('customers.show', {_id: result});
    }
  }
});

Template.customersCreate.events({
  'keyup #name': function(e) {
    var name = $("#name").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
    var customer = Customers.findOne({name: name});
      if(typeof customer == 'undefined') {
        Session.clear('nameDuplicate');
      }
      else {
        Session.setTemp('nameDuplicate', true);
      }
    },
    'keyup #firstName': function(e) {

      if($("#firstName").val().length == 25) {
        Session.setTemp("firstNameMax", true);
      } else {
        Session.clear("firstNameMax");
      }
      document.getElementById("name").value = $("#firstName").val() + " " + $("#middleName").val() + " " + $("#lastName").val();
    },
    'keyup #lastName': function(e) {

      if($("#lastName").val().length == 25) {
        Session.setTemp("lastNameMax", true);
      } else {
        Session.clear("lastNameMax");
      }
      document.getElementById("name").value = $("#firstName").val() + " " + $("#middleName").val() + " " + $("#lastName").val();
    },
    'keyup #middleName': function(e) {

      if($("#middleName").val().length == 25) {




        Session.setTemp("middleNameMax", true);
      } else {
        Session.clear("middleNameMax");
      }
      document.getElementById("name").value = $("#firstName").val() + " " + $("#middleName").val() + " " + $("#lastName").val();
    },
    'keyup #email': function(e) {
      if($("#email").val().length == 100) {
        Session.setTemp("emailMax", true);
      } else {
      Session.clear("emailMax");
    }
    var email = $("#email").val().toLowerCase();
    var customer = Customers.findOne({email: email});
      if(typeof customer == 'undefined') {
        Session.clear('emailDuplicate');
      }
      else {
        Session.setTemp('emailDuplicate', true);
      }
    },
    'keyup #contact': function(e) {
      if($("#contact").val().length == 21) {
        Session.setTemp("contactMax", true);
      } else {
      Session.clear("contactMax");
    }
    },
    'click #addNewCustomer': function(e) {
      e.preventDefault();  
      var firstName = $("#firstName").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
      var middleName = $("#middleName").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
      var lastName = $("#lastName").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
      var company = $("#company").val().replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()});
     var email = $("#email").val().toLowerCase();
     var address = $("#address").val();
     var ic = $("#ic").val().toUpperCase();

     var name = "";
        if(firstName.length > 0) {
          name = name.concat(firstName);
        } 
        if(middleName.length > 0) {
          name = name.concat(" " + middleName);
        } 
        if(lastName.length > 0) {
          name = name.concat(" " + lastName);
        } 

      var customerAttributes = {
          name: name,
          firstName: firstName,
          middleName: middleName,
          lastName: lastName,
          email: email,
          ic: ic,
          company: company,
          address: address,
          noOfBookings: 0,
          totalValue: 0,
          contact: $("#contact").val()
      };

      IonModal.close();
      IonKeyboard.close();
        
      // Meteor.call('addCustomer', customerAttributes, function(error, result) {
      // });

      Session.setTemp("check", true);
      Meteor.call('addQuickbooksCustomer', customerAttributes, function(error, result) {

        console.log("inside addQuickbooksCustomer");
        console.log(result);

        // Meteor.call("checkCustomerNeedingUpdate", result);
        Router.go('customers.show', {_id: result});
      });
      
    },
    
    'click [data-action="showConfirm"]': function(event, template) {
      
      event.preventDefault();

      IonPopup.confirm({
        title: 'Add All QuickBooks Customers',
        template: 'Are you <strong>really</strong> sure?',
        onOk: function() {
          Meteor.call('syncinvoices', function(error, result) {
            IonModal.close();
            IonKeyboard.close();

            // IonPopup.alert({title: 'Printers', template: 'hello'});
            // console.log(result);
          });
        },
        onCancel: function() {
        }
      });
    }
});

Template.customersCreate.helpers({
  ifnotok: function() {
    var status = CustomerUpdates.findOne({customerId: "0"}).status;

    if(status != "OK") {
      return "margin-top: 44px;";
    }
  },
  messageError: function() {
    return (CustomerUpdates.findOne({customerId: "0"}).status);
  },
  pending: function() {
    console.log('in pending');
    return (CustomerUpdates.findOne({customerId: "0"}).status == "Pending");
  },
  error: function() {
    return (CustomerUpdates.findOne({customerId: "0"}).status != "Pending" && CustomerUpdates.findOne({customerId: "0"}).status != "OK");
  },
  nameMax: function() {
    return Session.get("nameMax");
  },
  firstNameMax: function() {
    return Session.get("firstNameMax");
  },
  middleNameMax: function() {
    return Session.get("middleNameMax");
  },
  lastNameMax: function() {
    return Session.get("lastNameMax");
  },
  emailMax: function() {
    return Session.get("emailMax");

  },
  contactMax: function() {
    return Session.get("contactMax");

  },
  nameDuplicate: function() {
    return Session.get('nameDuplicate');
  },
  nameStatus: function() {
    if(Session.get('nameDuplicate')) {
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
  isDisabled:function() {
    if(Session.get("emailDuplicate") || Session.get("nameDuplicate")) {
      return "disabled";
    }
  }
});