var hello;

Template.bookingsShow.created = function () {
  this.subscribe('meteorUsers');

  var ca = [];
  Session.setTemp("listOfCustomers", ca);
  Session.setTemp("finalSubTotal", 0);
  Session.setTemp("bookingId", Router.current().params._id);
  Session.clear('searchCustomerQuery');
  Session.clear('searchCustomerNumberQuery');
  Session.clear('searchCustomerCompanyQuery');

  this.subscribe('thisUsers');
  this.subscribe("logsByBookingCustomer", Router.current().params._id);
  this.subscribe('inventoriesByBooking', Router.current().params._id);
  this.subscribe('invoiceNeedingUpdateByBooking', Router.current().params._id);
  this.subscribe('calendarsbybooking2', Router.current().params._id);
  this.subscribe('bookinglineitemsByBooking', Router.current().params._id);
  this.subscribe('bookinggroupsByBooking', Router.current().params._id);
  this.subscribe('bookingprojectsByBooking', Router.current().params._id);
  this.subscribe('bookingpricesByBooking', Router.current().params._id);
  this.subscribe('bookinggrouppricesByBooking', Router.current().params._id);
  this.subscribe('bookingcustomersByBooking', Router.current().params._id);
  // this.subscribe('availableEquipmentsByBooking', Router.current().params._id);
  this.subscribe('bookingcustomersByBooking2', Router.current().params._id);
  this.subscribe('bookinggeneralremarksByBooking', Router.current().params._id);
  this.subscribe('bookingacknowledgeremarksByBooking', Router.current().params._id);
  this.subscribe('bookingsigninsbybooking', Router.current().params._id);
  this.subscribe('bookingsignoutsbybooking', Router.current().params._id);
  this.subscribe('bookingprivilegesbybooking', Router.current().params._id);
  this.subscribe('bookingstatusesbybooking', Router.current().params._id);
  this.subscribe('logsByBooking', Router.current().params._id);
  this.subscribe('privileges');
  this.subscribe("equipmentcalendarsbybooking", Router.current().params._id);

  // this.subscribe('bookingByDates', Router.current().params._id);
  this.subscribe('booking', Router.current().params._id);
  // this.subscribe('equipmentCalendars');
  // this.subscribe('privilegeByBooking', Router.current().params._id);
  this.subscribe('customerByBooking', Router.current().params._id);
  this.subscribe('customerPackageByBooking', Router.current().params._id);
  this.subscribe('bookingUpdate', Router.current().params._id);
  // this.subscribe('calendarsbybooking', Router.current().params._id);

  // this.subscribe('equipmentCalendarsStartAndEnd', Session.get('startMonth2'), Session.get('endMonth2'), null, function () {});
  // this.subscribe('calendarsStartAndEnd', Session.get('startMonth2'), Session.get('endMonth2'), null, function () {});
};

Tracker.autorun(function() {
  if (Session.get('searchCustomerQuery')) {
    Meteor.subscribe('customerSearch', Session.get('searchCustomerQuery'));
    Meteor.subscribe('customerByArray', Session.get("listOfCustomers"));
  }
  if (Session.get('searchCustomerNumberQuery')) {
    Meteor.subscribe('customerNumberSearch', Session.get('searchCustomerNumberQuery'));
    Meteor.subscribe('customerByArray', Session.get("listOfCustomers"));
  }
  if (Session.get('searchCustomerCompanyQuery')) {
    Meteor.subscribe('customerCompanySearch', Session.get('searchCustomerCompanyQuery'));
    Meteor.subscribe('customerByArray', Session.get("listOfCustomers"));
  }
});

Template.bookingsShow.onDestroyed(function () {
  console.log("bookingshow destroyed");
    Session.setTemp("check", false);
  Meteor.clearInterval(hello);
});


Template.bookingsShow.rendered = function () {
      

      $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
      Session.setTemp('distinctBrands', []);
      Session.setTemp('remarkButton', 'disabled');

      var array = [];
      Session.setTemp("remarksAcknowledgeId", array);
      Session.setTemp("customerAlert", false);

      this.autorun(function () {

        if(Session.get("check") == true) {
          hello = Meteor.setInterval(function () {
            console.log("check");
            if(BookingUpdates.findOne({invoiceId: Router.current().params._id}).status != "Syncing") {
              Session.setTemp("check", false);
              Meteor.clearInterval(hello);
            }
          }, 1000);
        }

      }.bind(this));
};

Template.bookingsShow.helpers({
  
  quickbooksInvoiceIdIsNotPending: function() {
    return (BookingStatuses.findOne({invoiceId: Router.current().params._id}).quickbooksInvoiceQueryId != "Pending");
  },
  bookingUpdateSyncing: function() {
      return (BookingUpdates.findOne({invoiceId: Router.current().params._id}).status == "Syncing");
  },
  bookingUpdateError: function() {
    return (BookingUpdates.findOne({invoiceId: Router.current().params._id}).status != "OK" && BookingUpdates.findOne({invoiceId: Router.current().params._id}).status != "Syncing");
  },
  serialGroup: function() {
    return parseInt(this.serialGroup) + 1;
  },
  affectedItemsExist: function() {
    return (BookingStatuses.findOne({invoiceId: Router.current().params._id}).affectedItems != undefined && BookingStatuses.findOne({invoiceId: Router.current().params._id}).affectedItems.length > 0);
  },
  errorStatus: function() {
    return BookingUpdates.findOne({invoiceId: Router.current().params._id}).status;
  },
  affectedItem: function() {
    return BookingStatuses.findOne({invoiceId: Router.current().params._id}).affectedItems;
  },
  notZero: function() {
    return (this._id != "0");
  },
  bookingGroupId: function() {
    return this.groupId;
  },
  removeGroupColor: function() {
    if(this.groupId != 0) {
      return "white";
    } else {
      return "#374140";
    }
  },
  bookingGroupPrice: function() {
      return BookingGroupPrices.findOne({invoiceId: Router.current().params._id, groupId: parseInt(this.groupId)});
  },
  bookingPrivilegeExists: function() {
    if(BookingPrivileges.findOne({invoiceId: Router.current().params._id}) != undefined)
      return BookingGroupPrices.findOne({invoiceId: Router.current().params._id});
  },
  bookingPrice: function() {
    return BookingPrices.findOne({invoiceId: Router.current().params._id});
  },
  clippedCategory: function() {
    return (this.category.charAt(0));
  },
  bookingcustomer: function() {
    
    if(BookingCustomers.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingCustomer = BookingCustomers.findOne({invoiceId: Router.current().params._id});

      return Customers.findOne({_id: bookingCustomer.customerId});
    }
  },
  searchCustomerQuery: function() {
    return Session.get("searchCustomerQuery");
  },
  searchCustomerNumberQuery: function() {
    return Session.get("searchCustomerNumberQuery");
  },
  searchCustomerCompanyQuery: function() {
    return Session.get("searchCustomerCompanyQuery");
  },
  searchedCustomers: function() {
    if(Session.get('searchCustomerQuery')) {
      return Customers.search(Session.get('searchCustomerQuery'));
    }
    if(Session.get('searchCustomerNumberQuery')) {

      return Customers.numberSearch(Session.get('searchCustomerNumberQuery'));
    }
    if(Session.get('searchCustomerCompanyQuery')) {

      return Customers.companySearch(Session.get('searchCustomerCompanyQuery'));
    }
  },
  privilegeLineThrough: function() {
    if(BookingPrivileges.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingPrivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

      if(bookingPrivilege.status == false) {
        return "text-decoration: line-through";
      } else {
        return "";
      }
    }
  },
  privilegeButton: function() {
    if(BookingPrivileges.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingPrivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

      if(bookingPrivilege.status == false) {
        return "addPrivilege";
      } else {
        return "removePrivilege";
      }
    }
  },
  privilegeInput: function() {
    if(BookingPrivileges.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingPrivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

      if(bookingPrivilege.status == false) {
        return "Add";
      } else {
        return "Remove";
      }
    }
  },
  privilegeRemoved: function() {
    if(BookingPrivileges.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingPrivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

      if(bookingPrivilege.status == false) {
        return true;
      } else {
        return false;
      }
    }
  },
  privilegeValue: function() {
    return parseFloat(this.privilege.percentage).toFixed(2);
  },
  privilegeDiscount: function() {
    return accounting.formatMoney(parseFloat(this.privilege.value));
  },
  edited: function() {
    return this.privilege.edited;
  },
  privilegeDiscountWithout: function() {
    return parseFloat(this.privilege.value);
  },
  privilege: function() {
    if(BookingPrivileges.findOne({invoiceId: Router.current().params._id}) != undefined) {
      return BookingPrivileges.findOne({invoiceId: Router.current().params._id});
    }

  },
  bookingGroupPricePrivilege: function() {
    return this;
  },
  items: function() {
    return this.items;
  },
  bookingGroup: function() {
    
    var bookingGroup = BookingGroups.findOne({groupId: parseInt(this.id), invoiceId: Router.current().params._id});
    return bookingGroup;
  },
  needtoauthenticate: function() {
    return Session.get("needtoauthenticate");
  },
  bookingLineItems: function() {
    return BookingLineItems.find({invoiceId:Router.current().params._id, groupCounter: this.groupId}, {sort: {sortNumber: 1}});
  },
  syncInvoiceToQb: function() {
    return (InvoiceNeedingUpdate.findOne({bookingId: Router.current().params._id}) != undefined);
  },
  // needUpdate: function() {
  //   var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
  //   if(bookingStatus.type == "Quotation") {
  //     return false;
  //   }

  //   return ((InvoiceNeedingUpdate.findOne({bookingId: Router.current().params._id}) != undefined && bookingStatus.quickbooksInvoiceId == "Pending") || BookingUpdates.findOne({invoiceId: Router.current().params._id}).status != "OK");
  // },
  bookingId: function() {
    return Router.current().params._id;
  },
  void: function() {
    if(BookingStatuses.findOne({invoiceId: Router.current().params._id}) != undefined) {
      return (BookingStatuses.findOne({invoiceId: Router.current().params._id}).status == "Void");
    }

  },
  numberDiscount: function() {
    return this.discount;
  },
  numberRate: function() {
    return this.rate;
  },
  discountOverwrite: function() {
    return accounting.formatMoney(this.discountOverwrite);
  },
  custom: function() {
    return (this.total == -1);
  },
  customItem: function() {

  },
  dates: function() {
    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
    if(bookingStatus!=undefined) {
      if(bookingStatus.totalDates.length > 0) {
        
        return bookingStatus.displayDates;
      }
    }
  },
  // dates: function() {
  //   var booking = Bookings.find({_id: Router.current().params._id}).fetch();
  //   var arrayOfDateArrays = [];
  //   var counter = 0;
  //   var arrayOfObjects = [];
  //
  //   for(i in booking) {
  //
  //   for(x in booking[i].equipmentDetails) {
  //     arrayOfDateArrays = [];
  //     arrayOfDateArrays[counter] = [];
  //
  //     var obj = new Object();
  //     obj.id = booking[i].equipmentDetails[x].id;
  //     if(booking[i].equipmentDetails[x].dates.length >0) {
  //
  //       for(y in booking[i].equipmentDetails[x].dates) {
  //         booking[i].equipmentDetails[x].dates[y] = parseInt(moment(booking[i].equipmentDetails[x].dates[y]).format("x"));
  //       }
  //
  //         booking[i].equipmentDetails[x].dates.sort();
  //
  //       for(y in booking[i].equipmentDetails[x].dates) {
  //         booking[i].equipmentDetails[x].dates[y] = new Date(booking[i].equipmentDetails[x].dates[y]);
  //       }
  //
  //       for(y in booking[i].equipmentDetails[x].dates) {
  //         var date = moment(booking[i].equipmentDetails[x].dates[y]);
  //
  //         if(arrayOfDateArrays[counter].length == 0) {
  //           var date2 = date.subtract(1, 'days');
  //           arrayOfDateArrays[counter].push(date._d);
  //         } else {
  //
  //           var date2 = date.subtract(1, 'days');
  //
  //           if(moment(booking[i].equipmentDetails[x].dates[parseInt(y-1)]).diff(date2) == 0) {
  //
  //             arrayOfDateArrays[counter].push(date._d);
  //           } else {
  //             counter = counter + 1;
  //             arrayOfDateArrays[counter] = [];
  //             arrayOfDateArrays[counter].push(date._d);
  //           }
  //         }
  //       }
  //
  //       obj.dateArray = arrayOfDateArrays;
  //       arrayOfObjects.push(obj);
  //     }
  //   }
  //   }
  //
  //   Session.setTemp("arrayOfDateObjects", arrayOfObjects);
  //
  //
  //
  //   return arrayOfObjects;
  // },
  datesExist: function() {

    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
    if(bookingStatus!=undefined) {
      if(bookingStatus.totalDates.length > 0) {
        return true;
      }

      return false;
    }

  },
  differentQuantity: function() {
    if(this.originalPriced > 0 && this.discountPriced > 0) {
      return true;
    }
  },
  finalSubTotal: function() {
    
    // var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id}).fetch();
    // var subtotal = 0;

    // var bookingprivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

    // for(x in bookinglineitems) {
    //     subtotal += (bookinglineitems[x].originalPriced * bookinglineitems[x].rate);
    // }

    // var subdiscount = 0;

    // for(x in bookinglineitems) {
    //   if(bookinglineitems[x].discountOverwrite != undefined) {
    //     subdiscount += bookinglineitems[x].discountOverwrite;
    //   }
    // }

    // if(bookingprivilege != undefined && bookingprivilege.status == true) {
    //   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: Router.current().params._id});

    //   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);

    //   return accounting.formatMoney((subtotal - subdiscount) * parseFloat(100 - privilegepercentage) / 100);
    // }


    // return accounting.formatMoney(subtotal - subdiscount);

    var subsubtotal = 0;
    var subsubdiscount = 0;
    var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id}).fetch();

    for(x in bookinglineitems) {
        subsubtotal += (bookinglineitems[x].originalPriced * bookinglineitems[x].rate);
        if(bookinglineitems[x].discountOverwrite != undefined) {
          subsubdiscount += bookinglineitems[x].discountOverwrite;
        }
    }

    var bookinggroupprices = BookingGroupPrices.find({invoiceId: Router.current().params._id}).fetch();

    for(x in bookinggroupprices) {
      subsubtotal -= bookinggroupprices[x].privilege.value;
    }

    subsubtotal = subsubtotal - subsubdiscount;

    Session.setTemp("finalSubTotal", subsubtotal);

    return accounting.formatMoney(subsubtotal);
  },
  finalTotal: function() {
    return accounting.formatMoney(Session.get("finalSubTotal") * 1.07);
    // var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id}).fetch();
    // var subtotal = 0;

    // var bookingprivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

    // for(x in bookinglineitems) {
    //     subtotal += (bookinglineitems[x].originalPriced * bookinglineitems[x].rate);
    // }

    // var subdiscount = 0;

    // for(x in bookinglineitems) {
    //   if(bookinglineitems[x].discountOverwrite != undefined) {
    //     subdiscount += bookinglineitems[x].discountOverwrite;
    //   }
    // }

    // if(bookingprivilege != undefined && bookingprivilege.status == true) {
    //   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: Router.current().params._id});

    //   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);

    //   return accounting.formatMoney((subtotal - subdiscount) * parseFloat(100 - privilegepercentage) / 100 * 1.07);
    // }


    // return accounting.formatMoney((subtotal - subdiscount) * 1.07);
  },
  gst: function() {
    return accounting.formatMoney(Session.get("finalSubTotal") * 0.07);
    // var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id}).fetch();
    // var subtotal = 0;

    // var bookingprivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

    // for(x in bookinglineitems) {
    //     subtotal += (bookinglineitems[x].originalPriced * bookinglineitems[x].rate);
    // }

    // var subdiscount = 0;

    // for(x in bookinglineitems) {
    //   if(bookinglineitems[x].discountOverwrite != undefined) {
    //     subdiscount += bookinglineitems[x].discountOverwrite;
    //   }
    // }

    // if(bookingprivilege != undefined && bookingprivilege.status == true) {
    //   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: Router.current().params._id});

    //   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);

    //   return accounting.formatMoney((subtotal - subdiscount) * parseFloat(100 - privilegepercentage) / 100 * 0.07);
    // }


    // return accounting.formatMoney((subtotal - subdiscount) * 0.07);
  },
  projectNameExists: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    if(booking.projectName == "") {
      return false;
    } else {
      return true;
    }
  },
  naExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "N/A") {
        return true;
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "N/A") {
        return true;
      }
    }
  },
  noOfNa: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "N/A") {
        count++
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "N/A") {
        count++
      }
    }
    return count;
  },
  packedExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Packed") {
        return true;
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Packed") {
        return true;
      }
    }
  },
  noOfPacked: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Packed") {
        count++
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Packed") {
        count++
      }
    }
    return count;
  },
  inExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "In") {
        return true;
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "In") {
        return true;
      }
    }
  },
  noOfIn: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "In") {
        count++
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "In") {
        count++
      }
    }
    return count;
  },
  outExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Out") {
        return true;
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Out") {
        return true;
      }
    }
  },
  noOfOut: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Out") {
        count++
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Out") {
        count++
      }
    }
    return count;
  },
  missingExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Missing") {
        return true;
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Missing") {
        return true;
      }
    }
  },
  noOfMissing: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Missing") {
        count++
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Missing") {
        count++
      }
    }
    return count;
  },
  damagedExist: function() {
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Damaged") {
        return true;
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Damaged") {
        return true;
      }
    }
  },
  noOfDamaged: function() {
    var count = 0;
    for(x in this.clashableSerialNumbers) {
      if(this.clashableSerialNumbers[x].status == "Damaged") {
        count++
      }
    }
    for(x in this.unclashableSerialNumbers) {
      if(this.unclashableSerialNumbers[x].status == "Damaged") {
        count++
      }
    }
    return count;
  },
  name: function() {
    return this.name;
  },
  projectName: function() {
    if(BookingProjects.findOne({invoiceId: Router.current().params._id}) != undefined) {
      return BookingProjects.findOne({invoiceId: Router.current().params._id}).projectName;
    }
  },
  quickbooksInvoiceId: function() {
    if(BookingStatuses.findOne({invoiceId: Router.current().params._id}) != undefined) {
    return BookingStatuses.findOne({invoiceId: Router.current().params._id}).quickbooksInvoiceId;
  }
  },
  groupId: function() {
    return this.groupId + 1;
  },
  dateGroupId: function() {
    return this.id + 1;
  },
  privilegeGroupId: function() {
    return this.groupId;
  },
  totalOriginalPrice: function() {
    return accounting.formatMoney(this.originalPriced * (this.rate + this.discount));
  },
  totalDiscountPrice: function() {
    return accounting.formatMoney(this.discountPriced * this.rate);
  },
  dateTime: function() {
    return moment().format('Do MMMM YYYY, h:mma');
  },
  bookingCreatedAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  thisCreatedAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  colorCode: function() {
    if(this.status == "N/A") {
      return "#374140";
    } else if(this.status == "Packed") {
      return "#FFB03B";
    } else if(this.status == "In") {
      return "#468966";
    } else if(this.status == "Out") {
      return "#B64926";
    } else if(this.status == "Missing") {
      return "#EA2E49";
    } else {
      return "#8A0917";
    }
  },
  groups: function() {
    if(BookingGroups.findOne({invoiceId: Router.current().params._id}) != undefined) {
    var bookingGroups = BookingGroups.find({invoiceId: Router.current().params._id}, {sort: {groupId: 1}});
    return bookingGroups;
  }
  },
  booking: function() {
    
    return Bookings.findOne({_id: Router.current().params._id});
  },
  bookingRemark: function() {
    if(BookingGeneralRemarks.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingGeneralRemarks = BookingGeneralRemarks.findOne({invoiceId: Router.current().params._id});

      for(x in bookingGeneralRemarks.remarks) {
        bookingGeneralRemarks.remarks[x]['createdAt'] = moment(bookingGeneralRemarks.remarks[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      }

      if(bookingGeneralRemarks.remarks!= undefined) {
      return bookingGeneralRemarks.remarks.reverse();

      }
    }
  },
  signed: function() {
    if(this.status == "Signed")
      return true;
  },
  acknowledgeRemarksExist: function() {
    if(BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id}) != undefined) {
    var bookingAcknowledgeRemarks = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});
    if(bookingAcknowledgeRemarks.remarksRequiringAcknowledgement.length > 0)
      return true;
    else
      return false;
  }
  },
  customerSignOutExist: function() {
    if(BookingSignOuts.findOne({invoiceId: Router.current().params._id}) != undefined) {
    var bookingSignOut = BookingSignOuts.findOne({invoiceId: Router.current().params._id});
    if(bookingSignOut.customerSignOut.length > 0)
      return true;
    else
      return false;
  }
  },
  customerSignOutRemark: function() {
    var bookingSignOut = BookingSignOuts.findOne({invoiceId: Router.current().params._id});
    return (this.items.length + " pending items unsigned.");
  },
  staffSignInRemark: function() {
    var bookingSignIn = BookingSignIns.findOne({invoiceId: Router.current().params._id});
    return (this.items.length + " pending items unsigned.");
  },
  customerSignOut: function() {
    var bookingSignOut = BookingSignOuts.findOne({invoiceId: Router.current().params._id});

    for(x in bookingSignOut.customerSignOut) {
      bookingSignOut.customerSignOut[x]['createdAt'] = moment(bookingSignOut.customerSignOut[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      bookingSignOut.customerSignOut[x]['signedAt'] = moment(bookingSignOut.customerSignOut[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }


    return bookingSignOut.customerSignOut.reverse();
  },
  staffSignInExist: function() {
    if(BookingSignIns.findOne({invoiceId: Router.current().params._id}) != undefined) {
    var bookingSignIn = BookingSignIns.findOne({invoiceId: Router.current().params._id});
    if(bookingSignIn.staffSignIn.length > 0)
      return true;
    else
      return false;
  }
  },
  staffSignIn: function() {
    var bookingSignIn = BookingSignIns.findOne({invoiceId: Router.current().params._id});

    for(x in bookingSignIn.staffSignIn) {
      bookingSignIn.staffSignIn[x]['createdAt'] = moment(bookingSignIn.staffSignIn[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      bookingSignIn.staffSignIn[x]['signedAt'] = moment(bookingSignIn.staffSignIn[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }

    return bookingSignIn.staffSignIn.reverse();
  },
  bookingRemarkRequiringAcknowledgement: function() {
    var bookingAcknowledgeRemarks = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});

    for(x in bookingAcknowledgeRemarks.remarksRequiringAcknowledgement) {
      bookingAcknowledgeRemarks.remarksRequiringAcknowledgement[x]['createdAt'] = moment(bookingAcknowledgeRemarks.remarksRequiringAcknowledgement[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      bookingAcknowledgeRemarks.remarksRequiringAcknowledgement[x]['signedAt'] = moment(bookingAcknowledgeRemarks.remarksRequiringAcknowledgement[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }

    return bookingAcknowledgeRemarks.remarksRequiringAcknowledgement.reverse();
  },
  remarkChecked: function() {
    if(this['status'] == 'Open') {
      return "remarkOpen";
    } else {
      return "remarkClose";
    }
  },
  remarkAcknowledgeChecked: function() {
    if(this['status'] == 'Unsigned') {
      return "remarkOpen";
    } else {
      return "remarkClose";
    }
  },
  booked: function() {
    return this.booked;
  },
  statusColor: function() {
    if (this.booked == 0 || this.days == 0) {
      return "#374140";
    }
    else {
      if(this.clash == false) {
        return "#468966";
      } else {
        return "#E74C3C";
      }
    }
  },
  remarkId: function() {
    var id = this.id;
    id = id + 1;
    return id;
  },
  commentRemarkId: function() {
    return this.remarkId;
  },
  amount: function() {
    return accounting.formatMoney(this.amount);
  },
  paymentExists: function() {
    if(this.payment != undefined) {
    return (this.payment.length == 0);

    }
  },
  totalPrice: function() {
    return accounting.formatMoney(this.total);
  },
  zeroTotal: function() {

    var payments = BookingPrices.findOne({invoiceId: Router.current().params._id}).payment;

    var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id}).fetch();
    var subtotal = 0;
    var total = 0;

    var bookingprivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

    for(x in bookinglineitems) {
        subtotal += (bookinglineitems[x].originalPriced * bookinglineitems[x].rate);
    }

    var subdiscount = 0;

    for(x in bookinglineitems) {
      if(bookinglineitems[x].discountOverwrite != undefined) {
        subdiscount += bookinglineitems[x].discountOverwrite;
      }
    }

    if(bookingprivilege != undefined && bookingprivilege.status == true) {
      var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: Router.current().params._id});

      var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);


      total = (subtotal - subdiscount) * parseFloat(100 - privilegepercentage) / 100 * 1.07;

    } else {

      total = (subtotal - subdiscount) * 1.07;

    }


    for(x in payments) {
       total -= payments[x].amount;
    }

    return(total > 0);
  },
  balanceDue: function() {

    var payments = BookingPrices.findOne({invoiceId: Router.current().params._id}).payment;

    var total = Session.get("finalSubTotal") * 1.07;

    for(x in payments) {
       total -= payments[x].amount;
    }

    return accounting.formatMoney(total);
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
  // items: function() {
  //   var itemArray = [];
  //   var counter = -1;
  //   for (i = 0; i < this.items.length; i++) {
  //     if(i == 0) {
  //       counter++;
  //     }
  //     itemArray[i] = this.items[i];
  //   }

  //   var accessories = [];
  //   var batteries = [];
  //   var cameras = [];
  //   var cards = [];
  //   var electronics = [];
  //   var filters = [];
  //   var grips = [];
  //   var lens = [];
  //   var lights = [];
  //   var monitors = [];
  //   var sound = [];
  //   var studio = [];
  //   var tripods = [];
  //   var custom = [];

  //   for(x in itemArray) {
  //     if(itemArray[x].category == "Studio Usage") {
  //       studio.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Cameras") {
  //       cameras.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Electronics") {
  //       electronics.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Monitors") {
  //       monitors.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Accessories") {
  //       accessories.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Batteries") {
  //       batteries.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Cards") {
  //       cards.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Tripods") {
  //       tripods.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Sound") {
  //       sound.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Lens") {
  //       lens.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Filters") {
  //       filters.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Lights") {
  //       lights.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Grips") {
  //       grips.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "") {
  //       custom.push(itemArray[x]);
  //     }
  //     if(itemArray[x].category == "Custom Item Rental") {
  //       custom.push(itemArray[x]);
  //     }
  //   }

  //   itemArray = [];

  //   if(studio.length > 0) {
  //     for(x in studio) {
  //       itemArray.push(studio[x]);
  //     }
  //   }
  //   if(cameras.length > 0) {
  //     for(x in cameras) {
  //       itemArray.push(cameras[x]);
  //     }
  //   }
  //   if(electronics.length > 0) {
  //     for(x in electronics) {
  //       itemArray.push(electronics[x]);
  //     }
  //   }
  //   if(monitors.length > 0) {
  //     for(x in monitors) {
  //       itemArray.push(monitors[x]);
  //     }
  //   }
  //   if(accessories.length > 0) {
  //     for(x in accessories) {
  //       itemArray.push(accessories[x]);
  //     }
  //   }
  //   if(batteries.length > 0) {
  //     for(x in batteries) {
  //       itemArray.push(batteries[x]);
  //     }
  //   }
  //   if(cards.length > 0) {
  //     for(x in cards) {
  //       itemArray.push(cards[x]);
  //     }
  //   }
  //   if(tripods.length > 0) {
  //     for(x in tripods) {
  //       itemArray.push(tripods[x]);
  //     }
  //   }
  //   if(sound.length > 0) {
  //     for(x in sound) {
  //       itemArray.push(sound[x]);
  //     }
  //   }
  //   if(lens.length > 0) {
  //     for(x in lens) {
  //       itemArray.push(lens[x]);
  //     }
  //   }
  //   if(filters.length > 0) {
  //     for(x in filters) {
  //       itemArray.push(filters[x]);
  //     }
  //   }
  //   if(lights.length > 0) {
  //     for(x in lights) {
  //       itemArray.push(lights[x]);
  //     }
  //   }
  //   if(grips.length > 0) {
  //     for(x in grips) {
  //       itemArray.push(grips[x]);
  //     }
  //   }
  //   if(custom.length > 0) {
  //     for(x in custom) {
  //       itemArray.push(custom[x]);
  //     }
  //   }

  //   return itemArray;
  // },
  rate: function() {
    return accounting.formatMoney(this.rate);
  },
  packageClicked: function() {
    return this.packageClicked;
  },
  subAmount: function() {
    if(this.booked == 0) {
      return accounting.formatMoney(0);
    }
    return accounting.formatMoney(this.originalPriced * this.rate);
  },
  serialNoExists: function() {
    if(this.serialNo != undefined) {
      return true;
    }
  },
  itemLineSubDiscount: function() {
    if(this.packageClicked != undefined) {
      return accounting.formatMoney(this.discount * this.days * this.booked);
    } else {
      return accounting.formatMoney(this.discountOverwrite);
    }

  },
  thisIsBooking: function() {
    if(BookingStatuses.findOne({invoiceId: Router.current().params._id}) != undefined) {
      if(BookingStatuses.findOne({invoiceId: Router.current().params._id}).type == "Booking") {
        return true;
      }
    }
  },
  thisIsQuotation: function() {
    if(BookingStatuses.findOne({invoiceId: Router.current().params._id}) != undefined) {
      if(BookingStatuses.findOne({invoiceId: Router.current().params._id}).type == "Quotation") {
        return true;
      }
    }
  },
  discount: function() {
    return accounting.formatMoney(this.discount);
  },
  totalSubTotal: function() {
    var totalSubTotal = 0;
    for(x in this.items) {
      totalSubTotal += ((this.items[x].discount + this.items[x].rate) * this.items[x].days * this.items[x].booked);
    }

    return accounting.formatMoney(totalSubTotal);
  },
  subTotal: function() {
    var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id, groupCounter: parseInt(this.groupId)}).fetch();
    var subtotal = 0;

    for(x in bookinglineitems) {
        subtotal += (bookinglineitems[x].originalPriced * bookinglineitems[x].rate);
    }

    return accounting.formatMoney(subtotal);
  },
  afterTotal: function() {
    var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id, groupCounter: parseInt(this.groupId)}).fetch();
    var subtotal = 0;

    var bookingprivilege = BookingPrivileges.findOne({invoiceId: Router.current().params._id});

    for(x in bookinglineitems) {
        subtotal += (bookinglineitems[x].originalPriced * bookinglineitems[x].rate);
    }

    var subdiscount = 0;

    for(x in bookinglineitems) {
      if(bookinglineitems[x].discountOverwrite != undefined) {
        subdiscount += bookinglineitems[x].discountOverwrite;
      }
    }

    if((subtotal - subdiscount) < 0) {
      return accounting.formatMoney(0);
    }

    if(bookingprivilege != undefined && bookingprivilege.status == true) {
      var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: Router.current().params._id, groupId: parseInt(this.groupId)});

      console.log(bookinggroupprices);

      var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);

      return accounting.formatMoney((subtotal - subdiscount) * parseFloat(100 - privilegepercentage) / 100);
    }

    return accounting.formatMoney(subtotal - subdiscount);
  },
  subDiscount: function() {
    var bookinglineitems = BookingLineItems.find({invoiceId: Router.current().params._id, groupCounter: parseInt(this.groupId)}).fetch();
    var subdiscount = 0;

    for(x in bookinglineitems) {
      if(bookinglineitems[x].discountOverwrite != undefined) {
        subdiscount += bookinglineitems[x].discountOverwrite;
      }
    }

    return accounting.formatMoney(subdiscount);
  },
  extraGroup: function() {
    if(this.groupId != 0)
      return true;
  },
  bookingCreatedBy: function() {
    return Meteor.users.findOne({_id: this.createdBy}).username;
  },
  checkboxChecked: function() {
    if(this['status'] == 'Open') {
      return false;
    } else {
      return true;
    }
  },
  checkboxAcknowledgeChecked: function() {
    if(this['status'] == 'Unsigned') {
      return false;
    } else {
      return true;
    }
  },
  customerSignOutAcknowledged: function() {
    return (this['status'] == "Signed");
  },
  staffSignInAcknowledged: function() {
    return (this['status'] == "Signed");
  },
  resolved: function() {
    return this['resolved'];
  },
  discountExist: function() {
    if(this.discount > 0)
      return true;
  },
  originalPrice: function() {
    return accounting.formatMoney(this.rate + this.discount);
  },
  out: function() {
    if(this.availability == "out")
      return "checked";
  },
  startDate: function() {
    return this[0];
  },
  endDate: function() {
    return this[this.length - 1];
  },
  gotEndDate: function() {
    return (this.length > 1);
  },
  bookingId: function() {
    return Router.current().params._id;
  },
  back: function() {
    if(this.availability == "back")
      return "checked";
  },
  addRemarkDisabled: function() {
    if(Session.get("remarkButton") == "disabled") {
      return "disabled";
    }
  },
  customerSignOutAbled: function() {
    if(BookingSignOuts.findOne({invoiceId: Router.current().params._id}) != undefined) {
    var bookingSignOuts = BookingSignOuts.findOne({invoiceId: Router.current().params._id});

    for(x in bookingSignOuts.customerSignOut) {
      if(bookingSignOuts.customerSignOut[x]['status'] == "Unsigned") {
        return "";
        break;
      }
    }

    return "disabled";
  }
  },
  staffSignInAbled: function() {
    if(BookingSignIns.findOne({invoiceId: Router.current().params._id}) != undefined) {
    var bookingSignIns = BookingSignIns.findOne({invoiceId: Router.current().params._id});

    for(x in bookingSignIns.staffSignIn) {
      if(bookingSignIns.staffSignIn[x]['status'] == "Unsigned") {
        return "";
        break;
      }
    }

    return "disabled";
  }
  },
  spinning: function() {

  },
  clashableSerialNumbers: function() {
    if(this.clashableSerialNumbers.length > 0) {


      var arr = [];

      for(x in this.clashableSerialNumbers) {
        for(y in this.clashableSerialNumbers[x].clashCalendars) {
          arr.push(this.clashableSerialNumbers[x].clashCalendars[y]);
        }
        for(y in this.clashableSerialNumbers[x].originalCalendars) {
          arr.push(this.clashableSerialNumbers[x].originalCalendars[y]);
        }
      }

      arr.unshift(Calendars.findOne({invoiceId: this.invoiceId, groupId: parseInt(this.groupCounter)}).startDate);

      return arr;
    } else {
      return null;
    }
  },
fineSignAbled: function() {
    if(Bookings.findOne({_id: Router.current().params._id}) != undefined) {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    for(x in booking.remarksRequiringAcknowledgement) {
      if(booking.remarksRequiringAcknowledgement[x].resolved == false) {
        return "";
      }
    }

    return "disabled";
  }
  },
  signAbled: function() {
    if(Session.get("remarksAcknowledgeId") != undefined) {
      if(Session.get("remarksAcknowledgeId").length == 0) {
        return "disabled";
      }
    }

  }
});

Template.bookingsShow.events({
  // 'click #printInvoice': function (event) {
  //   // Router.go('bookingPrint.show', {_id: Router.current().params._id}, {});
  // },

  'keyup #customerSearch2': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerQuery', event.target.value);
    }
  },
  'keyup #customerNumberSearch2': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerNumberQuery', event.target.value);
    }
  },
  'keyup #customerCompanySearch2': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.setTemp('searchCustomerCompanyQuery', event.target.value);
    }
  },
  'click .addOutsideRemark': function(event, template) {
    var string = event.currentTarget.id.split("_");
    $("#addComment_"+string[1]).css("display", "none");
    $("#showComments_"+string[1]).css("display", "block");
  },
  'click .addOutsideRemark': function(event, template) {
    var string = event.currentTarget.id.split("_");
    $("#addComment_"+string[1]).css("display", "none");
    $("#showComments_"+string[1]).css("display", "block");
  },
  'click .saveOutsideRemark': function(event, template) {
    var string = event.currentTarget.id;

    $("#addComment_"+string).css("display", "block");
    $("#showComments_"+string).css("display", "none");

    var comment = $("#outsideComment_"+string).val();

    var attributes = {
      _id: Router.current().params._id,
      id: string,
      comment: comment
    }

    Meteor.call('addComment', attributes, function(error, result) {
      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});

      var remark = bookingAcknowledgeRemark.remarksRequiringAcknowledgement[string];

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " commented: " + comment + " on remark: " + remark.remark + ".",
        universalContent: Meteor.user().username + " commented: " + comment + " on remark: " + remark.remark + " of " + bookingStatus.type + " " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .cancelOutsideRemark': function(event, template) {
    var string = event.currentTarget.id;
    $("#addComment_"+string).css("display", "block");
    $("#showComments_"+string).css("display", "none");
  },
  'click .removePrivilege': function() {
    var template = 'You will be removing this privilege. Are you <strong>really</strong> sure?';
    IonPopup.confirm({
      title: 'REMOVE PRIVILEGE',
      template: template,
      onOk: function() {
        var attributes = {
          _id: Router.current().params._id
        };

        Meteor.call('removePrivilege', attributes, function(error, result) {
          Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
              Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
            });
        });
      },
      onCancel: function() {
      }
    });
  },
  'click .addPrivilege': function() {
    var attributes = {
      _id: Router.current().params._id
    };

    Meteor.call('addPrivilege2', attributes, function(error, result) {
      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
              Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
            });
    });
  },
  'click #syncWithQuickBooks': function(event, template) {


    var bookingCustomer = BookingCustomers.findOne({invoiceId: Router.current().params._id});
    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
    //check customer first
    if(bookingCustomer.customerId == 0 || bookingCustomer.customerId == null) {
      IonPopup.alert({title: 'NO CUSTOMER FOUND', template: 'Need customer to generate QuickBooks invoice id.'});
    } else {
      var template;
      if(bookingStatus.quickbooksInvoiceQueryId == "Pending") {
        template = 'You will be creating a new invoice in Camwerkz. Are you <strong>really</strong> sure?';
        IonPopup.confirm({
          title: 'CREATE INVOICE',
          template: template,
          onOk: function() {
            Session.setTemp("check", true);
            Meteor.call("pendingInvoiceSync", Router.current().params._id);
            $("#syncWithQuickBooks").css('display', 'none');
            var quickbooksAttributes = {
              _id: Router.current().params._id,
              quickbooksInvoiceQueryId: bookingStatus.quickbooksInvoiceQueryId
            };

            Meteor.call('updateQuickbooksInvoice', quickbooksAttributes, function(error, result) {
            });

            Meteor.setTimeout(function(){
              if(document.getElementById("invoicestatus").innerHTML == "Pending") {
                Session.setTemp("needtoauthenticate", true);
              }
            }, 3500);
          },
          onCancel: function() {
          }
        });
      } else {
        Session.setTemp("check", true);
        Meteor.call("pendingInvoiceSync", Router.current().params._id);
        $("#syncWithQuickBooks").css('display', 'none');
        var quickbooksAttributes = {
          _id: Router.current().params._id,
          quickbooksInvoiceQueryId: bookingStatus.quickbooksInvoiceQueryId
        };

        Meteor.call('updateQuickbooksInvoice', quickbooksAttributes, function(error, result) {

        });

        Meteor.setTimeout(function(){
          if(document.getElementById("invoicestatus").innerHTML == "Pending") {
            Session.setTemp("needtoauthenticate", true);
          }
        }, 3500);
      }
    }
  },
  'click .viewSignature': function(event, template) {
    Session.setTemp("remarkSignInClicked", event.currentTarget.id);
  },
  'click .viewCustomerSignature': function(event, template) {
    Session.setTemp("remarkSignOutClicked", event.currentTarget.id);
  },
  'click .goToCustomer': function(event, template) {
    Router.go('customers.show', {_id: event.currentTarget.id}, {});
  },
  'click .goToPrivilege': function(event, template) {
    Router.go('privileges.show', {_id: event.currentTarget.id}, {});
  },
  'click #convertQuotation': function(event, template) {
    IonPopup.confirm({
      title: 'Convert to Booking',
      template: 'You will be converting this quotation into a booking. Are you <strong>really</strong> sure?',
      onOk: function() {

      Meteor.call('convertQuotationToBooking', Router.current().params._id, function(error, result) {
        IonModal.close();
        IonKeyboard.close();

        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var bookingCustomer = BookingCustomers.findOne({invoiceId: Router.current().params._id});

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " converted quotation to booking.",
          universalContent: Meteor.user().username + " converted quotation " + Router.current().params._id + " to booking.",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
        Meteor.call("insertUniversalLog", attributes);

        var attributes = {
           _id: bookingCustomer.customerId,
           content: Meteor.user().username + " converted quotation " + Router.current().params._id + " to booking.",
           ownerUsername: Meteor.user().username,
         };

         Meteor.call("insertCustomerLog", attributes);

      });
      },
      onCancel: function() {
        IonModal.close();
        IonKeyboard.close();
      }
    });
  },
  'click .editItem': function(event, template) {

    $(".itemShow_"+event.currentTarget.id).css("display", "none");
    $(".itemEdit_"+event.currentTarget.id).css("display", "");
  },
  'click .saveItem': function(event, template) {
    event.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        item: $("#item_"+event.currentTarget.id).val(),
        category: "Custom Item Rental"
    };

    Meteor.call('addCustomItem', attributes, function(error, result) {
      $(".itemShow_"+event.currentTarget.id).css("display", "");
      $(".itemEdit_"+event.currentTarget.id).css("display", "none");

      Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);

      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated custom item to " + $("#item_"+event.currentTarget.id).val() + ".",
        universalContent: Meteor.user().username + " updated custom item of " + bookingStatus.type + " " + Router.current().params._id + " to " + $("#item_"+event.currentTarget.id).val() + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .add-custom': function(event, template) {
    event.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id
    };

    Meteor.call('addQuantityToCustomBookingItem', attributes, function(error, result) {

      // if(result == "Done") {
      //   if(booking.type == "Booking") {
      //     Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      //   }
      // }


      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      });
      Meteor.call("updateBookingStatus", Router.current().params._id);

      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var bookingLineItem = BookingLineItems.findOne({_id: event.currentTarget.id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated quantity of " + bookingLineItem.item + " to " + bookingLineItem.booked + ".",
        universalContent: Meteor.user().username + " updated quantity of " + bookingLineItem.item + " of " + bookingStatus.type + " " + Router.current().params._id + " to " + bookingLineItem.booked + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .minus-custom': function(event, template) {
    
    event.preventDefault();

    if(this.booked != 0) {
      var attributes = {
          _id: Router.current().params._id,
          id: event.currentTarget.id
      };

      Meteor.call('minusQuantityToCustomBookingItem', attributes, function(error, result) {
        // if(result == "Done") {
        //   if(booking.type == "Booking") {
        //     Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        //   }
        // }
        Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        });
        Meteor.call("updateBookingStatus", Router.current().params._id);

        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var bookingLineItem = BookingLineItems.findOne({_id: event.currentTarget.id});

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " updated quantity of " + bookingLineItem.item + " to " + bookingLineItem.booked + ".",
          universalContent: Meteor.user().username + " updated quantity of " + bookingLineItem.item + " of " + bookingStatus.type + " " + Router.current().params._id + " to " + bookingLineItem.booked + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      });
    }
  },
  'click .remove-custom': function(event, template) {
    event.preventDefault();



    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id
    };

    var bookingLineItem = BookingLineItems.findOne({_id: event.currentTarget.id});

    IonPopup.show({
      title: "Remove Custom Item",
      template: "<div style='width: 100%; text-align: center;'>You are removing <strong> " + bookingLineItem.item + "</strong></div>",
      buttons: [{
          text: 'Cancel',
          type: 'button-stable',
          onTap: function() {
            IonPopup.close();
          }
        },
        {
          text: 'Remove',
          type: 'button-positive',
          onTap: function() {
            IonPopup.close();
            
            Meteor.call('removeCustomBookingItem', attributes, function(error, result) {
              // if(result == "Done") {
              //     var booking = Bookings.findOne({_id: Router.current().params._id});
              //     if(booking.type == "Booking") {
              //       Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
              //     }
              //   }
              Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
                Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
              });
              Meteor.call("updateBookingStatus", Router.current().params._id);

              var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

              var attributes = {
                _id: Router.current().params._id,
                content: Meteor.user().username + " removed " + bookingLineItem.item + ".",
                universalContent: Meteor.user().username + " removed " + bookingLineItem.item + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
                ownerUsername: Meteor.user().username,
                type: bookingStatus.type,
                url: Router.current().params._id,
                ownerId: Meteor.userId()
              };

              Meteor.call("insertLog", attributes);
              Meteor.call("insertUniversalLog", attributes);
            });
          }
        }
      ]
    });

  },
  'click .editRate': function(event, template) {

    $(".rateShow_"+event.currentTarget.id).css("display", "none");
    $(".rateEdit_"+event.currentTarget.id).css("display", "");
    $(".rateCol_"+event.currentTarget.id).css("height", "85px");
  },
  'click .saveRate': function(event, template) {

    var rate = $("#rate_"+event.currentTarget.id).val();

    if(rate == "" || rate == " " || rate == null || rate == NaN) {
      rate = 0;
    }

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        rate: rate
    };

    Meteor.call('saveCustomRate', attributes, function(error, result) {
      $(".rateShow_"+event.currentTarget.id).css("display", "");
      $(".rateEdit_"+event.currentTarget.id).css("display", "none");
      $(".rateCol_"+event.currentTarget.id).css("height", "52px");


      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      });

      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var bookingLineItem = BookingLineItems.findOne({_id: event.currentTarget.id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated rate of " + bookingLineItem.item + " to " + accounting.formatMoney(bookingLineItem.rate) + ".",
        universalContent: Meteor.user().username + " updated rate of " + bookingLineItem.item + " of " + bookingStatus.type + " " + Router.current().params._id + " to " + accounting.formatMoney(bookingLineItem.rate) + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);

    });
  },
  'click .editPrivilege': function(event, template) {

    $(".privilegeShow_"+event.currentTarget.id).css("display", "none");
    $(".privilegeEdit_"+event.currentTarget.id).css("display", "");
    $(".privilegeCol_"+event.currentTarget.id).css("height", "85px");
  },
  'click .revertPrivilege': function(event, template) {

    var originalPercentage = this.privilege.originalPercentage;

    

    IonPopup.show({
      title: 'Revert to original privilege of ' + originalPercentage + '%?',
      template: '',
      buttons: [{
        text: 'Cancel',
        type: 'button-stable',
        onTap: function() {
          IonPopup.close();
        }
      },
      {
        text: 'Revert',
        type: 'button-positive',
        onTap: function() {
          IonPopup.close();
          var attributes = {
              _id: Router.current().params._id,
              id: event.currentTarget.id,
              percentage: originalPercentage
          };

          Meteor.call('revertPrivilege', attributes, function(error, result) {

            Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
              Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
            });
          });
        }
      }
      ]
    });


  },
  'click .savePrivilege': function(event, template) {
    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        privilegeValue: $(".privilegeEdit_"+event.currentTarget.id).val()
    };

    Meteor.call('savePrivilege', attributes, function(error, result) {
      $(".privilegeShow_"+event.currentTarget.id).css("display", "");
      $(".privilegeEdit_"+event.currentTarget.id).css("display", "none");
      $(".privilegeCol_"+event.currentTarget.id).css("height", "52px");

      // if(result == "Done") {
      //   var booking = Bookings.findOne({_id: Router.current().params._id});
      //   if(booking.type == "Booking") {
      //     Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      //   }
      // }

      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      });
    });
  },
  'click .editDiscount': function(event, template) {

    

    $(".discountShow_"+event.currentTarget.id).css("display", "none");
    $(".discountEdit_"+event.currentTarget.id).css("display", "");
    $(".discountCol_"+event.currentTarget.id).css("height", "85px");
  },
  'click .saveDiscount': function(event, template) {

    var discount = $("#discount_"+event.currentTarget.id).val();

    if(discount == "" || discount == " " || discount == null || discount == NaN) {
      discount = 0;
    }

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        discount: discount
    };

    Meteor.call('saveDiscount', attributes, function(error, result) {
      $(".discountShow_"+event.currentTarget.id).css("display", "");
      $(".discountEdit_"+event.currentTarget.id).css("display", "none");
      $(".discountCol_"+event.currentTarget.id).css("height", "52px");

      // if(result == "Done") {
      //   var booking = Bookings.findOne({_id: Router.current().params._id});
      //   if(booking.type == "Booking") {
      //     Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      //   }
      // }

      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      });

      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var bookingLineItem = BookingLineItems.findOne({_id: event.currentTarget.id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated discount of " + bookingLineItem.item + " to " + accounting.formatMoney(bookingLineItem.discountOverwrite) + ".",
        universalContent: Meteor.user().username + " updated discount of " + bookingLineItem.item + " of " + bookingStatus.type + " " + Router.current().params._id + " to " + accounting.formatMoney(bookingLineItem.discountOverwrite) + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .saveNormalDiscount': function(event, template) {
    var discount = $("#discount_"+event.currentTarget.id).val();

    if(discount == "" || discount == " " || discount == null || discount == NaN) {
      discount = 0;
    }

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        discount: discount
    };

    Meteor.call('saveNormalDiscount', attributes, function(error, result) {
      $(".discountShow_"+event.currentTarget.id).css("display", "");
      $(".discountEdit_"+event.currentTarget.id).css("display", "none");
      $(".discountCol_"+event.currentTarget.id).css("height", "52px");

      // if(result == "Done") {
      //   var booking = Bookings.findOne({_id: Router.current().params._id});
      //   if(booking.type == "Booking") {
      //     Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      //   }
      // }


      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      });

      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var bookingLineItem = BookingLineItems.findOne({_id: event.currentTarget.id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated discount for " + bookingLineItem.brand + " " + bookingLineItem.item + " to " + accounting.formatMoney($("#discount_"+event.currentTarget.id).val()) + ".",
        universalContent: Meteor.user().username + " updated discount for " + bookingLineItem.brand + " " + bookingLineItem.item + " of " + bookingStatus.type + " " + Router.current().params._id + " to " + accounting.formatMoney($("#discount_"+event.currentTarget.id).val()) + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click [data-action="selectResolve"]': function(event, template) {
    IonPopup.show({
      title: 'What to do?',
      template: '',
      buttons: [{
        text: 'Cancel',
        type: 'button-stable',
        onTap: function() {
          IonPopup.close();
        }
      },
      {
        text: 'Resolve',
        type: 'button-positive',
        onTap: function() {
          IonPopup.close();
          var attributes = {
            _id: Router.current().params._id,
            remarkId: event.currentTarget.id
          };

          Meteor.call('updateResolution', attributes, function(error, result) {
            Meteor.call("updateBookingStatus", Router.current().params._id);

            var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

            var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});

            var remark = bookingAcknowledgeRemark.remarksRequiringAcknowledgement[event.currentTarget.id];

            var attributes = {
              _id: Router.current().params._id,
              content: Meteor.user().username + " resolved remark: " + remark.remark + ".",
              universalContent: Meteor.user().username + " resolved remark: " + remark.remark + " of " + bookingStatus.type + " " + Router.current().params._id + ".",
              ownerUsername: Meteor.user().username,
              type: bookingStatus.type,
              url: Router.current().params._id,
              ownerId: Meteor.userId()
            };

            Meteor.call("insertLog", attributes);
            Meteor.call("insertUniversalLog", attributes);
          });
        }
      }
      ]
    });
    $(".popup-body").css("display", "none");
  },
  'click .linkedInvoice': function(e) {
    Router.go('bookings.show', {_id: e.currentTarget.id}, {});
  },
  'click #saveCustomerName': function(e) {

    var customer = Customers.findOne({_id: $("#customerSearch2").val()});
    var booking = Bookings.findOne({_id: Router.current().params._id});

    var customerId = $("#customerSearch2").val();

    var attributes = {
      _id: Router.current().params._id,
      customerId: customerId
    };

    Meteor.call('updateCustomerName', attributes, function(error, result) {
      $("#selectCustomerName").css("display", "none");
      $("#showCustomerName").css("display", "block");
      // $("#customerName").css("height", "142px");

      // if(booking.type == "Booking") {
      //   Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      // }

        Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
              Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
            });
      
    });
  },
  'click .searchedCustomer': function(e) {


    var customerArray = Session.get("listOfCustomers");
    customerArray.push(e.currentTarget.id);
    Session.setTemp("listOfCustomers", customerArray);

    $("div#"+e.currentTarget.id).css("background-color", "rgba(0, 0, 0, 0.05)");

    var attributes = {
      _id: Router.current().params._id,
      customerId: e.currentTarget.id
    };

    Meteor.call('updateBookingCustomerName', attributes, function(error, result) {
      $("#selectCustomerName").css("display", "none");
      $("#showCustomerName").css("display", "block");

      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);

        var customer = Customers.findOne({_id: e.currentTarget.id});

        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " updated customer name to " + customer.name + ".",
          universalContent: Meteor.user().username + " updated customer name of " + bookingStatus.type + " " + Router.current().params._id + " to " + customer.name + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      });
    });
  },
  'click #confirmBooking': function(e) {

    var booking = Bookings.findOne({_id: Router.current().params._id});
    var customer = Customers.findOne({_id: booking.customerId});
    var invoiceAttributes = {
      _id: Router.current().params._id,
      customerQuickBooksId: customer.quickbooksId
    };

    Meteor.call('createQuickbooksInvoice', invoiceAttributes, function(error, result) {



      IonModal.close();
      IonKeyboard.close();
    });
  },
  'click #cancelCustomerName': function(e) {
    $("#selectCustomerName").css("display", "none");
    $("#showCustomerName").css("display", "block");
    // $("#customerName").css("height", "140px");
  },
  'click #editCustomerName': function(e) {
    $("#selectCustomerName").css("display", "block");
    $("#showCustomerName").css("display", "none");
    // $("#customerName").css("height", "157px");
  },
  'click #editProjectName': function(e) {
    $("#showProjectNameInput").css("display", "block");
    $("#showProjectName").css("display", "none");
  },
  'click #saveProjectName': function(e) {
    e.preventDefault();

    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

    var attributes = {
      _id: Router.current().params._id,
      projectName: $("#projectNameInput").val()
    };

    Meteor.call('updateBookingProjectName', attributes, function(error, result) {
      $("#showProjectNameInput").css("display", "none");
      $("#showProjectName").css("display", "block");

      Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " updated project name to " + $("#projectNameInput").val() + ".",
        universalContent: Meteor.user().username + " updated project name of " + bookingStatus.type + " " + Router.current().params._id + " to " + $("#projectNameInput").val() + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);


    });
  },
  'click #recordPayment': function(e) {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    Session.setTemp("balanceDue", booking.balanceDue);
    Session.setTemp("originalBalanceDue", booking.balanceDue);
  },
  'click #cancelProjectName': function(e) {
    e.preventDefault();
    $("#showProjectNameInput").css("display", "none");
    $("#showProjectName").css("display", "block");
  },
  'click .addBookingItem': function(e) {
    e.preventDefault();

    Session.setTemp("bookingGroupClicked", e.currentTarget.id);
    Router.go('bookingsAddBookingItems', {_id: Router.current().params._id}, {});
  },
  'click #cancelBooking': function(e) {
    e.preventDefault();
  },
  'click .status': function(e) {
    //Session.setTemp("itemSelected", e.currentTarget.id);
    Session.setTemp("events", []);
    var string = e.currentTarget.id;

    var clashCalendarArray = string.split(",");

    Session.setTemp("invoiceClicked", Router.current().params._id);

    Session.setTemp("bookingLineItemClicked", clashCalendarArray[0]);
    Session.setTemp("clashCalendarArray", clashCalendarArray);

    clashCalendarArray.shift();


    Router.go("clashCalendars");
  },
  'click [data-action="showAcknowledgeRemarkDeleteConfirm"]': function(event, template) {

    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});

    var remark = bookingAcknowledgeRemark.remarksRequiringAcknowledgement[event.currentTarget.id];

    IonPopup.confirm({
      title: 'Delete Remark',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {

        var attributes = {
          _id: Router.current().params._id,
          remarkId: event.currentTarget.id
        };

        Meteor.call('deleteAcknowledgeRemark', attributes, function(error, result) {
          IonModal.close();
          IonKeyboard.close();

          var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

          var attributes = {
            _id: Router.current().params._id,
            content: Meteor.user().username + " removed remark: " + remark.remark + ".",
            universalContent: Meteor.user().username + " removed remark: " + remark.remark + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
            ownerUsername: Meteor.user().username,
            type: bookingStatus.type,
            url: Router.current().params._id,
            ownerId: Meteor.userId()
          };

          Meteor.call("insertLog", attributes);
          Meteor.call("insertUniversalLog", attributes);

          Meteor.call("updateBookingStatus", Router.current().params._id);
        });
      },
      onCancel: function() {
        IonModal.close();
        IonKeyboard.close();
      }
    });
  },
  'click [data-action="commentDeleteConfirm"]': function(event, template) {

    var string = event.currentTarget.id.split("_");
    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});
    var remark = bookingAcknowledgeRemark.remarksRequiringAcknowledgement[string[0]].remark;
    var comment = bookingAcknowledgeRemark.remarksRequiringAcknowledgement[string[0]].comments[string[1]].comment;

    IonPopup.confirm({
      title: 'Delete Comment',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {

        var attributes = {
          _id: Router.current().params._id,
          remarkId: string[0],
          commentId: string[1],
        };

        Meteor.call('deleteComment', attributes, function(error, result) {
          IonModal.close();
          IonKeyboard.close();

          

          var attributes = {
            _id: Router.current().params._id,
            content: Meteor.user().username + " removed comment: " + comment + " from remark: " + remark + ".",
            universalContent: Meteor.user().username + " removed comment: " + comment + " from remark: " + remark + " of " + bookingStatus.type + " " + Router.current().params._id + ".",
            ownerUsername: Meteor.user().username,
            type: bookingStatus.type,
            url: Router.current().params._id,
            ownerId: Meteor.userId()
          };

          Meteor.call("insertLog", attributes);
          Meteor.call("insertUniversalLog", attributes);
        });
      },
      onCancel: function() {
        IonModal.close();
        IonKeyboard.close();
      }
    });
  },
  'click #createInvoice': function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    var customerDetails = new Object();
    customerDetails.id = booking.customerId;
    customerDetails.name = booking.customerName;
    customerDetails.company = booking.customerCompany;
    customerDetails.number = booking.customerNumber;
    customerDetails.email = booking.customerEmail;



    Meteor.call('addInvoiceBooking', customerDetails, function(error, result) {
      Router.go('bookings.show', {_id: result});
    });
  },
  'click [data-action="showDeleteConfirm"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Booking',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
        var bookingCustomer = BookingCustomers.findOne({invoiceId: Router.current().params._id});
        var bookingLineItems = BookingLineItems.find({invoiceId: Router.current().params._id}).fetch();
        
        Meteor.call('removeInvoiceNeedingUpdate', Router.current().params._id);

        if(bookingStatus.affectedItems != undefined && bookingStatus.affectedItems.length > 0) {
          var attributes9 = {
              bookingLineItems: bookingLineItems,
              groupId: -1
          };

          Meteor.call('removeAffectedItemsGroup', attributes9, function(error, result) {
            if(bookingStatus.type == "Quotation") {
              Meteor.call('deleteBooking', Router.current().params._id, function(error, result) {
                   var attributes = {
                     _id: bookingCustomer.customerId,
                     content: Meteor.user().username + " deleted quotation " + result + ".",
                     ownerUsername: Meteor.user().username,
                   };

                   Meteor.call("insertCustomerLog", attributes);
              });

             Router.go('customers.show', {_id: bookingCustomer.customerId}, {});
            } else if(bookingStatus.type == "Booking" && bookingStatus.quickbooksInvoiceQueryId == "Pending") {
              Meteor.call('deleteBooking', Router.current().params._id, function(error, result) {
                  var attributes = {
                    _id: bookingCustomer.customerId,
                    content: Meteor.user().username + " deleted booking " + result + ".",
                    ownerUsername: Meteor.user().username,
                  };

                  Meteor.call("insertCustomerLog", attributes);
              });

              Router.go('customers.show', {_id: bookingCustomer.customerId}, {});
            } else if(bookingStatus.type == "Booking" && bookingStatus.quickbooksInvoiceQueryId != "Pending") {
              Meteor.call('voidBooking', Router.current().params._id, function(error, result) {

                console.log("inside voidbooking in bookingshow");
                console.log(result);

                var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

                if(result) {
                  var quickbooksAttributes = {
                    _id: Router.current().params._id,
                    quickbooksInvoiceQueryId: bookingStatus.quickbooksInvoiceQueryId
                  };

                  Meteor.call('updateQuickbooksInvoice', quickbooksAttributes, function(error, result) {
                    Meteor.call("updateBookingStatus", Router.current().params._id);
                  });

                  Meteor.setTimeout(function(){
                    if(document.getElementById("invoicestatus").innerHTML == "Pending") {
                      Session.setTemp("needtoauthenticate", true);
                    }
                  }, 3500);
                }
                
                var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

                var attributes = {
                  _id: Router.current().params._id,
                  content: Meteor.user().username + " voided booking.",
                  universalContent: Meteor.user().username + " voided booking " + Router.current().params._id + ".",
                  ownerUsername: Meteor.user().username,
                  type: bookingStatus.type,
                  url: Router.current().params._id,
                  ownerId: Meteor.userId()
                };

                Meteor.call("insertLog", attributes);
                Meteor.call("insertUniversalLog", attributes);

                console.log("before window open");

                window.open('http://192.168.1.177:5000/void-invoice?id='+bookingStatus.quickbooksInvoiceQueryId, '_blank');
              });
            }
          });
        } else {
          if(bookingStatus.type == "Quotation") {
            Meteor.call('deleteBooking', Router.current().params._id, function(error, result) {
                 var attributes = {
                   _id: bookingCustomer.customerId,
                   content: Meteor.user().username + " deleted quotation " + result + ".",
                   ownerUsername: Meteor.user().username,
                 };

                 Meteor.call("insertCustomerLog", attributes);
            });

           Router.go('customers.show', {_id: bookingCustomer.customerId}, {});
          } else if(bookingStatus.type == "Booking" && bookingStatus.quickbooksInvoiceQueryId == "Pending") {
            Meteor.call('deleteBooking', Router.current().params._id, function(error, result) {
                var attributes = {
                  _id: bookingCustomer.customerId,
                  content: Meteor.user().username + " deleted booking " + result + ".",
                  ownerUsername: Meteor.user().username,
                };

                Meteor.call("insertCustomerLog", attributes);
            });

            Router.go('customers.show', {_id: bookingCustomer.customerId}, {});
          } else if(bookingStatus.type == "Booking" && bookingStatus.quickbooksInvoiceQueryId != "Pending") {
            Meteor.call('voidBooking', Router.current().params._id, function(error, result) {

              console.log("inside voidbooking in bookingshow");
              console.log(result);

              Meteor.call('checkInvoiceNeedingUpdateVoid', Router.current().params._id);
              
              var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

              var attributes = {
                _id: Router.current().params._id,
                content: Meteor.user().username + " voided booking.",
                universalContent: Meteor.user().username + " voided booking " + Router.current().params._id + ".",
                ownerUsername: Meteor.user().username,
                type: bookingStatus.type,
                url: Router.current().params._id,
                ownerId: Meteor.userId()
              };

              Meteor.call("insertLog", attributes);
              Meteor.call("insertUniversalLog", attributes);

              window.open('http://192.168.1.177:5000/void-invoice?id='+bookingStatus.quickbooksInvoiceQueryId, '_blank');
            });
          }
        }
        
        
      },
      onCancel: function() {
      }
    });
  },
  'click .dots': function(e) {
    e.preventDefault();
  },
  'click .equipment' : function(e) {

    var string = e.currentTarget.id.split("_");

    Session.setTemp("bookingLineItemSelected", string[1]);
    Session.setTemp("bookingGroupSelected", string[0]);

    Router.go('bookingsSerialNoSelect', {_id: Router.current().params._id}, {});
  },
  'click .removePayment': function(e) {
    e.preventDefault();
    var obj = new Object();
    obj._id = Router.current().params._id;
    obj.paymentId = e.currentTarget.id;

    var bookingPrice = BookingPrices.findOne({invoiceId: Router.current().params._id});

    var price = bookingPrice.payment[e.currentTarget.id];

    Meteor.call('deletePayment', obj, function(error, result) {
      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
      var attributes;

      if(price.serialNo == undefined) {
        attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " removed " + price.type + " payment of " + accounting.formatMoney(price.amount) + ".",
          universalContent: Meteor.user().username + " removed " + price.type + " payment of " + accounting.formatMoney(price.amount) + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };
      } else {
        attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " removed " + price.type + " serial no: " + price.serialNo + " payment of " + accounting.formatMoney(price.amount) + ".",
          universalContent: Meteor.user().username + " removed " + price.type + " serial no: " + price.serialNo + " payment of " + accounting.formatMoney(price.amount) + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };
      }

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .removeRemark': function(e) {
    e.preventDefault();
    var obj = new Object();
    obj.current = Router.current().params._id;
    obj.remarkId = e.currentTarget.id;

    var bookingGeneralRemark = BookingGeneralRemarks.findOne({invoiceId: Router.current().params._id});

    var remark = bookingGeneralRemark.remarks[e.currentTarget.id];

    Meteor.call('deleteRemark', obj, function(error, result) {
      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " removed remark: " + remark.remark + ".",
        universalContent: Meteor.user().username + " removed remark: " + remark.remark + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });
  },
  'click .addBookingDates': function(e) {
    e.preventDefault();

    Session.setPersistent("bookingGroupClicked", e.currentTarget.id);
    Router.go('bookingsAddBookingDates', {_id: Router.current().params._id}, {});
  },
  'click .itemCheckbox': function(e) {
    var string = e.currentTarget.id.split("-");
    if(string[1] == "out") {
      document.getElementById(string[0]+"-back").checked=false;
    } else {
      document.getElementById(string[0]+"-out").checked=false;
    }

    var attributes = {
      _id: Router.current().params._id,
      id: string[0],
      availability: string[1]
    };

    Meteor.call('updateAvailability', attributes, function(error,result) {

    });
  },
  'click #title': function(e) {
    e.preventDefault();
  },
  'keyup #remark': function(e) {
    if($("#remark").val() != "") {
      Session.setTemp("remarkButton", "able");
    } else {
      Session.setTemp("remarkButton", "disabled");
    }
  },
  'click .remove': function(e) {
    e.preventDefault();

    var bookingLineItem = BookingLineItems.findOne({_id: e.currentTarget.id});

    var inventoryItem = Inventory.findOne({_id: bookingLineItem.itemId});

    var tempbrand = "";
    var tempitem = "";

  if(inventoryItem != undefined) {
    tempbrand = inventoryItem.brand;
    tempitem = inventoryItem.item;
  }

    IonPopup.show({
      title: "Remove Item",
      template: "<div style='width: 100%; text-align: center;'>You are removing <strong>" + tempbrand + " " + tempitem + "</strong></div>",
      buttons: [{
          text: 'Cancel',
          type: 'button-stable',
          onTap: function() {
            IonPopup.close();
          }
        },
        {
          text: 'Remove',
          type: 'button-positive',
          onTap: function() {
            IonPopup.close();
            var attributes = {
                _id: Router.current().params._id,
                id: e.currentTarget.id
            };

            Meteor.call('removeBookingLineItem', attributes, function(error, result) {

              Meteor.call('removeAffectedItems', bookingLineItem);

              Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
                Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
              });
              Meteor.call("updateBookingStatus", Router.current().params._id);

              var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

              var attributes = {
                _id: Router.current().params._id,
                content: Meteor.user().username + " removed " + bookingLineItem.brand + " " + bookingLineItem.item + ".",
                universalContent: Meteor.user().username + " removed " + bookingLineItem.brand + " " + bookingLineItem.item + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
                ownerUsername: Meteor.user().username,
                type: bookingStatus.type,
                url: Router.current().params._id,
                ownerId: Meteor.userId()
              };

              Meteor.call("insertLog", attributes);
              Meteor.call("insertUniversalLog", attributes);
            });
          }
        }
      ]
    });
    
  },
  'click .removeGroup': function(e) {
    e.preventDefault();

    var booking = Bookings.findOne({_id: Router.current().params._id});
    var groupId = this.groupId;

    var bookingLineItems = BookingLineItems.find({invoiceId: booking._id, groupCounter: parseInt(groupId)}).fetch();

    IonPopup.show({
      title: "Remove Group",
      template: "<div style='width: 100%; text-align: center;'>You are removing <strong> Group " + (parseInt(groupId) + 1) + "</strong></div>",
      buttons: [{
          text: 'Cancel',
          type: 'button-stable',
          onTap: function() {
            IonPopup.close();
          }
        },
        {
          text: 'Remove',
          type: 'button-positive',
          onTap: function() {
            IonPopup.close();
            var attributes = {
                _id: Router.current().params._id,
                id: groupId
            };

            var attributes9 = {
                bookingLineItems: bookingLineItems,
                groupId: parseInt(groupId)
            };

            Meteor.call('removeAffectedItemsGroup', attributes9);

            Meteor.call('removeBookingGroup', attributes, function(error, result) {
                

                  var attributes2 = {
                      _id: Router.current().params._id,
                      id: groupId,
                      dates: Session.get("arrayOfDateObjects"),
                      originalBooking: booking
                  };

                  Meteor.call('updateBookingDates', Router.current().params._id);
                  Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
                      Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
                    });
                  Meteor.call("updateBookingStatus", Router.current().params._id);

                  var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

                  var attributes = {
                    _id: Router.current().params._id,
                    content: Meteor.user().username + " removed group " + (parseInt(groupId) + 1) + ".",
                    universalContent: Meteor.user().username + " removed group " + (parseInt(groupId) + 1) + " from " + bookingStatus.type + " " + Router.current().params._id + ".",
                    ownerUsername: Meteor.user().username,
                    type: bookingStatus.type,
                    url: Router.current().params._id,
                    ownerId: Meteor.userId()
                  };

                  Meteor.call("insertLog", attributes);
                  Meteor.call("insertUniversalLog", attributes);
                });

          }
        }
      ]
    });

    
  },
  'click .add': function(e) {
    e.preventDefault();

    // var string = e.currentTarget.id.split("_");
    // var booking = Bookings.findOne({_id: Router.current().params._id});
    // var attributes = {
    //     _id: Router.current().params._id,
    //     id: e.currentTarget.id,
    //     dates: booking.equipmentDetails[string[0]].dates
    // };

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    Meteor.call('addQuantityToBookingLineItem', attributes, function(error, result) {
      if(result.status == "BookedEqualsTotal") {

      } else if(result.status == "Overbooked") {

        var string = "";
        for(x in result['dates']) {
          string = string.concat("<li>"+result['dates'][x]+"</li>");
        }
        IonPopup.show({
          title: result['inventoryItem'].brand + " " + result['inventoryItem'].item + " maxed out.",
          template: "<div style='width: 100%; text-align: center;'><ul>"+string+"</ul></div>",
          buttons: [{
            text: 'OK',
            type: 'button-stable',
            onTap: function() {
              IonPopup.close();
            }
          },
          {
            text: 'View Calendar',
            type: 'button-positive',
            onTap: function() {
              IonPopup.close();
              var equipments = [];
              equipments.push(result['inventoryItem']._id);
              Session.setTemp('dates', result['datesDigits']);
              Session.setTemp('equipments', equipments);

              Router.go('overbookedCalendars', {}, {});
            }
          }
          ]
        });
      } else {
        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var bookingLineItem = BookingLineItems.findOne({_id: e.currentTarget.id});

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " updated quantity of " + bookingLineItem.brand + " " + bookingLineItem.item + " to " + bookingLineItem.booked + ".",
          universalContent: Meteor.user().username + " updated quantity of " + bookingLineItem.brand + " " + bookingLineItem.item + " of " + bookingStatus.type + " " + Router.current().params._id + " to " + bookingLineItem.booked + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
        // Meteor.subscribe("equipmentcalendarsbybooking", Router.current().params._id);
      }

      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      });

     Meteor.call("updateBookingStatus", Router.current().params._id);
    });

  },
  'click .minus': function(e) {
    e.preventDefault();
    // var booking = Bookings.findOne({_id: Router.current().params._id});
    // var string = e.currentTarget.id.split("_");

    // var attributes = {
    //     _id: Router.current().params._id,
    //     id: e.currentTarget.id,
    //     dates: booking.equipmentDetails[string[0]].dates
    // };

    // Meteor.call('minusQuantityToBookingItem', attributes, function(error, result) {
    //   if(result == "Done") {
    //     if(booking.type == "Booking") {
    //       Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
    //     }
    //   }
    // });

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    var bookingLineItemFor = BookingLineItems.findOne({_id: e.currentTarget.id});

    Meteor.call('minusQuantityToBookingLineItem', attributes, function(error, result) {
      //activateSpinner(e.currentTarget.id);
      var minusObject = new Object();
      minusObject.bookingLineItem = bookingLineItemFor;
      if(result != undefined) {
        minusObject.serialNo = result.serialNo; 
      }

      // Meteor.call('minusAffectedItem', minusObject);
      Meteor.call("updateOverallBookingPrice", Router.current().params._id, function(error, result) {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);

        var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

        var bookingLineItem = BookingLineItems.findOne({_id: e.currentTarget.id});

        var attributes = {
          _id: Router.current().params._id,
          content: Meteor.user().username + " updated quantity of " + bookingLineItem.brand + " " + bookingLineItem.item + " to " + bookingLineItem.booked + ".",
          universalContent: Meteor.user().username + " updated quantity of " + bookingLineItem.brand + " " + bookingLineItem.item + " of " + bookingStatus.type + " " + Router.current().params._id + " to " + bookingLineItem.booked + ".",
          ownerUsername: Meteor.user().username,
          type: bookingStatus.type,
          url: Router.current().params._id,
          ownerId: Meteor.userId()
        };

        Meteor.call("insertLog", attributes);
        Meteor.call("insertUniversalLog", attributes);
      });
      Meteor.call("updateBookingStatus", Router.current().params._id);
    });
  },
  'click #addGroup': function(e) {
    e.preventDefault();

    Meteor.call('addGroup', Router.current().params._id, function(error, result) {
      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " added group " + result + ".",
        universalContent: Meteor.user().username + " added group " + result + " to " + bookingStatus.type + " " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });

    
  },
  'click #addRemark': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        remark: $("#remark").val()
    };

    var remark =  $("#remark").val();

    Meteor.call('addBookingRemark', attributes, function(error, result) {
      var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " added remark: " + remark + ".",
        universalContent: Meteor.user().username + " added remark: " + remark + " to " + bookingStatus.type + " " + Router.current().params._id + ".",
        ownerUsername: Meteor.user().username,
        type: bookingStatus.type,
        url: Router.current().params._id,
        ownerId: Meteor.userId()
      };

      Meteor.call("insertLog", attributes);
      Meteor.call("insertUniversalLog", attributes);
    });

    $("#remark").val("");
    Session.setTemp("remarkButton", "disabled");
  },
  'click .remark': function(e) {

    var bookingGeneralRemarks = BookingGeneralRemarks.findOne({invoiceId: Router.current().params._id});

    var remarks = bookingGeneralRemarks.remarks;

    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        remarks[e.currentTarget.id]['status'] = "Close";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateBookingRemark', itemAttributes, function(error, result) {
          var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

          var remark = remarks[e.currentTarget.id];

          var attributes = {
            _id: Router.current().params._id,
            content: Meteor.user().username + " updated status of remark: " + remark.remark + " to done.",
            universalContent: Meteor.user().username + " updated status of remark: " + remark.remark + " of " + bookingStatus.type + " " + Router.current().params._id + " to done.",
            ownerUsername: Meteor.user().username,
            type: bookingStatus.type,
            url: Router.current().params._id,
            ownerId: Meteor.userId()
          };

          Meteor.call("insertLog", attributes);
          Meteor.call("insertUniversalLog", attributes);
        });
      } else {
        remarks[e.currentTarget.id]['status'] = "Open";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateBookingRemark', itemAttributes, function(error, result) {
          var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});

          var remark = remarks[e.currentTarget.id];

          var attributes = {
            _id: Router.current().params._id,
            content: Meteor.user().username + " updated status of remark: " + remark.remark + " to undone.",
            universalContent: Meteor.user().username + " updated status of remark: " + remark.remark + " of " + bookingStatus.type + " " + Router.current().params._id + " to undone.",
            ownerUsername: Meteor.user().username,
            type: bookingStatus.type,
            url: Router.current().params._id,
            ownerId: Meteor.userId()
          };

          Meteor.call("insertLog", attributes);
          Meteor.call("insertUniversalLog", attributes);
        });
      }
    }
  },
  'click .remarkSignOut': function(e) {



    Session.setTemp("remarkSignOutClicked", e.currentTarget.id);
  },
  'click .remarkSignIn': function(e) {

    Session.setTemp("remarkSignInClicked", e.currentTarget.id);
  },
  'click .remarkAcknowledge': function(e) {

    Session.setTemp("remarkAcknowledgeClicked", e.currentTarget.id);

    // var bookingAcknowledgeRemarks = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});
    // var remarksRequiringAcknowledgement = bookingAcknowledgeRemarks.remarksRequiringAcknowledgement;

    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var remarksAcknowledgeId = Session.get("remarksAcknowledgeId");
        remarksAcknowledgeId.push(e.currentTarget.id);
        Session.setTemp("remarksAcknowledgeId", remarksAcknowledgeId);
      } else {
        var remarksAcknowledgeId = Session.get("remarksAcknowledgeId");
        for(x in remarksAcknowledgeId) {
          if(remarksAcknowledgeId[x] == e.currentTarget.id) {
            remarksAcknowledgeId.splice(x, 1);
          }
        }
        Session.setTemp("remarksAcknowledgeId", remarksAcknowledgeId);
      }
    }
  }
});

activateSpinner = function(id) {
  $("#spinner_"+id).css("display", "");
}

deactivateSpinner = function(id) {
  $("#spinner_"+id).css("display", "none");
}