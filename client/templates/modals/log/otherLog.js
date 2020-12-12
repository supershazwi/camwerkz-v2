Template.otherLog.created = function () {
};

Template.otherLog.rendered = function () {
	$('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
};

Template.otherLog.helpers({
  logs: function () {
    var other = Others.findOne({_id: Router.current().params._id});
    return other.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.otherLog.events({
 
});