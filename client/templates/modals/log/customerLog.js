Template.customerLog.created = function () {
};

Template.customerLog.rendered = function () {
};

Template.customerLog.helpers({
  logs: function () {
    var customer = Customers.findOne({_id: Router.current().params._id});
    return customer.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.customerLog.events({
 
});