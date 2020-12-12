Template._bookingItem.created = function () {
  this.autorun(function () {
    this.subscription = Meteor.subscribe('customers');
  }.bind(this));
};

Template._bookingItem.helpers({
  total: function (e) {
    return accounting.formatMoney(this.total);
  },
  bookedFor: function(e) {
    return Customers.findOne({_id: this.bookedFor}).name;
  },
  name: function(e) {
  	return this.customerDetails.name;
  },
  company: function(e) {
  	return this.customerDetails.company;
  },
  void: function(e) {
    return (this.status == "Void");
  },
  createdAt: function(e) {
  	return moment(this.createdAt).format('Do MMMM YYYY, h:mma');
  },
  dateGroups: function(e) {
    var dateGroups = [];
    var datesX = [];

    for(x in this.equipmentDetails) {
      for(y in this.equipmentDetails[x].dates) {
        if(datesX.indexOf(parseInt(moment(this.equipmentDetails[x].dates[y]).subtract(1,'days').format("x"))) == -1) {
          datesX.push(parseInt(moment(this.equipmentDetails[x].dates[y]).subtract(1,'days').format("x")));
        }
      }
    }

    datesX.sort();

    var dateArray = [];
    var dateArrayMoment = [];
    var counter = 0;
    var booked = 0;
    dateArray[counter] = [];
    dateArrayMoment[counter] = [];   

    //MAKE THEM INTO INDIVIDUAL DATE GROUPS
    for(x in datesX) {
      if(dateArray[counter].length == 0) {
        dateArray[counter].push(moment(datesX[x]).format('Do MMMM YYYY'));
      } else {
        var date2 = moment(datesX[x]).subtract(1, 'days');

        if(date2.format('Do MMMM YYYY') == dateArray[counter][dateArray[counter].length - 1]) {
          dateArray[counter].push(moment(datesX[x]).format('Do MMMM YYYY'));
        } else {
          counter += 1;
          dateArray[counter] = [];
          dateArray[counter].push(moment(datesX[x]).format('Do MMMM YYYY'));
        }
      }
    } 

    return dateArray;
  },
  startDate: function(e) {
    return this[0];
  },
  endDate: function(e) {
    return this[this.length - 1];
  }
});

Template._bookingItem.events({
  'click .item' : function(e) {
    $("#"+e.currentTarget.id).css("background-color", "rgba(0, 0, 0, 0.05)");
  }
});