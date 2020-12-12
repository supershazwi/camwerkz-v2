Template.privileges.created = function () {
  Meteor.subscribe('privileges');
};

Template.privileges.rendered = function () {
  Session.setTemp("sortType", "sortByName");
  Session.setTemp("nameDirection", 1);
};

Template.privileges.helpers({
  privileges: function () {
    if(Session.get("sortType") == "sortByName") {
      return Privileges.find({}, {sort: {name: Session.get('nameDirection')}});
    } 
  }
});

Template.privileges.events({
  'click #sortName': function(e) {
    if(Session.get("nameDirection")) {
      if(Session.get("nameDirection") == 1) {
        Session.setTemp("nameDirection", -1);
      } else {
        Session.setTemp("nameDirection", 1);
      }
    } else {
      Session.setTemp("nameDirection", 1);
    }
    Session.setTemp("sortType", "sortByName");
  },
});