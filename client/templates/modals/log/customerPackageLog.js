Template.customerPackageLog.created = function () {
};

Template.customerPackageLog.rendered = function () {
};

Template.customerPackageLog.helpers({
  logs: function () {
    var customerPackage = CustomerPackages.findOne({_id: Router.current().params._id});
    return customerPackage.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.customerPackageLog.events({
 
});