Template.customerLogs.created = function () {
	this.subscribe("logsByCustomer", Router.current().params._id);
};

Template.customerLogs.rendered = function () {
};

Template.customerLogs.helpers({
  customerLogs: function () {
    var customerLogs = CustomerLogs.findOne({customerId: Router.current().params._id});
    return customerLogs.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.customerLogs.events({
 
});