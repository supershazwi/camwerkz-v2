Template.quotationsShow.created = function () {
  this.autorun(function () {
    this.subscription = Meteor.subscribe('quotation', Router.current().params._id);
    this.subscription = Meteor.subscribe('customerPackageByCustomer', Router.current().params._id);
  }.bind(this));
};

Template.quotationsShow.rendered = function () {
  this.autorun(function () {
    if (!this.subscription.ready()) {
      IonLoading.show();
    } else {
      IonLoading.hide();
      $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
      Session.setTemp('distinctBrands', []);
    }
  }.bind(this));
};

Template.quotationsShow.helpers({
  differentQuantity: function() {
    if(this.originalPriced > 0 && this.discountPriced > 0) {
      return true;
    }
  },
  groupId: function() {
    return this.id + 1;
  },
  totalOriginalPrice: function() {
    return accounting.formatMoney(this.originalPriced * (this.rate + this.discount) * this.days);
  }, 
  totalDiscountPrice: function() {
    return accounting.formatMoney(this.discountPriced * this.rate * this.days);
  },
  dateTime: function() {
    return moment().format('Do MMMM YYYY, h:mma');
  },
  createdAt: function() {
    return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  groups: function() {
    var quotation = Quotations.findOne({_id: Router.current().params._id});
    return quotation.equipmentDetails;
  },
  quotation: function() {
    return Quotations.findOne({_id: Router.current().params._id});
  },
  quotationRemark: function() {
    var quotation = Quotations.findOne({_id: Router.current().params._id});

    for(x in quotation.remarks) {
      quotation.remarks[x]['createdAt'] = moment(quotation.remarks[x]['createdAt']).format('Do MMMM YYYY, h:mma');
    }

    return quotation.remarks.reverse();
  },
  remarkChecked: function() {
    if(this['status'] == 'Open') {
      return "remarkOpen";
    } else {
      return "remarkClose";
    }
  },
  remarkId: function() {
    var id = this.id;
    id = id + 1;
    return id;
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
    return itemArray;
  },
  rate: function() {
    return accounting.formatMoney(this.rate);
  },
  subAmount: function() {
    return accounting.formatMoney(this.subAmount);
  },
  discount: function() {
    return accounting.formatMoney(this.discount);
  },
  subTotal: function() {
    return accounting.formatMoney(this.subTotal);
  },
  extraGroup: function() {
    if(this.id != 0)
      return true;
  },
  createdBy: function() {
    return Meteor.users.findOne({_id: this.createdBy}).username;
  },
  checkboxChecked: function() {
    if(this['status'] == 'Open') {
      return false;
    } else {
      return true;
    }
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
  back: function() {
    if(this.availability == "back") 
      return "checked";
  }
});

Template.quotationsShow.events({
  'click .addQuotationItem': function(e) {
    e.preventDefault();
    Session.setTemp("quotationGroupClicked", e.currentTarget.id);
  },
  'click #cancelQuotation': function(e) {
    e.preventDefault();

    
  },
  'click [data-action="showDeleteConfirm"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Item',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        Meteor.call('deleteQuotation', Router.current().params._id, function(error, result) {
          Router.go('customers.show', {_id: Session.get("customer")._id}, {});
        });
      },
      onCancel: function() {
      }
    });
  },
  'click .dots': function(e) {
    e.preventDefault();
  },
  'click .addQuotationDates': function(e) {
    e.preventDefault();
    Session.setTemp("quotationGroupClicked", e.currentTarget.id);
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

    Meteor.call('updateQuotationAvailability', attributes, function(error,result) {

    });
  },
  'click #title': function(e) {
    e.preventDefault();
  },
  'click .remove': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    Meteor.call('removeQuotationItem', attributes, function(error, result) {
    });
    Meteor.call('updateQuotationPrice', Router.current().params._id);
  },
  'click .removeGroup': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    Meteor.call('removeQuotationGroup', attributes, function(error, result) {
    });
  },
  'click .add': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    Meteor.call('addQuantityToQuotationItem', attributes, function(error, result) {
    });
    Meteor.call('updateQuotationPrice', Router.current().params._id);
  },
  'click .minus': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        id: e.currentTarget.id
    };

    Meteor.call('minusQuantityToQuotationItem', attributes, function(error, result) {
    });
    Meteor.call('updateQuotationPrice', Router.current().params._id);
  },
  'click #addGroup': function(e) {
    e.preventDefault();

    Meteor.call('addQuotationGroup', Router.current().params._id);
  },
  'click #addRemark': function(e) {
    e.preventDefault();

    var attributes = {
        _id: Router.current().params._id,
        remark: $("#remark").val(),
        id: document.getElementsByClassName("remark").length
    };

    Meteor.call('addQuotationRemark', attributes, function(error, result) {
    });

    $("#remark").val("");
  },
  'click .remark': function(e) {
    var quotation = Quotations.findOne({_id: Router.current().params._id});
    var remarks = quotation.remarks;

    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        remarks[e.currentTarget.id]['status'] = "Close";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateQuotationRemark', itemAttributes, function(error, result) {
        });
      } else {
        remarks[e.currentTarget.id]['status'] = "Open";

        var itemAttributes = {
          _id: Router.current().params._id,
          remarks: remarks,
          clicked: e.currentTarget.id
        };

        Meteor.call('updateQuotationRemark', itemAttributes, function(error, result) {
        });
      }
    }
  }
});