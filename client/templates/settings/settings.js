Template.settings.created = function () {
  Meteor.subscribe('users');
};

Template.settings.rendered = function () {
  
};

Template.settings.helpers({
  users: function() {
    return Meteor.users.find({});
  },
  verified: function() {
    return this.profile.verified;
  },
  admin: function() {
     console.log(this);
    return (this.profile.type == "Admin");
  }
});

Template.settings.events({
  'click .verified': function(e) {
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var attributes = {
          _id: Router.current().params._id,
          userId: e.currentTarget.id,
          verified: true
        };

        Meteor.call('updatedVerification', attributes, function(error, result) {
         
        });
      } else {
        var attributes = {
          _id: Router.current().params._id,
          userId: e.currentTarget.id,
          verified: false
        };

        Meteor.call('updatedVerification', attributes, function(error, result) {
         
        });
      }
    }
  },
  'click .admin': function(e) {
    if(e.target.localName == "input") {
      if(e.target.checked == true) {
        var attributes = {
          _id: Router.current().params._id,
          userId: e.currentTarget.id,
          admin: true
        };

        Meteor.call('updatedAdmin', attributes, function(error, result) {
         
        });
      } else {
        var attributes = {
          _id: Router.current().params._id,
          userId: e.currentTarget.id,
          admin: false
        };

        Meteor.call('updatedAdmin', attributes, function(error, result) {
         
        });
      }
    }
  }
});