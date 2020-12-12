Template._otherItem.created = function () {
  this.autorun(function () {
    this.subscription = Meteor.subscribe('customers');
  }.bind(this));
};

Template._otherItem.helpers({
  isInvoice: function(e) {
    
  },
  isFine: function(e) {

  },
  total: function (e) {
    return accounting.formatMoney(this.total);
  },
  bookedFor: function(e) {
    return Customers.findOne({_id: this.bookedFor}).name;
  },
  name: function(e) {
  	return this.customerDetails.name;
  },
  company: function(e) {
  	return this.customerDetails.company;
  },
  createdAt: function(e) {
  	return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  }
});

Template._otherItem.events({
});