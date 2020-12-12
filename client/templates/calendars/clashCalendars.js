var events = [];

Template.clashCalendars.created = function () {
  // Meteor.subscribe('equipmentCalendars');
  // this.autorun(function () {
  //   var fc = $('.fc');
  //   Meteor.subscribe('clashCalendars', Session.get("clashCalendarArray"), function () {
  //       //trigger event rendering when collection is downloaded
  //       fc.fullCalendar('refetchEvents');
  //   });
  // }.bind(this));
};

Template.clashCalendars.rendered = function () {
  events = [];
  // var fc = this.$('.fc');

  // this.autorun(function () {

    
  //   var arr = Session.get("clashCalendarArray");


  //   fc.fullCalendar('gotoDate', new Date(Session.get("clashCalendarArray")[0]));

  //   fc.fullCalendar('refetchEvents');
  // }.bind(this));
  // this.autorun(function () {
  //   var fc = $('.fc');
  //   Meteor.subscribe('clashCalendars', Session.get("clashCalendarArray"), function () {
  //       //trigger event rendering when collection is downloaded
  //       fc.fullCalendar('refetchEvents');
  //   });
  // }.bind(this));
};

Template.clashCalendars.helpers({
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
          var startMonth = moment(start).format('MM YYYY');
          var endMonth = moment(end).format('MM YYYY');

          Session.setTemp('startMonth', startMonth);
          Session.setTemp('endMonth', endMonth);

          //find all, because we've already subscribed to a specific range

           EquipmentCalendars.find().forEach(function (it) {
            var equipmentId = it.equipmentId;

            if(Session.get("clashCalendarArray").indexOf(it._id) == -1) {
              return;
              // // return {
              // //       title: it.customerName + ": " + it.equipmentBrand + " " + it.equipmentItem + " (" + it.booked + "/" + totalQuantity + ")",
              // //       start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
              // //       end: moment(it.endDate).subtract(1, 'days').format('YYYY-MM-DD'),
              // //       backgroundColor: '#1E1E20',
              // //       borderColor: '#1E1E20',
              // //       item: it,
              // //       url: it.url
              // //   };
            } else if(events.length < 2) {
              // console.log("equipmentId", equipmentId);
              var totalQuantity = Inventory.findOne({_id: equipmentId}).quantity;
              if(it.invoiceId == Session.get("invoiceClicked")) {
                events.push({
                    title: it.customerName + ": " + it.equipmentBrand + " " + it.equipmentItem + " (" + it.booked + "/" + totalQuantity + ")",
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    backgroundColor: '#468966',
                    borderColor: '#468966',
                    item: it,
                    url: it.url
                });
              } else {
                events.push({
                    title: it.customerName + ": " + it.equipmentBrand + " " + it.equipmentItem + " (" + it.booked + "/" + totalQuantity + ")",
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    backgroundColor: '#DE4F4F',
                    borderColor: '#db0303',
                    item: it,
                    url: it.url
                });
              }
            } else {
              return;
            }

            
          });
          console.log("events", events);
          if(events.length != 0) {
            Session.setTemp("events", events);
            callback(events);
          } else {
            callback(Session.get('events'));
          }          
      };
  },
  onEventClicked: function() {
    return function(calEvent) {

      IonModal.open('serialNumbers');
    }
  }
});

Template.clashCalendars.events({
  'change #equipmentSearch': function(e) {
    if($("#equipmentSearch").val() == null) {
      $("#searchButton").css("height", "52px");
      Session.setTemp("equipments", $("#equipmentSearch").val());
    } else {
      if($("#equipmentSearch").val().length > 0) {
        Session.setTemp("equipments", $("#equipmentSearch").val());
        $("#searchButton").css("height", "42px");
      }
    }
  }
});
