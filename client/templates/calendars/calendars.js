var subscribe;
var subscribe2;

Template.calendars.created = function () {

  Session.setTemp("counter", 0);

  this.monthClicked = new ReactiveVar(false);

  Session.setTemp("bookings", true);
  Session.setTemp("quotations", true);
  Session.setTemp("extras", true);

  var startDay = moment().format('x');
  var endDay = moment().add(1, 'days').format('x');

  Session.setTemp('startDay', startDay);
  Session.setTemp('endDay', endDay); 

  subscribe2 = Meteor.subscribe('mainCalendarsStartDayAndEndDay', moment().format('x'), moment().add(1, 'days').format('x'));

  this.autorun(function () {
    // this.subscription = Meteor.subscribe('calendars');
    var fc = $('#customerCalendar');

    subscribe = Meteor.subscribe('mainCalendarsStartDayAndEndDay', Session.get('startDay'), Session.get('endDay'), function () {
        //trigger event rendering when collection is downloaded
          
        console.log("subscribe");

        fc.fullCalendar('refetchEvents');
        if($("#customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right.fc-state-active").length > 0) {
          $(".fc-title").css("font-size", "2em");
        }

    
    });
  }.bind(this));
};

var checkDisabled;
var checkEnabled;

Template.calendars.rendered = function () {


  if($("#customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right.fc-state-active").length > 0) {
    $(".fc-title").css("font-size", "2em");
  }
  Session.setTemp("bookings", true);
  Session.setTemp("quotations", true);
  Session.setTemp("extras", true);
  var fc = this.$('#customerCalendar');

  this.autorun(function () {

      var test = Session.get("counter");

      Calendars.find({}, {sort: {type: 1}});
      fc.fullCalendar('refetchEvents');
      if($("#customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right.fc-state-active").length > 0) {
        $(".fc-title").css("font-size", "2em");
      }

  }.bind(this));
};

Template.calendars.helpers({
  username: function() {
    return Meteor.user().username;
  },
  header: function() {
    return {
        left:   'title',
        right:  'today prev,next'
    };
  },
  events: function () {
      var fc = $('#customerCalendar');
      return function (start, end, tz, callback) {
          //subscribe only to specified date range

          if($("#customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right.fc-state-active").length > 0) {
            $(".fc-title").css("font-size", "2em");
          }

          //find all, because we've already subscribed to a specific range

          var events = Calendars.find({}, {sort: {type: 1}}).map(function (it) {        
              
              if(it.type == "Quotation") {
                return {
                    className: it.invoiceId + "_" + it.groupId + "_" + "Quotation",
                    title: it.title,
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).format('YYYY-MM-DD'),
                    url: it.url,
                    backgroundColor: '#28a54c',
                    borderColor: '#28a54c'
                };
              } else if(it.type == "Booking") {
                return {
                    id: "BOOKING",
                    className: it.invoiceId + "_" + it.groupId + "_" + "Booking",
                    title: it.title,
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).format('YYYY-MM-DD'),
                    url: it.url,
                    backgroundColor: '#DE4F4F',
                    borderColor: '#db0303'
                };
              } else if(it.type == "Packing_Booking") {
                return {
                    className: it.invoiceId + "_" + it.groupId + "_" + "Packing_Booking",
                    title: it.title,
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).format('YYYY-MM-DD'),
                    url: it.url,
                    backgroundColor: '#2E0927',
                    borderColor: '#2E0927'
                };
              } else if(it.type == "Collection_Booking") {
                return {
                    className: it.invoiceId + "_" + it.groupId + "_" + "Collection_Booking",
                    title: it.title,
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).format('YYYY-MM-DD'),
                    url: it.url,
                    backgroundColor: '#3498DB',
                    borderColor: '#3498DB'
                };
              } else if(it.type == "Packing_Quotation") {
                return {
                    className: it.invoiceId + "_" + it.groupId + "_" + "Packing_Quotation",
                    title: "",
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).format('YYYY-MM-DD'),
                    backgroundColor: '#ffffff',
                    borderColor: '#ffffff'
                };
              } else if(it.type == "Collection_Quotation") {
                return {
                    className: it.invoiceId + "_" + it.groupId + "_" + "Collection_Quotation",
                    title: it.title,
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).format('YYYY-MM-DD'),
                    backgroundColor: '#ffffff',
                    borderColor: '#ffffff'
                };
              }
          });
          
          callback(events);
          if($("#customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right.fc-state-active").length > 0) {
            $(".fc-title").css("font-size", "2em");
          }
      };
  }
});

Template.calendars.events({
  'change #my-datepicker': function() {
    var fc = $('#customerCalendar');
    fc.fullCalendar('gotoDate', moment($("#my-datepicker").val()));

    var view = fc.fullCalendar('getView');
    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));

    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));
  },
  'click #customerCalendar > div.fc-toolbar > div.fc-center > button.fc-month-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right': function(event, template) {
    template.monthClicked.set(true);  
    console.log("monthclicked true");
  },
  'click #customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right': function(event, template) {
    template.monthClicked.set(false);  
    console.log("monthclicked false");
  },
  'click .fc-event': function(e) {
    var string = e.currentTarget.className.split(" ");
    $("."+string[string.length - 1]).css("background-color", "white");
    $("."+string[string.length - 1]).css("color", "black");
    $("."+string[string.length - 1]).css("border-color", "black");
  },
  'click .day':function( date, allDay, jsEvent, view ) {
    var fc = $('#customerCalendar');
    var view = fc.fullCalendar('getView');
    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));
  },
  'click #customerCalendar > div.fc-toolbar > div.fc-right > button': function() {

    var startDay = moment().format('x');
    var endDay = moment().add(1, 'days').format('x');

    Session.setTemp('startDay', startDay);
    Session.setTemp('endDay', endDay); 

    $(".fc-title").css("font-size", "2em");
  },
  'click .fc-month-button': function() {

    var fc = $('#customerCalendar');
    var view = fc.fullCalendar('getView');
    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));

    $("#customerCalendar > div.fc-toolbar > div.fc-right > button").css("display", "none");

    $(".fc-title").css("font-size", "2em");
  },
  'click .fc-basicWeek-button': function() {

    var fc = $('#customerCalendar');
    var view = fc.fullCalendar('getView');
    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));

    $("#customerCalendar > div.fc-toolbar > div.fc-right > button").css("display", "none");

    $(".fc-title").css("font-size", "2em");
  },
  'click .fc-basicDay-button' : function() {
    var fc = $('#customerCalendar');
    var view = fc.fullCalendar('getView');
    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));

    $("#customerCalendar > div.fc-toolbar > div.fc-right > button").css("display", "block");

    $(".fc-title").css("font-size", "2em");
  },
  'click .fc-next-button' : function() {
    var fc = $('#customerCalendar');
    var view = fc.fullCalendar('getView');
    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));

    if($("#customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right.fc-state-active").length > 0) {
      $(".fc-title").css("font-size", "2em");
    }
  },
  'click .fc-prev-button' : function() {
    var fc = $('#customerCalendar');
    var view = fc.fullCalendar('getView');
    Session.setTemp('startDay', view.intervalStart.format("x"));
    Session.setTemp('endDay', view.intervalEnd.format("x"));



    
    if($("#customerCalendar > div.fc-toolbar > div.fc-center > button.fc-basicDay-button.fc-button.fc-state-default.fc-corner-left.fc-corner-right.fc-state-active").length > 0) {
      $(".fc-title").css("font-size", "2em");
    }
  },
});