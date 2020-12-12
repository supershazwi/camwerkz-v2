Template.customersQuickbooksCreate.rendered = function() {
  Session.setTemp("disabled", true);
};

Tracker.autorun(function() {
  if (Session.get('searchCustomerQuickbooksQuery')) {
    Meteor.subscribe('customerQuickbooksSearch', Session.get('searchCustomerQuickbooksQuery'));

    Meteor.subscribe('customerByQuickbooks', Session.get('searchCustomerQuickbooksQuery'));

    if(Customers.quickbooksSearch(Session.get('searchCustomerQuickbooksQuery')) != undefined) {
      Session.setTemp("disabled", true);
    } else {
      Session.setTemp("disabled", false);
    }
  } 


});

Template.customersQuickbooksCreate.events({
    'click #addCustomerFromQuickbooks': function(e) {
      e.preventDefault();  

      Session.setTemp("disabled", true);

     var quickbooksId = $("#quickbooksId").val();


      Meteor.call('addCustomerFromQuickbooks', quickbooksId, function(error, result) {
        Meteor.setTimeout(function() {
          var customer = Customers.findOne({quickbooksId: quickbooksId});
          Router.go('customers.show', {_id: customer._id}, {});
        }
          , 5000);
     });
  

    },
    'keyup #quickbooksId': function (event, template) {
      if(event.target.value.length != 0) {
        var quickbooksId = $("#quickbooksId").val();
        Session.setTemp('searchCustomerQuickbooksQuery', quickbooksId);
      } else {
        Session.clear('searchCustomerQuickbooksQuery');
      }
    },
});

Template.customersQuickbooksCreate.helpers({
  isDisabled:function() {
    if(Session.get("disabled")==true) {
      return "disabled";
    }
  },
  searchCustomerQuickbooksQuery: function() {
    return Session.get('searchCustomerQuickbooksQuery');
  }
});