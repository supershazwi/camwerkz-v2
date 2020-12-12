Template.overbookedCalendars.created = function () {
  console.log("created");
  console.log(Session.get('dates'));
  console.log(Session.get('equipments'));
  // this.subscribe('overbookedCalendars', Session.get('dates'), Session.get('equipments'), function () {
  //     //trigger event rendering when collection is downloaded
  // });
  this.subscribe('bookinggroupsByBooking', Session.get("routerId"));
  this.subscribe('bookinggroupsByBooking', Session.get("routerId"));
  this.subscribe('bookingstatusesbybooking', Session.get("routerId"));
  this.subscribe('bookingacknowledgeremarksByBooking', Session.get("routerId"));
  this.subscribe('bookingsigninsbybooking', Session.get("routerId"));
  this.subscribe('bookingsignoutsbybooking', Session.get("routerId"));
  // this.subscribe('availableequipmentsbybooking', Session.get("routerId"));
  this.subscribe('bookinggrouppricesByBooking', Session.get("routerId"));
  this.subscribe('bookingpricesByBooking', Session.get("routerId"));
  this.subscribe('calendarsbybooking', Session.get("routerId"));
  // this.subscribe('bookinglineitemsByBooking', Session.get("routerId"));
  this.subscribe('bookingcustomersByBooking', Session.get("routerId"));
  this.subscribe('bookingcustomersByBooking2', Session.get("routerId"));
  this.subscribe('logsByBooking', Session.get("routerId"));
  this.subscribe("equipmentcalendarsbybooking", Session.get("routerId"));
  // Meteor.subscribe('equipmentCalendars');
  var obj = new Object();
  obj.bookingId = Session.get("routerId");
  obj.groupId = parseInt(Session.get("bookingGroupClicked"));
  this.subscribe('bookinglineitemsByBooking2', obj);
  this.subscribe('inventoriesByBooking', Session.get("routerId"));
  
  this.subscribe('overbookedCalendars', Session.get('dates'), Session.get('equipments'), {
    onReady: function () { 
      var fc = $('.fc');
      console.log(Session.get("goToDate"));

      fc.fullCalendar('gotoDate', Session.get("goToDate"));
    },
    onError: function () { console.log("onError", arguments); }
  });
};

Template.overbookedCalendars.rendered = function () {
  var fc = this.$('.fc');

    

    if(Session.get('dates') && Session.get('equipments')) {
      EquipmentCalendars.find({equipmentId: {$in: Session.get('equipments')}, dates: {$in: Session.get('dates')}});
    } else {
      EquipmentCalendars.find();
    }
    fc.fullCalendar('refetchEvents');
};

Template.overbookedCalendars.destroyed = function() {
  console.log("destroyed");
  console.log(Session.get("bookingGroupClicked"));

  Session.setTemp("bookingGroupClicked", Session.get("bookingGroupClicked"));
};

Template.overbookedCalendars.helpers({
  header: function() {
    return {
        left:   'title',
        center: 'basicDay, basicWeek, month',
        right:  'today prev,next'
    };
  },
  events: function () {
      var fc = $('.fc');
      return function (start, end, tz, callback) {
          //subscribe only to specified date range


          if(Session.get('dates') && Session.get('equipments')) {
            var events = EquipmentCalendars.find({equipmentId: {$in: Session.get('equipments')}, dates: {$in: Session.get('dates')}}).map(function (it) {

                return {
                    title: it.customerName + ": " + it.equipmentBrand + " " + it.equipmentItem + " (" + it.booked + ")",
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    backgroundColor: '#3a87ad',
                    borderColor: '#3a87ad',
                    item: it,
                    url: it.url
                };
            });
            callback(events);
          } else {
            var events = EquipmentCalendars.find().map(function (it) {

                return {
                    title: it.customerName + ": " + it.equipmentBrand + " " + it.equipmentItem + " (" + it.booked + ")",
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    backgroundColor: '#3a87ad',
                    borderColor: '#3a87ad',
                    item: it,
                    url: it.url
                };
            });
            callback(events);
          }


      };
  },
  onEventClicked: function() {
    return function(calEvent) {

      IonModal.open('serialNumbers');
    }
  }
});

Template.overbookedCalendars.events({
});
