Template.quotationLog.created = function () {
};

Template.quotationLog.rendered = function () {
};

Template.quotationLog.helpers({
  logs: function () {
    var quotation = Quotations.findOne({_id: Router.current().params._id});
    return quotation.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.quotationLog.events({
 
});