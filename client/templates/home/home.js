Template.home.created = function () {
  Tracker.autorun(function () {
    if(Meteor.userId())
      Meteor.logoutOtherClients();
  });
};

Template.home.rendered = function () {
  
};


Template.home.events({
  'click #quotations': function (event, template) {
    Router.go('quotations');
  },
  'click #bookings': function (event, template) {
    Router.go('bookings');
  },
  'click #customers': function (event, template) {
    Router.go('customers');
  },
  'click #inventory': function (event, template) {
    Router.go('inventory');
  },
  'click #calendar': function (event, template) {
    Router.go('calendars');
  },
  'click #privileges': function (event, template) {
    Router.go('privileges');
  },
  'click #notifications': function (event, template) {
    Router.go('notifications');
  },
  'click #others': function (event, template) {
    Router.go('others');
  },
  'click #logs': function (event, template) {
    Router.go('logs');
  },
  'click #settings': function (event, template) {
    Router.go('settings');
  },
  'click #logout': function(event, template) {
    Meteor.logout();
    Router.go("splashPage");
  }
});

Template.home.helpers({
  domain: function() {
    return Meteor.absoluteUrl();
  },
  username: function() {
    return Meteor.user().username;
  }
});

Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });