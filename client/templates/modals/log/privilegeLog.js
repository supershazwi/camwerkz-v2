Template.privilegeLog.created = function () {
};

Template.privilegeLog.rendered = function () {
};

Template.privilegeLog.helpers({
  logs: function () {
    var privilege = Privileges.findOne({_id: Router.current().params._id});
    return privilege.logs.reverse();
  },
  dateTime: function() {
    return moment(this.dateTime).format('Do MMMM YYYY, h:mma');
  }
});

Template.privilegeLog.events({
 
});