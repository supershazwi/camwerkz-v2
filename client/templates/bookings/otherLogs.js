Template.otherLogs.created = function () {
	this.subscribe("logsByOther", Router.current().params._id);
};

Template.otherLogs.rendered = function () {

};

Template.otherLogs.helpers({
  otherLogs: function () {
    var otherLogs = OtherLogs.findOne({invoiceId: Router.current().params._id});
    return otherLogs.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.otherLogs.events({
 
});