Template.customersShow.created = function () {

  this.autorun(function () {
    this.subscribe('bookingcustomersbycustomer', Router.current().params._id); // to get booking customers under current customer
    var idArray = [];
    idArray.push(Router.current().params._id);
    var bookingCustomers = BookingCustomers.find({customerId: {$in: idArray}}).fetch();

    var invoiceArray = [];

    for(x in bookingCustomers) {
      invoiceArray.push(bookingCustomers[x].invoiceId);
    }

    this.subscribe('bookingstatusbycustomer', invoiceArray); // to get booking statuses under current customer
    this.subscribe('quickbooksInvoices');
    this.subscribe('privilegeByCustomer', Router.current().params._id);
    this.subscribe('customer', Router.current().params._id);
    this.subscribe('customerPackageByCustomer', Router.current().params._id);
  this.subscribe('invoiceNeedingUpdateByCustomer', Router.current().params._id);
    this.subscribe('bookingsByCustomer', invoiceArray);
    this.subscribe('bookingPricesByCustomer', Router.current().params._id);
    this.subscribe('othersByCustomer', Router.current().params._id);
    this.subscribe("logsByCustomer", Router.current().params._id);
    Session.setTemp("customer", Customers.findOne({_id: Router.current().params._id}));

    var quotationBookingStatuses = BookingStatuses.find({type: "Quotation"}).fetch();
    var quotationIds = [];

    for(x in quotationBookingStatuses) {
      quotationIds.push(quotationBookingStatuses[x].invoiceId);
    }

    Session.setTemp("quotationIds", quotationIds);

    var bookingBookingStatuses = BookingStatuses.find({type: "Booking"}).fetch();
    var bookingIds = [];

    for(x in bookingBookingStatuses) {
      bookingIds.push(bookingBookingStatuses[x].invoiceId);
    }

    Session.setTemp("bookingIds", bookingIds);

  }.bind(this));
};

Template.customersShow.rendered = function () {
  if(Session.get("lastClicked") == "bookings" || Session.get("lastClicked") == undefined) {
    $("#bookingsList").css("display", "block");
    $("#quotationsList").css("display", "none");
    $("#packagesList").css("display", "none");    
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("bookings").className = "button button-block button-positive";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-outline";
  } else if(Session.get("lastClicked") == "quotations") {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "block");
    $("#packagesList").css("display", "none");
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-positive";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-outline";
  } else if(Session.get("lastClicked") == "packages") {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "none");
    $("#packagesList").css("display", "block");
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-positive";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-outline";
  } else if(Session.get("lastClicked") == "images") {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "none");
    $("#packagesList").css("display", "none");
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "block");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-positive";
  } else {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "none");
    $("#packagesList").css("display", "none");
    $("#privilegesList").css("display", "block");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-positive";
    document.getElementById("images").className = "button button-block button-outline";
  }
};

Template.customersShow.helpers({
  customerIsPending: function() {
    return Customers.findOne({_id: Router.current().params._id}).quickbooksId == 0;
  },
  hello: function() {
    console.log(this);
  },
  quickbooksIdDoesNotExist: function() {
    console.log("OMG");
    console.log(InvoiceNeedingUpdate.findOne({customerIdd: Router.current().params._id}));

    return (InvoiceNeedingUpdate.findOne({customerIdd: Router.current().params._id}));
  },
  icStatus: function() {
    var icStatus = false;
    var images = Customers.findOne({_id: Router.current().params._id}).images;
    for(x in images) {
      if(images[x].type == "IC") {
        icStatus = true;
        break;
      }
    }

    return icStatus;
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
  customerId: function() {
    return Router.current().params._id;
  },
  financialStatusOk: function() {
    var value = 0;
    var bookingCustomers = BookingCustomers.find({customerId: Router.current().params._id}).fetch();
    for(x in bookingCustomers) {
          
      var bookingPrice = BookingPrices.findOne({invoiceId: bookingCustomers[x].invoiceId});

      value += bookingPrice.balanceDue;
    }

    if(value == 0 || value < 0) {
      return true;
    } else {
      return false;
    }
  },
 totalBookings: function() {
    return BookingCustomers.find({customerId: Router.current().params._id}).count();
    
  },
  moneyOwed: function() {
    var value = 0;
    var bookingCustomers = BookingCustomers.find({customerId: Router.current().params._id}).fetch();
    for(x in bookingCustomers) {
      var bookingPrice = BookingPrices.findOne({invoiceId: bookingCustomers[x].invoiceId});
      value += bookingPrice.balanceDue;
    }

    return accounting.formatMoney(value);
  },
  dateGroupId: function() {
    return this.id + 1;
  },
  moneySpent: function() {
    var value = 0;
    var bookingCustomers = BookingCustomers.find({customerId: Router.current().params._id}).fetch();
    for(x in bookingCustomers) {
      var bookingPrice = BookingPrices.findOne({invoiceId: bookingCustomers[x].invoiceId});
      value += (bookingPrice.total - bookingPrice.balanceDue);
    }

    return accounting.formatMoney(value);
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
    if(bookingStatus!=undefined) {
      if(bookingStatus.totalDates.length > 0) {
        return true;
      }

      return false;
    }

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
  others: function() {
    return (this.type == "Others");
  },
  othersInvoices: function() {
    return Others.find({});  
  },
  customer: function () {
    return Customers.findOne({_id: Router.current().params._id});
  },
  totalValue: function() {
    return accounting.formatMoney(Customers.findOne({_id: Router.current().params._id}).totalValue);
  },
  balance: function() {
    return accounting.formatMoney(Customers.findOne({_id: Router.current().params._id}).balance);
  },
  customerPackage: function() {
    return CustomerPackages.find({}, {sort: {name: 1}}).fetch();
  },
  customerPackageId: function() {
    var customerPackageId = parseInt(this.id);
    customerPackageId += 1;
    return customerPackageId;
  },
  customerPackageExist: function() {
    var customerPackages = CustomerPackages.find({customerId: Router.current().params._id}).fetch();
    if(customerPackages.length == 0) {
      return false;
    } else {
      return true;
    }
  },
  imagesExist: function() {
    if(Customers.findOne({_id: Router.current().params._id}).images.length > 0) {
      return true;
    } else {
      return false;
    }
  },
  bookingsExist: function() {
    if(Session.get("bookingIds").length == 0)
      return false;
    else
      return true;
  },
  quickbooksInvoiceId2: function() {
    if(BookingStatuses.findOne({invoiceId: this._id}) != undefined) {
      return BookingStatuses.findOne({invoiceId: this._id}).quickbooksInvoiceId;
    }
  },
  bookingCustomer: function() {
    return Customers.findOne({_id: Router.current().params._id});
  },
  bookings: function() {
    return Bookings.find({_id: {$in: Session.get("bookingIds")}}, {sort: {createdAt: -1}}).map(function (doc, index, cursor) {
      return _.extend(doc, {index: index + 1});
    });
  },
  privilegesExist: function() {
    var idArray = [];
    idArray.push(Router.current().params._id);
    
    if(Privileges.find({customerId: {$in: idArray}}).fetch().length == 0) 
      return false;
    else
      return true;
  },
  privilege: function() {
    var idArray = [];
    idArray.push(Router.current().params._id);
    return Privileges.find({customerId: {$in: idArray}}, {sort: {name: 1}}); 
  },
  quotationsExist: function() {
    if(Session.get("quotationIds").length == 0)
      return false;
    else
      return true;
  },
  othersExist: function() {
    if(Others.find({customerId: Router.current().params._id}).count() == 0)
      return false;
    else
      return true;
  },
  quotations: function() {
    return Bookings.find({_id: {$in: Session.get("quotationIds")}});
  },
  total: function() {
    return accounting.formatMoney(this.total); 
  },
  createdAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  image: function() {
    return Customers.findOne({_id: Router.current().params._id}).images;
  },
  others: function() {
    return (this.type == "Others");
  },
  imageisic: function() {
    return (this.type == "IC");
  }
});

Template.customersShow.events({
  /*code for status*/
  'click .mark-as-red':function (event) {
    var customerId = event.target.value;
    Meteor.call('getCustomer',customerId,function(err,res){
      var customersRemark = "";
      if(res.remarks){
        customersRemark = res.remarks;
      }
      var checked = "";
      if(res.markAsRed){
        checked = 'checked';
      }
      var template = '<label class="container_checkbox">Mark User as Red<input type="checkbox" id="markAsRed"'+checked+'><span class="checkmark_checkbox"></span></label><textarea type="text" rows="4" style="padding: 10px;" value="" id="customersRemark" placeholder="Enter Remarks">'+customersRemark+'</textarea>';
      IonPopup.show({
      title: 'Mark Customer Status',
      template: template,
      buttons: [{
        text: 'Cancel',
        type: 'button-stable',
        onTap: function() {
          IonPopup.close();
        }
      },
      {
        type: 'button-positive',
        text: 'Save Status',
        onTap: function() {
          //IonPopup.close();
          var cutomersRemarks = document.getElementById('customersRemark').value;
          var markAsRed = document.querySelector('#markAsRed').checked;
          
          Meteor.call('markAsRedCustomers',customerId,cutomersRemarks,markAsRed, function(err,res){
            IonPopup.close();
          })
        }
      }
      ],
    })
    document.getElementsByClassName("popup-body").style.overflow = "hidden";
    })
  },
  /*end*/
  /*code for delete*/
  'click .delete-cust': function(event) {
    var customerId = event.target.value;
   
    if(!Meteor.userId()){
      IonPopup.alert({
        title: 'Login Required',
        template: 'Please login to perform this action.',
        okText: 'Got It.'
      });
      return false;

    }
    IonPopup.confirm({
      title: 'Delete Customers',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        Meteor.call('findCustomerWithBooking',customerId,function(err,res){
          
          if(!err){
            if(res){
              alert("You're not allowed to delete customers with prior bookings");
              return false;
            }else{
              Meteor.call('removeCustomer',customerId,function(err,res){
                if(res){
                  Router.go('/customers/limit'); 
                }
              })
            }
          }
        })
      }
    });
  },
  /*end here*/

  'click #pollQuickbooks': function(event) {
    document.getElementById("pollQuickbooks").disabled = true;
    var customer = Customers.findOne({_id: Router.current().params._id});

    customer.customerId = Router.current().params._id;

    Meteor.call('addQuickbooksCustomer', customer, function(error, result) {
    });
  },
  
  'click [data-action="selectImageType"]': function(event, template) {

    IonPopup.show({
      title: 'Select Image Type',
      template: '<input type="file" id="uploadFile" accept="image/*" class="custom-file-input"></input><img id="preview"/>',
      buttons: [{
        text: 'Cancel',
        type: 'button-stable',
        onTap: function() {
          IonPopup.close();
        }
      },
      {
        text: 'Preview',
        type: 'button-dark',
        onTap: function() {
            var files = document.getElementById('uploadFile').files;
            if(files[0]) {
              document.getElementById('preview').setAttribute('src', URL.createObjectURL(files[0]));
            } else {
              alert('Please select an image first.');
            } 
        }
      },
      {
        text: 'Save',
        type: 'button-positive',
        onTap: function() {
          
            var files = document.getElementById('uploadFile').files;
            if (files.length > 0) {
              getBase64(files[0]);
            } else {
              alert('Please select an image first.');
            }

            function getBase64(file) {
             var reader = new FileReader();
             reader.readAsDataURL(file);
             reader.onerror = function (error) {
               console.log('Error: ', error);
             };
             reader.onload = function () {
              
              var obj = new Object();
              obj.data = reader.result;
              obj._id = Router.current().params._id;
              obj.type = "IC";
              Meteor.call('uploadImage', obj, function(error, result) {
                $("#bookingsList").css("display", "none");
                $("#quotationsList").css("display", "none");
                $("#packagesList").css("display", "none");
                $("#privilegesList").css("display", "none");
                $("#imagesList").css("display", "block");

                document.getElementById("quotations").className = "button button-block button-outline";
                document.getElementById("packages").className = "button button-block button-outline";
                document.getElementById("bookings").className = "button button-block button-outline";
                document.getElementById("privileges").className = "button button-block button-outline";
                document.getElementById("images").className = "button button-block button-positive";

                Session.setTemp("lastClicked", "images");
                IonPopup.close();
              });
             };
            }
        }
      },
      ]
    });
  },
  'click .removeImage': function(e) {
    e.preventDefault();

    IonPopup.confirm({
      title: 'Delete Image',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        var obj = new Object();
        obj.data = e.currentTarget.id;
        obj._id = Router.current().params._id;
        Meteor.call('deleteImage', obj, function(error, result) {
          $("#bookingsList").css("display", "none");
          $("#quotationsList").css("display", "none");
          $("#packagesList").css("display", "none");
          $("#privilegesList").css("display", "none");
          $("#imagesList").css("display", "block");

          document.getElementById("quotations").className = "button button-block button-outline";
          document.getElementById("packages").className = "button button-block button-outline";
          document.getElementById("bookings").className = "button button-block button-outline";
          document.getElementById("privileges").className = "button button-block button-outline";
          document.getElementById("images").className = "button button-block button-positive";

          Session.setTemp("lastClicked", "images");
        });
      },
      onCancel: function() {
      }
    });
  },
  'click #makeOthers': function(e) {
    var customerDetails = new Object();

    var customer = Customers.findOne({_id: Router.current().params._id});

    customerDetails.id = customer._id;
    customerDetails.name = customer.name;
    customerDetails.company = customer.company; 
    customerDetails.number = customer.contact; 
    customerDetails.email = customer.email;  
    customerDetails.address = customer.address;    

    Meteor.call('addOthers', customerDetails, function(error, result) {
      Router.go('others.show', {_id: result}); 
    });
  },
  'click #makeBooking': function(e) {
    var arr = [];
    arr.push(Router.current().params._id);
    var privileges = Privileges.find({customerId: {$in: arr}}, {fields: {_id: 1, discountValue: 1}}).fetch();
    var privilegeIdArray = [];
    for(x in privileges) {
      var obj = new Object();
      obj.status = true;
      obj.id = privileges[x]._id;
      obj.value = privileges[x].discountValue;
      privilegeIdArray.push(obj);
    }
    Session.setTemp("customer", Customers.findOne({_id: Router.current().params._id}));

    var customerSession = Session.get("customer");

    

    var customerDetails = new Object();
    customerDetails.id = customerSession['_id'];
    customerDetails.name = customerSession['name'];
    customerDetails.company = customerSession['company']; 
    customerDetails.number = customerSession['contact']; 
    customerDetails.email = customerSession['email']; 
    customerDetails.address = customerSession['address']; 
    customerDetails.privileges = privilegeIdArray;
    customerDetails.bookingType = "Booking";

    Meteor.call('addBooking', customerDetails, function(error, result) {
      
      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " added booking " + result + ".",
        ownerUsername: Meteor.user().username,
      };

      Meteor.call("insertCustomerLog", attributes);

      Router.go('bookings.show', {_id: result}); 
    });
  },
  'click .swipebox': function(e) {
    e.preventDefault();
  },
  'click #makeQuotation': function(e) {
    var arr = [];
    arr.push(Router.current().params._id);
    var privileges = Privileges.find({customerId: {$in: arr}}, {fields: {_id: 1, discountValue: 1}}).fetch();
    var privilegeIdArray = [];
    for(x in privileges) {
      var obj = new Object();
      obj.status = true;
      obj.id = privileges[x]._id;
      obj.value = privileges[x].discountValue;
      privilegeIdArray.push(obj);
    }
    Session.setTemp("customer", Customers.findOne({_id: Router.current().params._id}));

    var customerSession = Session.get("customer");

    var customerDetails = new Object();
    customerDetails.id = customerSession['_id'];
    customerDetails.name = customerSession['name'];
    customerDetails.company = customerSession['company']; 
    customerDetails.number = customerSession['contact']; 
    customerDetails.email = customerSession['email']; 
    customerDetails.bookingType = "Quotation"; 
    customerDetails.address = customerSession['address']; 
    customerDetails.privileges = privilegeIdArray;

    Meteor.call('addBooking', customerDetails, function(error, result) {

      var attributes = {
        _id: Router.current().params._id,
        content: Meteor.user().username + " added quotation " + result + ".",
        ownerUsername: Meteor.user().username,
      };

      Meteor.call("insertCustomerLog", attributes);

      Router.go('bookings.show', {_id: result}); 
    });
  },
  'click #newCustomerPrivilege': function(e) {
    Session.setTemp("customer", Customers.findOne({_id: Router.current().params._id}));
  },
  'click #quotations': function(e) {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "block");
    $("#othersList").css("display", "none");
    $("#packagesList").css("display", "none");
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-positive";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("others").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-outline";

    Session.setTemp("lastClicked", "quotations");
  },
  'click #others': function(e) {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "none");
    $("#othersList").css("display", "block");
    $("#packagesList").css("display", "none");
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "none");

    document.getElementById("others").className = "button button-block button-positive";
    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-outline";

    Session.setTemp("lastClicked", "others");
  },
  'click #bookings': function(e) {
    $("#bookingsList").css("display", "block");
    $("#quotationsList").css("display", "none");
    $("#othersList").css("display", "none");    
    $("#packagesList").css("display", "none");    
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("bookings").className = "button button-block button-positive";
    document.getElementById("others").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-outline";

    Session.setTemp("lastClicked", "bookings");
  },
  'click #packages': function(e) {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "none");
    $("#othersList").css("display", "none");    
    $("#packagesList").css("display", "block");
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-positive";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-outline";
    document.getElementById("others").className = "button button-block button-outline";

    Session.setTemp("lastClicked", "packages");
  },
  'click #privileges': function(e) {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "none");
    $("#othersList").css("display", "none");    
    $("#packagesList").css("display", "none");
    $("#privilegesList").css("display", "block");
    $("#imagesList").css("display", "none");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-positive";
    document.getElementById("images").className = "button button-block button-outline";
    document.getElementById("others").className = "button button-block button-outline";

    Session.setTemp("lastClicked", "privileges");
  },
  'click #images': function(e) {
    $("#bookingsList").css("display", "none");
    $("#quotationsList").css("display", "none");
    $("#othersList").css("display", "none");    
    $("#packagesList").css("display", "none");
    $("#privilegesList").css("display", "none");
    $("#imagesList").css("display", "block");

    document.getElementById("quotations").className = "button button-block button-outline";
    document.getElementById("packages").className = "button button-block button-outline";
    document.getElementById("bookings").className = "button button-block button-outline";
    document.getElementById("privileges").className = "button button-block button-outline";
    document.getElementById("images").className = "button button-block button-positive";
    document.getElementById("others").className = "button button-block button-outline";

    Session.setTemp("lastClicked", "images");
  }
});

