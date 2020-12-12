Template.bookings.created = function () {

};

Template.bookings.rendered = function () {
  this.autorun(function() {
    // if(Customers.find)

    var customerIdArray = [];

    var customersArray = Customers.find().fetch();
    for(x in customersArray) {
      customerIdArray.push(customersArray[x]._id);
    }

    Meteor.subscribe('bookingcustomersbycustomeridarray', customerIdArray);
    Meteor.subscribe("bookingStatusesByAllCustomers", customerIdArray);
    Meteor.subscribe("bookingsByAllCustomers", customerIdArray);

  }.bind(this));
};

Template.bookings.destroyed = function () {
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

Tracker.autorun(function() {
  if (Session.get('searchQBQuery')) {
    Meteor.subscribe('qbSearch', Session.get('searchQBQuery'));

    var bookingStatuses = BookingStatuses.find().fetch();

    var ar = [];

    for(x in bookingStatuses) {
      ar.push(bookingStatuses[x].invoiceId);
    }

    Meteor.subscribe('qbCustomerSearch', ar);
    Meteor.subscribe('qbBookingSearch', ar);
  }
});


Template.bookings.helpers({
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
  bookingCustomer: function() {
    if(BookingCustomers.findOne({invoiceId: this._id}) != undefined) {
      return Customers.findOne({_id: BookingCustomers.findOne({invoiceId: this._id}).customerId});
    }
  },
  quickbooksInvoiceId: function() {
    if(BookingStatuses.findOne({invoiceId: this._id}) != undefined)
      return BookingStatuses.findOne({invoiceId: this._id}).quickbooksInvoiceId;
  },
  bookings: function () {
    var bookingStatuses = BookingStatuses.find({type: "Booking"}).fetch();

    var id = [];

    for(x in bookingStatuses) {
      id.push(bookingStatuses[x].invoiceId);
    }

    return Bookings.find({_id: {$in: id}});
  },
  dateGroupId: function() {
    return this.id + 1;
  },
  dates: function() {
    var bookingStatus = BookingStatuses.findOne({invoiceId: this._id});
    if(bookingStatus!=undefined) {
      if(bookingStatus.totalDates.length > 0) {
        
        return bookingStatus.displayDates;
      }
    }
  },
  datesExist: function() {

    var bookingStatus = BookingStatuses.findOne({invoiceId: this._id});
    if(bookingStatus!=undefined && bookingStatus.totalDates!=undefined) {
      if(bookingStatus.totalDates.length > 0) {
        return true;
      }

      return false;
    }

  },
  startDate: function() {
    return this[0];
  },
  endDate: function() {
    return this[this.length - 1];
  },
  username: function() {
    return Meteor.user().username;
  },
  gotEndDate: function() {
    return (this.length > 1);
  },
  dateGroups: function(e) {
    var dateGroups = [];
    var datesX = [];

    for(x in this.equipmentDetails) {
      for(y in this.equipmentDetails[x].dates) {
        if(datesX.indexOf(parseInt(moment(this.equipmentDetails[x].dates[y]).subtract(1,'days').format("x"))) == -1) {
          datesX.push(parseInt(moment(this.equipmentDetails[x].dates[y]).subtract(1,'days').format("x")));
        }
      }
    }

    datesX.sort();

    var dateArray = [];
    var dateArrayMoment = [];
    var counter = 0;
    var booked = 0;
    dateArray[counter] = [];
    dateArrayMoment[counter] = [];

    //MAKE THEM INTO INDIVIDUAL DATE GROUPS
    for(x in datesX) {
      if(dateArray[counter].length == 0) {
        dateArray[counter].push(moment(datesX[x]).format('Do MMMM YYYY'));
      } else {
        var date2 = moment(datesX[x]).subtract(1, 'days');

        if(date2.format('Do MMMM YYYY') == dateArray[counter][dateArray[counter].length - 1]) {
          dateArray[counter].push(moment(datesX[x]).format('Do MMMM YYYY'));
        } else {
          counter += 1;
          dateArray[counter] = [];
          dateArray[counter].push(moment(datesX[x]).format('Do MMMM YYYY'));
        }
      }
    }

    return dateArray;
},
createdAt: function(e) {
  return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
}
});

Template.bookings.events({
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
  'click #submitqbinvoiceid': function(e) {

    if(BookingStatuses.findOne({quickbooksInvoiceId: $("#qbinvoiceidtext").val()}) != undefined) {
      Router.go('bookings.show', {_id: BookingStatuses.findOne({quickbooksInvoiceId: $("#qbinvoiceidtext").val()}).invoiceId}, {});
    } else {
      IonPopup.alert({title: 'NO INVOICE FOUND', template: 'The invoice with the quickbooks id of: <strong>' + $("#qbinvoiceidtext").val() + '</strong> does not exist.'});
    }

      
    

  },
  'click #searchQbInvoiceId': function(e) {
    $("#qbinvoiceid").css("display", "flex");
  },
  'click .booking' : function(e) {
    $("#"+e.currentTarget.id).css("background-color", "rgba(0, 0, 0, 0.05)");
  },
  'click #addBooking': function(event, template) {
  	var customerDetails = new Object();
    customerDetails.id = "0";
    customerDetails.bookingType = "Booking";

    Meteor.call('addBooking', customerDetails, function(error, result) {
      Router.go('bookings.show', {_id: result});
    });
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
    'click #sortValue': function(e) {
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
    'click #sortBalance': function(e) {
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
    'click #sortDate': function(e) {
      if(Session.get("dateDirection")) {
        if(Session.get("dateDirection") == 1) {
          Session.setTemp("dateDirection", -1);
        } else {
          Session.setTemp("dateDirection", 1);
        }
      } else {
        Session.setTemp("dateDirection", 1);
      }
      Session.setTemp("sortType", "sortByDate");
    }
});
