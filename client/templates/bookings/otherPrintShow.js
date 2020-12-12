var customers;
var wrapper,
  clearButton,
  saveButton,
  canvas,
  signaturePad;

Template.otherPrintShow.created = function () {
  this.subscribe('meteorUsers');
  // Meteor.subscribe('bookings');
  this.subscribe('invoiceNeedingUpdateByBooking', Router.current().params._id);
  this.subscribe('thisUsers');
  this.subscribe('other', Router.current().params._id);
  this.subscribe('customerByOther', Router.current().params._id);
};

Template.otherPrintShow.rendered = function () {
};

Template.otherPrintShow.helpers({
  quickbooksInvoiceId: function() {
    return Others.findOne({_id: Router.current().params._id}).quickbooksInvoiceId;
  },
  bookingLineItems: function() {
    return BookingLineItems.find({invoiceId:Router.current().params._id, groupCounter: this.groupId}, {sort: {sortNumber: 1}});
  },
  customerSignOutExists: function() {
    return (Others.findOne({_id: Router.current().params._id}).customerSignOut.length > 0);
  },
  staffSignInExists: function() {
    var bookingSignIn = BookingSignIns.findOne({invoiceId: Router.current().params._id});

    if(bookingSignIn.staffSignIn.length > 0) {
      return true;
    } else {
      return false;
    }
  },
  custom: function() {
    return (this.total == -1);
  },
  selectedEquipment: function() {
    return Session.get("equipmentSelected");
  },
  isDamaged: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Damaged");
      }
    }
  },
  isMissing: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Missing");
      }
    }
  },
  isOut: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Out");
      }
    }
  },
  isIn: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "In");
      }
    }
  },
  isPacked: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "Packed");
      }
    }
  },
  isNA: function() {
    var serialNoArray = Session.get("serialNoArray");
    for(x in serialNoArray) {
      if(serialNoArray[x].serialNo == this.serialNo) {
        return (serialNoArray[x].status == "N/A");
      }
    }
  },
  serialNumbers: function() {
    return Session.get("serialNoArray");
  },
  serialNumbersSigned: function() {
    return this.serialNumbers;
  },
  remarksExist: function() {
    if(this.remarkCount != 0) {
      return true;
    } else {
      return false;
    }
  },
  remarkOpen: function() {
    if(this.status == "Open") {
      return true;
    } else {
      return false;
    }
  },
  textDecoration: function() {
    if(this.status == "Open") {
      return "";
    } else {
      return "line-through";
    }
  },
  clippedCategory: function() {
    return (this.category.charAt(0));
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
    if(this.category == "Custom Item Rental") {
      return "#35203B";
    } 
  },
  customerAddress: function() {
    return (Customers.findOne({_id: this.customerId}).address);
  },
  itemsSigned: function() {

    console.log("inside itemsSigned");
    console.log(this);
    
    var itemArrayToReturn = [];
    var itemIds = [];

    for(x in this.items) {
     if(itemIds.indexOf(this.items[x].itemId) == -1) {
      var itemObject = new Object();
      itemIds.push(this.items[x].itemId);

      itemObject.serialNumbers = "";
      if(Inventory.findOne({_id: this.items[x].itemId}) == undefined) {
        itemObject.itemName = this.items[x].item;
      } else {
        itemObject.itemName = Inventory.findOne({_id: this.items[x].itemId}).brand + " " + Inventory.findOne({_id: this.items[x].itemId}).item;
        itemObject.serialNumbers = this.items[x].serialNo;
      }
      itemArrayToReturn.push(itemObject);
     } else {
      var itemObject = new Object();
      if(Inventory.findOne({_id: this.items[x].itemId}) == undefined) {
        itemObject.itemName = this.items[x].item;
      } else {
        itemObject.itemName = Inventory.findOne({_id: this.items[x].itemId}).brand + " " + Inventory.findOne({_id: this.items[x].itemId}).item;
      }
      

      for(y in itemArrayToReturn) {
        if(itemArrayToReturn[y].itemName == itemObject.itemName) {
          itemArrayToReturn[y].serialNumbers = itemArrayToReturn[y].serialNumbers + ", " + this.items[x].serialNo;
        }
      }
     }
    }

    console.log(itemArrayToReturn);

    return itemArrayToReturn;
  },
  // itemsSerial: function() {



  //   var booking = Bookings.findOne({_id: Router.current().params._id}); 
        


  //       var itemsArray = [];

  //     for(x in booking.equipmentDetails) {
  //       for(y in booking.equipmentDetails[x].items) {
  //           itemsArray.push(booking.equipmentDetails[x].items[y]);
  //       }
  //     }

  //     console.log(itemsArray);

  //     return itemsArray;
  // },
  isDamaged: function() {
    return (this.status == "Damaged");
  },
  isMissing: function() {
    return (this.status == "Missing");
  },
  isOut: function() {
    return (this.status == "Out");
  },
  isIn: function() {
    return (this.status == "In");
  },
  isPacked: function() {
    return (this.status == "Packed");
  },
  isNA: function() {
    return (this.status == "N/A");
  },
  groupId: function() {
    return (parseInt(this.groupId) + 1);
  },
  groupCounter: function() {
    var string = this.id.split("_");
    return (parseInt(string[0]) + 1);
  },
  groupId2: function() {
    console.log(this);
    return (parseInt(this.groupId) + 1);
  },
  noOfItems: function() {
    return this.booked;
  },
  brand2: function() {

  },
  checkboxChecked: function() {
    
    var booking = Bookings.findOne({_id: Router.current().params._id});
    for(x in booking.equipmentDetails[Session.get("equipmentGroup")].items) {
      if(booking.equipmentDetails[Session.get("equipmentGroup")].items[x].itemId == Session.get("equipmentSelectedId")) {
        for(y in booking.equipmentDetails[Session.get("equipmentGroup")].items[x].clashableSerialNumbers) {
          if(booking.equipmentDetails[Session.get("equipmentGroup")].items[x].clashableSerialNumbers[y].serialNo == this.serialNo) {
            return true;
          }
        }
        for(y in booking.equipmentDetails[Session.get("equipmentGroup")].items[x].unclashableSerialNumbers) {
          if(booking.equipmentDetails[Session.get("equipmentGroup")].items[x].unclashableSerialNumbers[y].serialNo == this.serialNo) {
            return true;
          }
        }

        break;
      }
    }
  },
  displayCheckbox: function() {
    var statuses = ["Sent For Repair", "Waiting To Be Sent For Repair", "Missing", "Damaged"];
    if(!(statuses.indexOf(this.status) != -1)) {
      return "visible";
    } else {
      return "hidden";
    }
  },
  serialNo: function() {
    return this.serialNo;
  },
  groups: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    return booking.equipmentDetails;
  },
  toSetId: function() {
    var string = this.id.split("_");
    Session.setTemp("groupId", string[0]);
    Session.setTemp("itemId", this.itemId);
  },





  searchedCustomers: function() {
    if(Session.get('searchCustomerQuery')) {
      return Customers.search(Session.get('searchCustomerQuery'));
    } 
    if(Session.get('searchCustomerNumberQuery')) {
      
      return Customers.numberSearch(Session.get('searchCustomerNumberQuery'));
    } 
  },
  privilegeRemoved: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    for(x in booking.privileges) {
      if(booking.privileges[x].status == false) {
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
  privileges: function() {
    var privileges = Bookings.findOne({_id: Router.current().params._id}).privileges;
    var privilegeArray = [];

    for(x in privileges) {
        privilegeArray.push(Privileges.findOne({_id: privileges[x].id}));
    }

    return privilegeArray;
  },
  icStatus: function() {
    return (Customers.findOne({_id: this.customerId}).icStatus);
  },
  ic: function() {
    return (Customers.findOne({_id: this.customerId}).ic);
  },
  invoiceDetails: function() {
    return Others.findOne({_id: Router.current().params._id}).equipmentDetails[0];
  },
  invoiceLineItems: function() {
    return Others.findOne({_id: Router.current().params._id}).equipmentDetails[0].items;
  },
  needUpdate: function() {
    return (InvoiceNeedingUpdate.findOne({bookingId: Router.current().params._id}) != undefined);
  },
  bookingId: function() {
    return Router.current().params._id;
  },
  void: function() {
    return (Bookings.findOne({_id: Router.current().params._id}).status == "Void");
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
  customItem: function() {
    
  },
  dates: function() {
    var bookingStatus = BookingStatuses.findOne({invoiceId: Router.current().params._id});
    if(bookingStatus!=undefined) {
      if(bookingStatus.totalDates.length > 0) {
        console.log(bookingStatus.displayDates);
        return bookingStatus.displayDates;
      }
    }
  },
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
    var other = Others.findOne({_id: Router.current().params._id});
    var finalSubTotal = 0;
    for(x in other.equipmentDetails) {
      finalSubTotal = parseFloat(finalSubTotal + other.equipmentDetails[x].subTotal);
    }

    return accounting.formatMoney(finalSubTotal);
  },
  finalInvoiceTotal: function() {
    console.log("finalInvoiceTotal");
    console.log(this);

    return accounting.formatMoney(this.subDiscount + this.subTotal);
  },
  finalTotal: function() {
    return accounting.formatMoney(this.total);
  },
  gst: function() {
    return accounting.formatMoney(this.gst);
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
  bookingCustomer: function() {
    console.log("bookingcustomer find");
    if(BookingCustomers.findOne({invoiceId: Router.current().params._id}) != undefined) {
      var bookingCustomer = BookingCustomers.findOne({invoiceId: Router.current().params._id});

      return Customers.findOne({_id: bookingCustomer.customerId});
    }
  },
  customer: function() {

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
  projectName: function() {
    if(Others.findOne({_id: Router.current().params._id}) != undefined) {
      if(Others.findOne({_id: Router.current().params._id}).projectName == "" || Others.findOne({_id: Router.current().params._id}).projectName == null) {
        return "Nil";
      }
      return Others.findOne({_id: Router.current().params._id}).projectName;
    }
  },
  dateGroupId: function() {
    return this.id + 1;
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
  other: function() {
    return Others.findOne({_id: Router.current().params._id});
  },
  remarks: function() {
    return Others.findOne({_id: Router.current().params._id}).remarks;
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
    var bookingAcknowledgeRemarks = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});
    if(bookingAcknowledgeRemarks.remarksRequiringAcknowledgement.length > 0) 
      return true;
    else
      return false;
  },
  generalRemarksExist: function() {
    var other = Others.findOne({_id: Router.current().params._id});

    return (other.remarks.length > 0);
  },
  customerSignOutExist: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    if(booking.customerSignOut.length > 0) 
      return true;
    else
      return false;
  },
  customerSignOutRemark: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    return (this.items.length + " (out of " + booking.noOfItems + ") pending items unsigned.");
  },
  staffSignInRemark: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    return (this.items.length + " (out of " + booking.noOfItems + ") pending items unsigned.");
  },
  customerSignOut: function() {
    var others = Others.findOne({_id: Router.current().params._id});

    for(x in others.customerSignOut) {
      others.customerSignOut[x]['createdAt'] = moment(others.customerSignOut[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      others.customerSignOut[x]['signedAt'] = moment(others.customerSignOut[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }


    return others.customerSignOut.reverse();
  },
  staffSignInExist: function() {
    var bookingSignIn = BookingSignIns.findOne({invoiceId: Router.current().params._id});
    if(bookingSignIn.staffSignIn.length > 0) 
      return true;
    else
      return false;
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
    var bookingAcknowledgeRemark = BookingAcknowledgeRemarks.findOne({invoiceId: Router.current().params._id});

    for(x in bookingAcknowledgeRemark.remarksRequiringAcknowledgement) {
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[x]['createdAt'] = moment(bookingAcknowledgeRemark.remarksRequiringAcknowledgement[x]['createdAt']).format('Do MMMM YYYY, h:mma');
      bookingAcknowledgeRemark.remarksRequiringAcknowledgement[x]['signedAt'] = moment(bookingAcknowledgeRemark.remarksRequiringAcknowledgement[x]['signedAt']).format('Do MMMM YYYY, h:mma');
    }

    return bookingAcknowledgeRemark.remarksRequiringAcknowledgement.reverse();
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
  amount: function() {
    return accounting.formatMoney(this.amount);
  },
  paymentExists: function() {
    return (this.payment.length == 0);
  },  
  totalPrice: function() {
    return accounting.formatMoney(this.total);
  },
  zeroTotal: function() {
    return(this.balanceDue > 0);
  },
  balanceDue: function() {
    return accounting.formatMoney(this.balanceDue);
  },
  omgItems: function() {
    return Session.get("itemsArray");
  },
  groupId2: function() {
    var string = this.id.split("_");
    return (parseInt(string[0]) + 1);
  },
  items: function() {
    var itemArray = [];
    var counter = -1;
    for (i = 0; i < this.items.length; i++) { 
      if(i == 0) {
        counter++;
      }
      itemArray[i] = this.items[i];
    }

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

    for(x in itemArray) {
      if(itemArray[x].category == "Accessories") {
        accessories.push(itemArray[x]);
      }
      if(itemArray[x].category == "Batteries") {
        batteries.push(itemArray[x]);
      }
      if(itemArray[x].category == "Cameras") {
        cameras.push(itemArray[x]);
      }
      if(itemArray[x].category == "Cards") {
        cards.push(itemArray[x]);
      }
      if(itemArray[x].category == "Electronics") {
        electronics.push(itemArray[x]);
      }
      if(itemArray[x].category == "Filters") {
        filters.push(itemArray[x]);
      }
      if(itemArray[x].category == "Grips") {
        grips.push(itemArray[x]);
      }
      if(itemArray[x].category == "Lens") {
        lens.push(itemArray[x]);
      }
      if(itemArray[x].category == "Lights") {
        lights.push(itemArray[x]);
      }
      if(itemArray[x].category == "Monitors") {
        monitors.push(itemArray[x]);
      }
      if(itemArray[x].category == "Sound") {
        sound.push(itemArray[x]);
      }
      if(itemArray[x].category == "Studio Usage") {
        studio.push(itemArray[x]);
      }
      if(itemArray[x].category == "Tripods") {
        tripods.push(itemArray[x]);
      }
      if(itemArray[x].category == "") {
        custom.push(itemArray[x]);
      }
      if(itemArray[x].category == "Custom Item Rental") {
        custom.push(itemArray[x]);
      }
    }

    itemArray = [];

    if(accessories.length > 0) {
      for(x in accessories) {
        itemArray.push(accessories[x]);
      }
    }
    if(batteries.length > 0) {
      for(x in batteries) {
        itemArray.push(batteries[x]);
      }
    }
    if(cameras.length > 0) {
      for(x in cameras) {
        itemArray.push(cameras[x]);
      }
    }
    if(cards.length > 0) {
      for(x in cards) {
        itemArray.push(cards[x]);
      }
    }
    if(electronics.length > 0) {
      for(x in electronics) {
        itemArray.push(electronics[x]);
      }
    }
    if(filters.length > 0) {
      for(x in filters) {
        itemArray.push(filters[x]);
      }
    }
    if(grips.length > 0) {
      for(x in grips) {
        itemArray.push(grips[x]);
      }
    }
    if(lens.length > 0) {
      for(x in lens) {
        itemArray.push(lens[x]);
      }
    }
    if(lights.length > 0) {
      for(x in lights) {
        itemArray.push(lights[x]);
      }
    }
    if(monitors.length > 0) {
      for(x in monitors) {
        itemArray.push(monitors[x]);
      }
    }
    if(sound.length > 0) {
      for(x in sound) {
        itemArray.push(sound[x]);
      }
    }
    if(studio.length > 0) {
      for(x in studio) {
        itemArray.push(studio[x]);
      }
    }
    if(tripods.length > 0) {
      for(x in tripods) {
        itemArray.push(tripods[x]);
      }
    }
    if(custom.length > 0) {
      for(x in custom) {
        itemArray.push(custom[x]);
      }
    }
      


    return itemArray;
  },
  rate: function() {
    return accounting.formatMoney(this.rate);
  },
  packageClicked: function() {
    return this.packageClicked;
  },
  subAmount: function() {
    return accounting.formatMoney(this.subAmount);
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
    if(Bookings.findOne({_id: Router.current().params._id}).type == "Booking") {
      return true;
    }
  },
  thisIsQuotation: function() {
    if(Bookings.findOne({_id: Router.current().params._id}).type == "Quotation") {
      return true;
    }
  },
  discount: function() {
    return accounting.formatMoney(this.discount);
  },
  afterTotal: function() {
    return accounting.formatMoney(this.afterTotal);
  },
  totalSubTotal: function() {
    console.log(this);
    var totalSubTotal = 0;
    for(x in this.items) {
      totalSubTotal += ((this.items[x].discount + this.items[x].rate) * this.items[x].days * this.items[x].booked);
    }

    return accounting.formatMoney(totalSubTotal);
  },
  subTotal: function() {
    return accounting.formatMoney(this.subTotal);
  },
  subDiscount: function() {
    return accounting.formatMoney(this.subDiscount);
  },
  bookingGroupPrice: function() {
      return BookingGroupPrices.findOne({invoiceId: Router.current().params._id, groupId: this.groupId});
  },
  extraGroup: function() {
    if(this.id != 0)
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
  price: function() {
    return accounting.formatMoney(this.price);
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
    var booking = Bookings.findOne({_id: Router.current().params._id});

    for(x in booking.customerSignOut) {
      if(booking.customerSignOut[x]['status'] == "Unsigned") {
        return "";
        break;
      }
    }

    return "disabled";
  },
  staffSignInAbled: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});

    for(x in booking.staffSignIn) {
      if(booking.staffSignIn[x]['status'] == "Unsigned") {
        return "";
        break;
      }
    }

    return "disabled";
  },
  spinning: function() {

  },
  fineSignAbled: function() {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    for(x in booking.remarksRequiringAcknowledgement) {
      if(booking.remarksRequiringAcknowledgement[x].resolved == false) {
        return "";
      }
    }

    return "disabled";
  },
  signAbled: function() {
    if(Session.get("remarksAcknowledgeId").length == 0) {
      return "disabled";
    }
  },
  otherCreatedAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  otherCreatedBy: function() {
    return Meteor.users.findOne({_id: this.createdBy}).username;
  },
});

Template.otherPrintShow.events({
  'click #printInvoice': function (event) {
          // Router.go('bookingPrint.show', {_id: Router.current().params._id}, {});
          var objectHTMLCollection = document.getElementsByClassName('scroll-content'),
          printData = [].map.call( objectHTMLCollection, function(node){
              return node.innerHTML || node.textContent || node.innerText || "";
          }).join("");
          /*Get canvas and convert into PNG image */
          
          var canvas=document.getElementById("sign-canvas");
          if(canvas){
            var image = new Image();
            image.src = canvas.toDataURL("image/png");
            printData = printData.replace(/<canvas.*>(.*)<\/canvas>/gi,image.outerHTML);
            
          }
          console.log(printData);
          console.log("Data--->",printData);

          cordova.plugins.printer.print(printData, 'otherPrintShow.html', function () {
              alert('Printing finished or canceled..')
          });
        },

  'keyup #customerSearch2': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.clear('searchCustomerNumberQuery');
      Session.setTemp('searchCustomerQuery', event.target.value);
    } else {
      Session.clear('searchCustomerQuery');
    }
  },
  'keyup #customerNumberSearch2': function (event, template) {
    if(event.target.value.length >= 3) {
      Session.clear('searchCustomerQuery');
      Session.setTemp('searchCustomerNumberQuery', event.target.value);
    } else {
      Session.clear('searchCustomerNumberQuery');
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
          
    });
  },
  'click .cancelOutsideRemark': function(event, template) {
    var string = event.currentTarget.id;
    $("#addComment_"+string).css("display", "block");
    $("#showComments_"+string).css("display", "none");
  },
  'click .removePrivilege': function(event, template) {
    var template = 'You will be removing this privilege. Are you <strong>really</strong> sure?';
    IonPopup.confirm({
      title: 'REMOVE PRIVILEGE',
      template: template,
      onOk: function() {
        var attributes = {
          _id: Router.current().params._id,
          privilegeId: event.currentTarget.id
        };

        Meteor.call('removePrivilege', attributes, function(error, result) {
          
        });
      },
      onCancel: function() {
      }
    });
  },
  'click .addPrivilege': function(event, template) {
    var attributes = {
      _id: Router.current().params._id,
      privilegeId: event.currentTarget.id
    };

    Meteor.call('addPrivilege2', attributes, function(error, result) {
      
    });
  },
  'click #syncWithQuickBooks': function(event, template) {
    

    var booking = Bookings.findOne({_id: Router.current().params._id});
    //check customer first
    if(booking.customerId == 0 || booking.customerId == null) {
      IonPopup.alert({title: 'NO CUSTOMER FOUND', template: 'Need customer to generate QuickBooks invoice id.'});
    } else {
      var template;
      if(booking.quickbooksInvoiceQueryId == "Pending") {
        template = 'You will be creating a new invoice in QuickBooks. Are you <strong>really</strong> sure?';
        IonPopup.confirm({
          title: 'SYNC WITH QUICKBOOKS',
          template: template,
          onOk: function() {
            document.getElementById("syncTitle").innerHTML = "SYNCING";
            $("#syncWithQuickBooks").css("background", "white");
            $("#syncTitle").css("color", "#2C3E50");
            var quickbooksAttributes = {
              _id: Router.current().params._id,
              quickbooksInvoiceQueryId: booking.quickbooksInvoiceQueryId
            };

            Meteor.call('updateQuickbooksInvoice', quickbooksAttributes, function(error, result) {
              
            });
          },
          onCancel: function() {
          }
        });
      } else {
        document.getElementById("syncTitle").innerHTML = "SYNCING";
        $("#syncWithQuickBooks").css("background", "white");
        $("#syncTitle").css("color", "#2C3E50");
        var quickbooksAttributes = {
          _id: Router.current().params._id,
          quickbooksInvoiceQueryId: booking.quickbooksInvoiceQueryId
        };

        Meteor.call('updateQuickbooksInvoice', quickbooksAttributes, function(error, result) {
          
        });
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
    $(".itemCol_"+event.currentTarget.id).css("height", "85px");
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
      $(".itemCol_"+event.currentTarget.id).css("height", "52px");

      if(result == "Done") {
        var booking = Bookings.findOne({_id: Router.current().params._id});
        if(booking.type == "Booking") {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        }
      }
    });
  },
  'click .add-custom': function(event, template) {
    event.preventDefault();

    var string = event.currentTarget.id.split("_");
    var booking = Bookings.findOne({_id: Router.current().params._id});

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        dates: booking.equipmentDetails[string[0]].dates
    };

    Meteor.call('addQuantityToCustomBookingItem', attributes, function(error, result) {

      if(result == "Done") {
        if(booking.type == "Booking") {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        }
      }
    });
  },
  'click .minus-custom': function(event, template) {
    event.preventDefault();

    var string = event.currentTarget.id.split("_");
    var booking = Bookings.findOne({_id: Router.current().params._id});

    

    if(this.booked != 0) {
      var attributes = {
          _id: Router.current().params._id,
          id: event.currentTarget.id,
          dates: booking.equipmentDetails[string[0]].dates
      };

      Meteor.call('minusQuantityToCustomBookingItem', attributes, function(error, result) {
        if(result == "Done") {
          if(booking.type == "Booking") {
            Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
          }
        }
      });
    }
  },
  'click .remove-custom': function(event, template) {
    event.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id
    };

    IonPopup.show({
      title: 'Remove item',
      template: 'You are removing: ' + this.item,
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
            if(result == "Done") {
                var booking = Bookings.findOne({_id: Router.current().params._id});
                if(booking.type == "Booking") {
                  Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
                }
              }
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
    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        rate: $("#rate_"+event.currentTarget.id).val()
    };

    Meteor.call('saveCustomRate', attributes, function(error, result) {
      $(".rateShow_"+event.currentTarget.id).css("display", "");
      $(".rateEdit_"+event.currentTarget.id).css("display", "none");
      $(".rateCol_"+event.currentTarget.id).css("height", "52px");


      if(result == "Done") {
        var booking = Bookings.findOne({_id: Router.current().params._id});
        if(booking.type == "Booking") {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        }
      }

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

            if(result == "Done") {
              var booking = Bookings.findOne({_id: Router.current().params._id});
              if(booking.type == "Booking") {
                Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
              }
            }
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

      if(result == "Done") {
        var booking = Bookings.findOne({_id: Router.current().params._id});
        if(booking.type == "Booking") {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        }
      }
    });
  },
  'click .editDiscount': function(event, template) {
    
    $(".discountShow_"+event.currentTarget.id).css("display", "none");
    $(".discountEdit_"+event.currentTarget.id).css("display", "");
    $(".discountCol_"+event.currentTarget.id).css("height", "85px");
  },
  'click .saveDiscount': function(event, template) {
    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        discount: $("#discount_"+event.currentTarget.id).val()
    };

    Meteor.call('saveDiscount', attributes, function(error, result) {
      $(".discountShow_"+event.currentTarget.id).css("display", "");
      $(".discountEdit_"+event.currentTarget.id).css("display", "none");
      $(".discountCol_"+event.currentTarget.id).css("height", "52px");

      if(result == "Done") {
        var booking = Bookings.findOne({_id: Router.current().params._id});
        if(booking.type == "Booking") {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        }
      }
    });
  },
  'click .saveNormalDiscount': function(event, template) {
    var attributes = {
        _id: Router.current().params._id,
        id: event.currentTarget.id,
        discount: $("#discount_"+event.currentTarget.id).val()
    };

    Meteor.call('saveNormalDiscount', attributes, function(error, result) {
      $(".discountShow_"+event.currentTarget.id).css("display", "");
      $(".discountEdit_"+event.currentTarget.id).css("display", "none");
      $(".discountCol_"+event.currentTarget.id).css("height", "52px");

      if(result == "Done") {
        var booking = Bookings.findOne({_id: Router.current().params._id});
        if(booking.type == "Booking") {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        }
      }

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

      if(booking.type == "Booking") {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      }
      
    });
  },
  'click .searchedCustomer': function(e) {
    $("div#"+e.currentTarget.id).css("background-color", "rgba(0, 0, 0, 0.05)");
    var customer = Customers.findOne({_id: e.currentTarget.id});
    var booking = Bookings.findOne({_id: Router.current().params._id});

    var customerId = e.currentTarget.id;
    var attributes = {
      _id: Router.current().params._id,
      customerId: customerId
    };

    Meteor.call('updateCustomerName', attributes, function(error, result) {
      $("#selectCustomerName").css("display", "none");
      $("#showCustomerName").css("display", "block");
      // $("#customerName").css("height", "142px");

      if(booking.type == "Booking") {
        Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
      }
      
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

    var attributes = {
      _id: Router.current().params._id,
      projectName: $("#projectNameInput").val()
    };

    Meteor.call('updateProjectName', attributes, function(error, result) {
      $("#showProjectNameInput").css("display", "none");
      $("#showProjectName").css("display", "block");
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

    var string = e.currentTarget.id;

    var clashCalendarArray = string.split(",");

    Session.setTemp("invoiceClicked", Router.current().params._id);
    
    Session.setTemp("groupCalendarClicked", clashCalendarArray[0]);

    clashCalendarArray.shift();

    Session.setTemp("clashCalendarArray", clashCalendarArray);

    Router.go("clashCalendars");
  },
  'click [data-action="showAcknowledgeRemarkDeleteConfirm"]': function(event, template) {
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
        });
      },
      onCancel: function() {
        IonModal.close();
        IonKeyboard.close();
      }
    });
  },
  'click [data-action="commentDeleteConfirm"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Comment',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        var string = event.currentTarget.id;
        var attributes = {
          _id: Router.current().params._id,
          remarkId: string[0],
          commentId: string[1],
        };

        Meteor.call('deleteComment', attributes, function(error, result) {
          IonModal.close();
          IonKeyboard.close();
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
        var booking = Bookings.findOne({_id: Router.current().params._id});
        if(booking.type == "Quotation") {
          Meteor.call('deleteBooking', Router.current().params._id, function(error, result) {
          });

          Router.go('customers.show', {_id: booking.customerId}, {});
        } else if(booking.type == "Booking" && booking.quickbooksInvoiceQueryId == "Pending") {
          Meteor.call('deleteBooking', Router.current().params._id, function(error, result) {
          });

          Router.go('customers.show', {_id: booking.customerId}, {});
        } else if(booking.type == "Booking" && booking.quickbooksInvoiceQueryId != "Pending") {
          Meteor.call('voidBooking', Router.current().params._id, function(error, result) {
            if(result) {
              var quickbooksAttributes = {
                _id: Router.current().params._id,
                quickbooksInvoiceQueryId: booking.quickbooksInvoiceQueryId
              };

              Meteor.call('updateQuickbooksInvoice', quickbooksAttributes, function(error, result) {
                
              });
            }
            
          });
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

    

    Session.setTemp("equipmentSelected", string[2] + " " + string[3]);
    Session.setTemp("equipmentSelectedId", string[1]);
    Session.setTemp("equipmentGroup", string[0]);
    Session.setTemp("equipmentGroupCounter", string[4]);

    Router.go('bookingsSerialNoSelect', {_id: Router.current().params._id}, {});
  },
  'click .removePayment': function(e) {
    e.preventDefault();
    var obj = new Object();
    obj._id = Router.current().params._id;
    obj.paymentId = e.currentTarget.id;
    Meteor.call('deletePayment', obj, function(error, result) {
    });
  },
  'click .removeRemark': function(e) {
    e.preventDefault();
    var obj = new Object();
    obj.current = Router.current().params._id;
    obj.remarkId = e.currentTarget.id;
    Meteor.call('deleteRemark', obj, function(error, result) {
    });
  },
  'click .addBookingDates': function(e) {
    e.preventDefault();

    if(Session.get("eventNumbers")) {
      var eventNumbers = Session.get("eventNumbers");
      eventNumbers += 1;
      Session.setTemp("eventNumbers", eventNumbers);
    } else {
      Session.setTemp("eventNumbers", 1);
    }
    
    Session.setTemp("bookingGroupClicked", e.currentTarget.id);
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

    var string = e.currentTarget.id.split("_");

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    IonPopup.show({
      title: 'Remove item',
      template: 'You are removing: ' + this.brand + " " + this.item,
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

          Meteor.call('removeBookingItem', attributes, function(error, result) {});
        }
      }
      ]
    });

    
  },
  'click .removeGroup': function(e) {
    e.preventDefault();

    var booking = Bookings.findOne({_id: Router.current().params._id});

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id,
        originalBooking: booking
    };

    Meteor.call('removeBookingGroup', attributes, function(error, result) {
      var attributes2 = {
          _id: Router.current().params._id,
          id: e.currentTarget.id,
          dates: Session.get("arrayOfDateObjects"),
          originalBooking: booking
      };

      Meteor.call('updateBookingDates', Router.current().params._id);
    });
  },
  'click .add': function(e) {
    e.preventDefault();
    var string = e.currentTarget.id.split("_");
    var booking = Bookings.findOne({_id: Router.current().params._id});
    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id,
        dates: booking.equipmentDetails[string[0]].dates
    };

    Meteor.call('addQuantityToBookingItem', attributes, function(error, result) {
      //activateSpinner(e.currentTarget.id);
      if(result.totalEqualsBooked == false) {
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
         if(result == "Done") {

          if(booking.type == "Booking") {
            Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
          }
         }
       }
    });
    
  },
  'click .minus': function(e) {
    e.preventDefault();
    var booking = Bookings.findOne({_id: Router.current().params._id});
    var string = e.currentTarget.id.split("_");

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id,
        dates: booking.equipmentDetails[string[0]].dates
    };

    Meteor.call('minusQuantityToBookingItem', attributes, function(error, result) {
      if(result == "Done") {
        if(booking.type == "Booking") {
          Meteor.call("checkInvoiceNeedingUpdate", Router.current().params._id);
        }
      }
    });
  },
  'click #addGroup': function(e) {
    e.preventDefault();

    Meteor.call('addGroup', Router.current().params._id);
  },
  'click #addRemark': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        remark: $("#remark").val()
    };

    Meteor.call('addBookingRemark', attributes, function(error, result) {
    });

    $("#remark").val("");
    Session.setTemp("remarkButton", "disabled");
  },
  'click .remark': function(e) {
    var booking = Bookings.findOne({_id: Router.current().params._id});
    var remarks = booking.remarks;

    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        remarks[e.currentTarget.id]['status'] = "Close";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateBookingRemark', itemAttributes, function(error, result) {
        });
      } else {
        remarks[e.currentTarget.id]['status'] = "Open";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateBookingRemark', itemAttributes, function(error, result) {
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

    var booking = Bookings.findOne({_id: Router.current().params._id});
    var remarksRequiringAcknowledgement = booking.remarksRequiringAcknowledgement;

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