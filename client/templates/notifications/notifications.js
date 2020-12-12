Template.notifications.created = function () {
  // this.autorun(function () {
  //   this.subscription = [
  //     Meteor.subscribe('calendars'),
  //     Meteor.subscribe('bookingsWithoutBaggage')
  //   ];
  // }.bind(this));
  this.clashedBookingsTemplateClicked = new ReactiveVar(false);
  this.unacknowledgedBookingsTemplateClicked = new ReactiveVar(false);
  this.returnBookingsTemplateClicked = new ReactiveVar(false);
  this.overdueBookingsTemplateClicked = new ReactiveVar(false);
  this.unpaidBookingsTemplateClicked = new ReactiveVar(false);
  this.packBookingsTemplateClicked = new ReactiveVar(false);
  this.readyBookingsTemplateClicked = new ReactiveVar(false);
  this.uncollectedBookingsTemplateClicked = new ReactiveVar(false);
  this.unresolvedBookingsTemplateClicked = new ReactiveVar(false);
};

Template.notifications.rendered = function () {
  // if (!Meteor.loggingIn() && !Meteor.user()) {
  //   IonModal.open('signIn');
  // }
  // this.autorun(function () {
  //   if (!this.subscription.ready()) {
  //     IonLoading.show();
  //   } else {
  //     IonLoading.hide();
  //   }
  // }.bind(this));
};

Template.notifications.helpers({
  clashedBookingsTemplateClicked: function() {
    return Template.instance().clashedBookingsTemplateClicked.get();
  },
  unacknowledgedBookingsTemplateClicked: function() {
    return Template.instance().unacknowledgedBookingsTemplateClicked.get();
  },
  returnBookingsTemplateClicked: function() {
    return Template.instance().returnBookingsTemplateClicked.get();
  },
  overdueBookingsTemplateClicked: function() {
    return Template.instance().overdueBookingsTemplateClicked.get();
  },
  unpaidBookingsTemplateClicked: function() {
    return Template.instance().unpaidBookingsTemplateClicked.get();
  },
  packBookingsTemplateClicked: function() {
    return Template.instance().packBookingsTemplateClicked.get();
  },
  readyBookingsTemplateClicked: function() {
    return Template.instance().readyBookingsTemplateClicked.get();
  },
  uncollectedBookingsTemplateClicked: function() {
    return Template.instance().uncollectedBookingsTemplateClicked.get();
  },
  unresolvedBookingsTemplateClicked: function() {
    return Template.instance().unresolvedBookingsTemplateClicked.get();
  },
  groupId: function() {
    
    return (parseInt(this.id) + 1);
  },
  
  redTransparent: function(e) {
    if(this.hide) {
      return "rgba(231, 76, 60, 0.15)";
    }
  },
  
  printedDates: function() {

    if(Object.prototype.toString.call( this ) === '[object Array]') {
      if(this.length == 1) {
        return this[0];
      } else {
        return this[0] + " - " + this[1];
      }
    }
    
  },
  notifications: function () {
    return Notifications.find({});
  }
});

Template.notifications.events({
  'click .clash-item': function(event, template) {
    template.clashedBookingsTemplateClicked.set(true);
  },
  'click .unacknowledge-item': function(event, template) {
    template.unacknowledgedBookingsTemplateClicked.set(true);
  },
  'click .return-item': function(event, template) {
    template.returnBookingsTemplateClicked.set(true);
  },
  'click .overdue-item': function(event, template) {
    template.overdueBookingsTemplateClicked.set(true);
  },
  'click .unpaid-item': function(event, template) {
    template.unpaidBookingsTemplateClicked.set(true);
  },
  'click .pack-item': function(event, template) {
    template.packBookingsTemplateClicked.set(true);
  },
  'click .ready-item': function(event, template) {
    template.readyBookingsTemplateClicked.set(true);
  },
  'click .uncollect-item': function(event, template) {
    template.uncollectedBookingsTemplateClicked.set(true);
  },
  'click .unresolve-item': function(event, template) {
    template.unresolvedBookingsTemplateClicked.set(true);
  },
  'click #toggleHidden': function(event, template) {
    Session.setTemp("showHidden", document.getElementById("toggleHidden").checked);
  },
  'click .inventoryItem': function(event, template) {
    var string = event.currentTarget.id.split("_");
    Router.go('inventoryItem.show', {_id: string[0]}, {});
  },
  'click .clashedBookingsNumber': function(e) {
    
  },
  'click .item' : function(e) {
    $("#"+e.currentTarget.id).css("background-color", "rgba(0, 0, 0, 0.05)");
  },
  'click .invoice': function(e) {
    if(e.target.nodeName!="BUTTON") {
      Router.go('bookings.show', {_id: e.currentTarget.id}, {});
    }
    
  }
});