Template.addQuotationDates.created = function () {
  if(Session.get("dateArray")) {
    Session.clear("dateArray");
  }
  Session.setTemp("singleDateCounter", 1);
  Session.setTemp("dateRangeCounter", 1);
};

Template.addQuotationDates.rendered = function () {
  $('.modal').attr('style', 'left: 10%; right: 10%; top: 10%; bottom: 10%; width: 80%;');
};

Template.addQuotationDates.helpers({
  singleDates: function() {
    var quotation = Quotations.findOne({_id: Router.current().params._id});
    return quotation.equipmentDetails[Session.get("quotationGroupClicked")].singleDates;
  },
  singleDate: function() {
    return moment(this.date).format('YYYY-MM-DD');
  },
  dateRanges: function() {
    var quotation = Quotations.findOne({_id: Router.current().params._id});
    return quotation.equipmentDetails[Session.get("quotationGroupClicked")].dateRanges;
  },
  startDate: function() {
    return moment(this.startDate).format('YYYY-MM-DD');
  },
  endDate: function() {
    return moment(this.endDate).format('YYYY-MM-DD');
  },
  
  options: function() {
      var quotation = Quotations.findOne({_id: Router.current().params._id});

      if(!Session.get("dateArray")) {
        var dateArray = [];

        var dates = quotation.equipmentDetails[Session.get("quotationGroupClicked")].dates;
        for (x in dates) {
          dateArray.push(Date.parse(dates[x]));
        }

        Session.setTemp("dateArray", dateArray);
      }

      return {
          height: 650,
          selectable: true,
          selectHelper: true,
          dayRender: function (date, cell) { 
              if(Session.get("dateArray").indexOf(Date.parse(date)) > -1) {
                var date2 = moment(date).format('YYYY-MM-DD');
                $("[data-date='"+date2+"']")[0].attributes[0].nodeValue = "fc-day fc-widget-content fc-wed fc-past green";
              }
          },
          select: function( start, end, jsEvent, view ) {
            while(moment(start).format('YYYY-MM-DD') != moment(end).format('YYYY-MM-DD')) {
              var startDate = moment(start).format('YYYY-MM-DD');

                if($("[data-date='"+startDate+"']")[0].attributes[0].nodeValue.indexOf("green") > -1) {
                  $("[data-date='"+startDate+"']")[0].attributes[0].nodeValue = "fc-day fc-widget-content fc-wed";
                  
                  var index = Session.get("dateArray").indexOf(parseInt(moment(start).format("x")));
                  if(index > -1) {
                    var dateArray2 = Session.get("dateArray");
                    dateArray2.splice(index,1);
                    Session.setTemp("dateArray", dateArray2);
                  }
                } else {
                  $("[data-date='"+startDate+"']")[0].attributes[0].nodeValue = "fc-day fc-widget-content fc-wed fc-past green";
                  var dateArray2 = Session.get("dateArray");
                  dateArray2.push(parseInt(moment(start).format("x")));
                  Session.setTemp("dateArray", dateArray2);
                }
                start = moment(start).add(1, 'days');
            }
          }
      };
  },
  calendarId: function() {
    return Session.get("quotationGroupClicked");
  }
});

Template.addQuotationDates.events({
  'click #addSingleDate': function(e) {
    e.preventDefault();
    $('#singleDates').append("<div class='form-group' id='singleDateGroup_" + Session.get("singleDateCounter") + "' style='padding: 5px 15px 5px 15px; border-bottom: 1px solid #dddddd;'><span class='input-label' style='padding-bottom: 0px; width: 100%;'>Date  <button class='button button-positive button-clear close' id='single_close_" + Session.get("singleDateCounter") + "' style='min-height: 20px; max-height: 20px; line-height: 20px; margin-top: -1px;'>Remove</button></span><input type='date' style='color: #666;' id='singleDate_" + Session.get("singleDateCounter") + "'/></div>");
    Session.setTemp("singleDateCounter", Session.get("singleDateCounter")+1);
  },
  'click #addDateRange': function(e) {
    e.preventDefault();
    $('#dateRanges').append("<div class='form-group' id='dateRangeGroup_" + Session.get("dateRangeCounter") + "' style='padding: 5px 15px 5px 15px; border-bottom: 1px solid #dddddd; height: 75px;'><span class='input-label' style='padding-bottom: 0px; width: 100%;'>Date Range <button class='button button-positive button-clear close' id='daterange_close_" + Session.get("dateRangeCounter") + "' style='min-height: 20px; max-height: 20px; line-height: 20px; margin-top: -1px;'>Remove</button></span><div style='width: 50%; float: left;'><label class='item item-input' style='border-color: white; padding: 0px; color: #666;'><i class='icon'>From</i><input type='date' style='margin-left: 5px; color: #666;' id='startDate_" + Session.get("dateRangeCounter") + "'/></label></div><div style='width: 50%; float: right;'><label class='item item-input' style='border-color: white; padding: 0px; color: #666;'><i class='icon'>To</i><input type='date' style='margin-left: 5px; color: #666;' id='endDate_" + Session.get("dateRangeCounter") + "'/></label></div></div>");
    Session.setTemp("dateRangeCounter", Session.get("dateRangeCounter")+1);
  },
  'click #saveDates': function(e) {
    e.preventDefault();
    IonModal.close();
    IonKeyboard.close();

    var attributes = {
        _id: Router.current().params._id,
        id: Session.get("quotationGroupClicked"),
        dates: Session.get("dateArray")
    };
    
    Meteor.call('addQuotationDatesToGroup', attributes, function(error, result) {
    });

    Meteor.call('updatePrice', Router.current().params._id);
  },
  'click .close': function(e) {
    e.preventDefault();

    var id = e.currentTarget.id;
    var array = id.split("_");
    
    if(array[0] == 'single') {
      $("#singleDateGroup_"+array[2]).remove();
    } else {
      $("#dateRangeGroup_"+array[2]).remove();
    }
  }
});