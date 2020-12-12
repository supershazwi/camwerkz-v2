Template.others.created = function () {
};


Template.others.destroyed = function () {
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

Template.others.rendered = function () {
  this.autorun(function() {
    // if(Customers.find)

    var customerIdArray = [];

    var customersArray = Customers.find().fetch();
    for(x in customersArray) {
      customerIdArray.push(customersArray[x]._id);
    }

    Meteor.subscribe('othersbycustomeridarray', customerIdArray);

  }.bind(this));
};

Tracker.autorun(function() {
  if (Session.get('searchQBQuery')) {
    Meteor.subscribe('qbOthersSearch', Session.get('searchQBQuery'));
  }
});

Template.others.helpers({
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
  qbIdClicked: function() {
    if(Session.get('qbIdClicked') != undefined) {
      return true;
    }
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
    return (Session.get("searchCustomerQuery") == undefined || Session.get("searchCustomerNumberQuery") == undefined  || Session.get("searchCustomerCompanyQuery") == undefined  || Session.get("searchCustomerAddressQuery") == undefined  || Session.get("searchCustomerEmailQuery") == undefined);
  },
  username: function() {
    return Meteor.user().username;
  },
  others: function () {
    if(Session.get("sortType") == "sortByName") {
      return Others.find({}, {sort: {customerName: Session.get('nameDirection')}});
    } else if(Session.get("sortType") == "sortByCompany") {
      return Others.find({}, {sort: {customerCompany: Session.get('companyDirection')}});
    } else if(Session.get("sortType") == "sortByTotalValue") {
      return Others.find({}, {sort: {total: Session.get('totalValueDirection')}});   
    } else if(Session.get("sortType") == "sortByBalance") {
      return Others.find({}, {sort: {balanceDue: Session.get('balanceDirection')}});   
    } else {
      return Others.find({}, {sort: {createdAt: Session.get('dateDirection')}});   
    }
  },
  createdAt: function(e) {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  }
});

Template.others.events({
  'click #name': function() {
      Session.setTemp("nameClicked", true);
      Session.clear("companyClicked");
      Session.clear("numberClicked");
      Session.clear("addressClicked");
      Session.clear("emailClicked");
      Session.clear("qbIdClicked");

      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchCustomerCompanyQuery');
      Session.clear('searchQBQuery');
    },
    'click #company': function() {
      Session.setTemp("companyClicked", true);
      Session.clear("nameClicked");
      Session.clear("numberClicked");
      Session.clear("addressClicked");
      Session.clear("emailClicked");
      Session.clear("qbIdClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchQBQuery');
    },
    'click #number': function() {
      Session.setTemp("numberClicked", true);
      Session.clear("nameClicked");
      Session.clear("companyClicked");
      Session.clear("addressClicked");
      Session.clear("emailClicked");
      Session.clear("qbIdClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchCustomerCompanyQuery');
      Session.clear('searchQBQuery');
    },
    'click #address': function() {
      Session.setTemp("addressClicked", true);
      Session.clear("nameClicked");
      Session.clear("companyClicked");
      Session.clear("numberClicked");
      Session.clear("emailClicked");
      Session.clear("qbIdClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchCustomerCompanyQuery');
      Session.clear('searchQBQuery');
    },
    'click #email': function() {
      Session.setTemp("emailClicked", true);
      Session.clear("nameClicked");
      Session.clear("companyClicked");
      Session.clear("numberClicked");
      Session.clear("addressClicked");
      Session.clear("qbIdClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerCompanyQuery');
      Session.clear('searchQBQuery');
    },
    'click #qbId': function() {
      Session.setTemp("qbIdClicked", true);

      Session.clear("emailClicked");
      Session.clear("nameClicked");
      Session.clear("companyClicked");
      Session.clear("numberClicked");
      Session.clear("addressClicked");

      Session.clear('searchCustomerQuery');
      Session.clear('searchCustomerNumberQuery');
      Session.clear('searchCustomerEmailQuery');
      Session.clear('searchCustomerAddressQuery');
      Session.clear('searchCustomerCompanyQuery');
    },
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
  'keyup #qbIdQuery': function (event, template) {
    if(event.target.value.length >= 6) {
      Session.setTemp('searchQBQuery', event.target.value);
    } else {
      Session.clear('searchQBQuery');
    }
  },
  'click .item' : function(e) {
    $("#"+e.currentTarget.id).css("background-color", "rgba(0, 0, 0, 0.05)");
  },
  'click #addOthers': function(event, template) {
  	var customerDetails = new Object();
    customerDetails.id = 0;
    customerDetails.name = null;
    customerDetails.company = null; 
    customerDetails.number = null; 
    customerDetails.email = null;  
    customerDetails.address = null;    

    Meteor.call('addOthers', customerDetails, function(error, result) {
      Router.go('others.show', {_id: result}); 
    });
  }
});