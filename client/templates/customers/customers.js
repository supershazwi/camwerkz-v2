Template.customers.created = function () {
  // Meteor.subscribe("customers");
};


Template.customers.destroyed = function () {
  Session.clear("companyClicked");
  Session.clear("nameClicked");
  Session.clear("numberClicked");
  Session.clear("addressClicked");
  Session.clear("emailClicked");
  Session.clear("qbIdClicked");

  Session.clear('searchCustomerQuery');
  Session.clear('searchCustomerNumberQuery');
  Session.clear('searchCustomerAddressQuery');
  Session.clear('searchCustomerEmailQuery');
  Session.clear('searchCustomerCompanyQuery');
  Session.clear('searchQBQuery');
};

Template.customers.rendered = function () {
  console.log(Customers.find().fetch());
  Session.setTemp("sortType", "sortByName");
  Session.setTemp("nameDirection", 1);
};

Tracker.autorun(function() {
  if (Session.get('searchCustomerQuery')) {
    Meteor.subscribe('customerSearch', Session.get('searchCustomerQuery'));
  }
  if (Session.get('searchCustomerNumberQuery')) {
    Meteor.subscribe('customerNumberSearch', Session.get('searchCustomerNumberQuery'));
  }
  if (Session.get('searchCustomerCompanyQuery')) {
    Meteor.subscribe('customerCompanySearch', Session.get('searchCustomerCompanyQuery'));
  }
  if (Session.get('searchCustomerAddressQuery')) {
    Meteor.subscribe('customerAddressSearch', Session.get('searchCustomerAddressQuery'));
  }
  if (Session.get('searchCustomerEmailQuery')) {
    Meteor.subscribe('customerEmailSearch', Session.get('searchCustomerEmailQuery'));
  }
});

Template.customers.helpers({
  nameClicked: function() {
    if(Session.get('nameClicked') != undefined) {
      return true;
    }
  },
  companyClicked: function() {
    if(Session.get('companyClicked') != undefined) {
      return true;
    }
  },
  numberClicked: function() {
    if(Session.get('numberClicked') != undefined) {
      return true;
    }
  },
  addressClicked: function() {
    if(Session.get('addressClicked') != undefined) {
      return true;
    }
  },
  emailClicked: function() {
    if(Session.get('emailClicked') != undefined) {
      return true;
    }
  },
  customers: function () {
    if(Session.get('searchCustomerQuery')) {
      return Customers.search(Session.get('searchCustomerQuery'));
    } 
    if(Session.get('searchCustomerNumberQuery')) {
      return Customers.numberSearch(Session.get('searchCustomerNumberQuery'));
    } 
    if(Session.get('searchCustomerCompanyQuery')) {
      return Customers.companySearch(Session.get('searchCustomerCompanyQuery'));
    } 
    if(Session.get('searchCustomerAddressQuery')) {
      return Customers.addressSearch(Session.get('searchCustomerAddressQuery'));
    } 
    if(Session.get('searchCustomerEmailQuery')) {
      return Customers.emailSearch(Session.get('searchCustomerEmailQuery'));
    } 
    // else if (Session.get("sortType") == "sortByName") {
      
    //   return Customers.find({}, {sort: {name: Session.get('nameDirection')}});
    // } else if(Session.get("sortType") == "sortByCompany") {
    //   return Customers.find({}, {sort: {company: Session.get('companyDirection')}});
    // } else if(Session.get("sortType") == "sortByTotalValue") {
    //   return Customers.find({}, {sort: {totalValue: Session.get('totalValueDirection')}});   
    // } else if(Session.get("sortType") == "sortByBalance") {
    //   return Customers.find({}, {sort: {balance: Session.get('balanceDirection')}});   
    // } else {
    //   return Customers.find({}, {sort: {noOfBookings: Session.get('noOfBookingsDirection')}});   
    // }
  },
  username: function() {
    return Meteor.user().username;
  },
  searchCustomerQuery: function() {
    return Session.get('searchCustomerQuery');
  },
  searchCustomerNumberQuery: function() {
    return Session.get('searchCustomerNumberQuery');
  },
  searchCustomerCompanyQuery: function() {
    return Session.get('searchCustomerCompanyQuery');
  },
  searchCustomerAddressQuery: function() {
    return Session.get('searchCustomerAddressQuery');
  },
  searchCustomerEmailQuery: function() {
    return Session.get('searchCustomerEmailQuery');
  },
  noInput: function() {
    return (Session.get("searchCustomerQuery") == undefined);
  }
});

Template.customers.events({
  'keyup #customerQuery': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerQuery', event.target.value);
    } else {
      Session.clear('searchCustomerQuery');
    }
  },
  'keyup #customerNumberQuery': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerNumberQuery', event.target.value);
    } else {
      Session.clear('searchCustomerNumberQuery');
    }
  },
  'keyup #customerCompanyQuery': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerCompanyQuery', event.target.value);
    } else {
      Session.clear('searchCustomerCompanyQuery');
    }
  },
  'keyup #customerAddressQuery': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerAddressQuery', event.target.value);
    } else {
      Session.clear('searchCustomerAddressQuery');
    }
  },
  'keyup #customerEmailQuery': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerEmailQuery', event.target.value);
    } else {
      Session.clear('searchCustomerEmailQuery');
    }
  },
  'click #hello': function(){
    
  },
  'click #sortName': function(e) {
    if(Session.get("nameDirection")) {
      if(Session.get("nameDirection") == 1) {
        Session.setTemp("nameDirection", -1);
      } else {
        Session.setTemp("nameDirection", 1);
      }
    } else {
      Session.setTemp("nameDirection", 1);
    }
    Session.setTemp("sortType", "sortByName");
    },
    'click #sortCompany': function(e) {
      if(Session.get("companyDirection")) {
        if(Session.get("companyDirection") == 1) {
          Session.setTemp("companyDirection", -1);
        } else {
          Session.setTemp("companyDirection", 1);
        }
      } else {
        Session.setTemp("companyDirection", 1);
      }
      Session.setTemp("sortType", "sortByCompany");
    },
    'click #totalValue': function(e) {
      if(Session.get("totalValueDirection")) {
        if(Session.get("totalValueDirection") == 1) {
          Session.setTemp("totalValueDirection", -1);
        } else {
          Session.setTemp("totalValueDirection", 1);
        }
      } else {
        Session.setTemp("totalValueDirection", 1);
      }
      Session.setTemp("sortType", "sortByTotalValue");
    },
    'click #balance': function(e) {
      if(Session.get("balanceDirection")) {
        if(Session.get("balanceDirection") == 1) {
          Session.setTemp("balanceDirection", -1);
        } else {
          Session.setTemp("balanceDirection", 1);
        }
      } else {
        Session.setTemp("balanceDirection", 1);
      }
      Session.setTemp("sortType", "sortByBalance");
    },
    'click #noOfBookings': function(e) {
      if(Session.get("noOfBookingsDirection")) {
        if(Session.get("noOfBookingsDirection") == 1) {
          Session.setTemp("noOfBookingsDirection", -1);
        } else {
          Session.setTemp("noOfBookingsDirection", 1);
        }
      } else {
        Session.setTemp("noOfBookingsDirection", 1);
      }
      Session.setTemp("sortType", "sortByNoOfBookings");
    },
    'click #name': function() {
      Session.setTemp("nameClicked", true);
      Session.clear("companyClicked");
      Session.clear("numberClicked");
      Session.clear("addressClicked");
      Session.clear("emailClicked");

      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchCustomerCompanyQuery');
    },
    'click #company': function() {
      Session.setTemp("companyClicked", true);
      Session.clear("nameClicked");
      Session.clear("numberClicked");
      Session.clear("addressClicked");
      Session.clear("emailClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerEmailQuery');
    },
    'click #number': function() {
      Session.setTemp("numberClicked", true);
      Session.clear("nameClicked");
      Session.clear("companyClicked");
      Session.clear("addressClicked");
      Session.clear("emailClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchCustomerCompanyQuery');
    },
    'click #address': function() {
      Session.setTemp("addressClicked", true);
      Session.clear("nameClicked");
      Session.clear("companyClicked");
      Session.clear("numberClicked");
      Session.clear("emailClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchCustomerCompanyQuery');
    },
    'click #email': function() {
      Session.setTemp("emailClicked", true);
      Session.clear("nameClicked");
      Session.clear("companyClicked");
      Session.clear("numberClicked");
      Session.clear("addressClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerCompanyQuery');
    }
});