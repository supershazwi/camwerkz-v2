Template.equipmentCalendars.created = function () {
  console.log("created");

  Session.clear('startMonth');
  Session.clear('endMonth');
  Session.clear('equipments');

  var startMonth = moment().format('M YYYY');
  var endMonth = moment().add(1, 'months').format('M YYYY');

  Session.setTemp('startMonth', startMonth);
  Session.setTemp('endMonth', endMonth); 
};

Template.equipmentCalendars.onDestroyed(function () {
  // deregister from some central store
  console.log("destroyed");
  Session.clear('startMonth');
  Session.clear('endMonth');
  Session.clear('equipments');
});

Template.equipmentCalendars.rendered = function () {
  console.log("rendered");

  this.autorun(function () {

    if (Session.get('equipments')) {
      console.log("equipments changed");
      Meteor.subscribe('equipmentCalendarsStartAndEnd', Session.get('startMonth'), Session.get('endMonth'), Session.get('equipments'), function () {
          //trigger event rendering when collection is downloaded
          
      });

      var fc = $('#myCalendar');
      fc.fullCalendar('refetchEvents');
    }
  }.bind(this));

  var inventory = Inventory.find({}, {fields: {item: 1, brand: 1}, sort: {brand: 1}}).fetch();

  

  $('#equipmentSearch').selectize({
      id: 'hello',
      persist: false,
      maxItems: null,
      valueField: '_id',
      labelField: 'brand',
      searchField: ['item', 'brand'],
      options: inventory,
      render: {
          item: function(item, escape) {
              return '<div>' +
                  (item.brand ? '<span class="name"><strong>' + escape(item.brand) + '</strong></span>' : '') +
                  (item.item ? ' <span class="email">' + escape(item.item) + '</span>' : '') +
              '</div>';
          },
          option: function(item, escape) {
              var label = item.brand || item.item;
              var caption = item.brand ? item.item : null;
              return '<div>' +
                  '<span class="label"><strong>' + escape(label) + '</strong></span>' +
                  (caption ? ' <span class="caption">' + escape(caption) + '</span>' : '') +
              '</div>';
          }
      },
  });
};

Template.equipmentCalendars.helpers({
  username: function() {
    return Meteor.user().username;
  },
  header: function() {
    return {
        left:   'title',
        center: 'basicDay, basicWeek, month',
        right:  'today prev,next'
    };
  },
  events: function () {
      var fc = $('#myCalendar');
      

        return function (start, end, tz, callback) {
          //subscribe only to specified date range

          var startMonth = moment(start).format('M YYYY');
          var endMonth = moment(end).format('M YYYY');

          Session.setTemp('startMonth', startMonth);
          Session.setTemp('endMonth', endMonth);

       

          //find all, because we've already subscribed to a specific range

          var events = EquipmentCalendars.find().map(function (it) {
            var equipmentId = it.equipmentId;
            var totalQuantity = Inventory.findOne({_id: equipmentId}).quantity;
              if(it.type == "Quotation") {
                return {
                    className: it.invoiceId + "_" + it.groupId + "_" + "Collection_Quotation",
                    title: it.customerName + ": " + it.equipmentBrand + " " + it.equipmentItem + " (" + it.booked + "/" + totalQuantity + ")",
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    backgroundColor: '#28a54c',
                    borderColor: '#28a54c',
                    item: it,
                    url: it.url
                };
              } else if(it.type == "Booking") {
                  return {
                      className: it.invoiceId + "_" + it.groupId + "_" + "Collection_Booking",
                    title: it.customerName + ": " + it.equipmentBrand + " " + it.equipmentItem + " (" + it.booked + "/" + totalQuantity + ")",
                    start: moment(it.startDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    end: moment(it.endDate).subtract(1, 'days').format('YYYY-MM-DD'),
                    backgroundColor: '#DE4F4F',
                    borderColor: '#db0303',
                    item: it,
                    url: it.url
                };
              }
              
          });
          console.log("BEFORE CALLBACK");
          callback(events);
        };
  },
  onEventClicked: function() {
    return function(calEvent) {
      
      IonModal.open('serialNumbers');
    }
  }
});

Template.equipmentCalendars.events({
  'click .fc-event': function(e) {
    var string = e.currentTarget.className.split(" ");
    $("."+string[string.length - 1]).css("background-color", "white");
    $("."+string[string.length - 1]).css("color", "black");
    $("."+string[string.length - 1]).css("border-color", "black");

  },
  'change #equipmentSearch': function(e) {
    console.log("equipmentSearch change");
    if($("#equipmentSearch").val() == null) {
        Session.setTemp("equipments", []);
    } else {
      if($("#equipmentSearch").val().length > 0) {
        Session.setTemp("equipments", $("#equipmentSearch").val());
        
      }
    }
    $("#searchButton").css("height", "42px");
  }
});