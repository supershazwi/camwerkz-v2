Template.customerPackagesShow.created = function () {
  this.autorun(function () {
    this.subscription = Meteor.subscribe('customerPackage', Router.current().params._id);
  }.bind(this));
};

Template.customerPackagesShow.rendered = function () {
    if(Session.get("lastClicked") == "usageHistoryList") {
      $("#usageHistoryList").css("display", "block");
      $("#itemsList").css("display", "none");

      document.getElementById("usageHistory").className = "button button-block button-positive";
      document.getElementById("items").className = "button button-block button-outline";
    } else {
      $("#usageHistoryList").css("display", "none");
      $("#itemsList").css("display", "block");

      document.getElementById("usageHistory").className = "button button-block button-outline";
      document.getElementById("items").className = "button button-block button-positive";
    }
};

Template.customerPackagesShow.helpers({
  customerPackage: function () {
    return CustomerPackages.findOne({_id: Router.current().params._id});
  },
  
  items: function() {
    var customerPackage = CustomerPackages.findOne({_id: Router.current().params._id});
    return customerPackage['items'];
  },
  itemsExist: function() {
    if(CustomerPackages.findOne({_id: Router.current().params._id}).items.length == 0) {
      return false;
    } else {
      return true;
    }
  },
  rate: function() {
    return accounting.formatMoney(this.rate);
  },
  historyExist: function() {
    if(CustomerPackages.findOne({_id: Router.current().params._id}).bookings.length > 0) {
      return true;
    } else {
      return false;
    }
  },
  usage: function() {
    return CustomerPackages.findOne({_id: Router.current().params._id}).bookings;
  },
  total: function() {
    return accounting.formatMoney(this.total);
  },
});

Template.customerPackagesShow.events({
  'click .item': function(e) {
    Session.setTemp("itemClicked", this);  
  },
  'click .itemCard': function(e) {
    Session.setTemp("lastClicked", "itemList");
  },
  'click .usageHistoryCard': function(e) {
    Session.setTemp("lastClicked", "usageHistoryList");
  },
  'click #items': function(e) {
    $("#itemsList").css("display", "block");
    $("#usageHistoryList").css("display", "none");

    document.getElementById("items").className = "button button-block button-positive";
    document.getElementById("usageHistory").className = "button button-block button-outline";
  },
  'click #usageHistory': function(e) {
    $("#itemsList").css("display", "none");
    $("#usageHistoryList").css("display", "block");

    document.getElementById("items").className = "button button-block button-outline";
    document.getElementById("usageHistory").className = "button button-block button-positive";
  }
});