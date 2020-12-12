BookingGroupPrices = new Mongo.Collection('bookinggroupprices');

Meteor.methods({
  updateOverallBookingPrice: function(bookingId) {
    var allBookingGroupPrices = BookingGroupPrices.find({invoiceId: bookingId}).fetch();

    var finalAmount = 0;

    for(x in allBookingGroupPrices) {

      var bookingLineItems = BookingLineItems.find({invoiceId: bookingId, groupCounter: parseInt(allBookingGroupPrices[x].groupId)}).fetch();

      var subTotal = 0;
      var subDiscount = 0;
      var afterTotal = 0;

      for(y in bookingLineItems) {
          subTotal += (bookingLineItems[y].rate * bookingLineItems[y].originalPriced);

          if(bookingLineItems[y].discountOverwrite != undefined && bookingLineItems[y].booked != 0) {
          subDiscount += bookingLineItems[y].discountOverwrite;
          }
      }

      allBookingGroupPrices[x].subTotal = subTotal;
      allBookingGroupPrices[x].subDiscount = subDiscount;

      allBookingGroupPrices[x].privilege.value = (subTotal - subDiscount) * (allBookingGroupPrices[x].privilege.percentage / 100);
      allBookingGroupPrices[x].afterTotal = allBookingGroupPrices[x].subTotal - allBookingGroupPrices[x].subDiscount - allBookingGroupPrices[x].privilege.value;

      finalAmount += allBookingGroupPrices[x].afterTotal;


      var allBookingGroupPricesId = allBookingGroupPrices[x]._id;

      delete allBookingGroupPrices[x]._id;
      BookingGroupPrices.update({_id: allBookingGroupPricesId}, {$set: allBookingGroupPrices[x]});
    }




    var bookingPrice = BookingPrices.findOne({invoiceId: bookingId});

    bookingPrice.gst = parseFloat(finalAmount * 0.07).toFixed(2);
    bookingPrice.total = parseFloat(bookingPrice.gst) + finalAmount;
    bookingPrice.balanceDue = bookingPrice.total;

    for(x in bookingPrice.payment) {
       bookingPrice.balanceDue -= bookingPrice.payment[x].amount;
    }

    delete bookingPrice._id;

    
    BookingPrices.update({invoiceId: bookingId}, {$set: bookingPrice});
  },
  updateBookingGroupPriceByDates: function(details) {
    var bookingLineItems = BookingLineItems.find({invoiceId: details['_id'], groupCounter: parseInt(details['groupId'])}).fetch();

    var subTotal = 0;
    var subDiscount = 0;
    var afterTotal = 0;

    for(x in bookingLineItems) {
      subTotal += (bookingLineItems[x].rate * bookingLineItems[x].originalPriced);

      if(bookingLineItems[x].discountOverwrite != undefined && bookingLineItems[x].booked != 0) {
        subDiscount += bookingLineItems[x].discountOverwrite;
      }
    }

    afterTotal = subTotal - subDiscount;

    var bookingGroupPrice = BookingGroupPrices.findOne({invoiceId: details['_id'], groupId: parseInt(details['groupId'])});

    bookingGroupPrice.subTotal = subTotal;
    bookingGroupPrice.subDiscount = subDiscount;
    bookingGroupPrice.afterTotal = afterTotal - bookingGroupPrice.privilege.value;

    var bookingGroupPriceId = bookingGroupPrice._id;
    delete bookingGroupPrice._id;

    BookingGroupPrices.update({_id: bookingGroupPriceId}, {$set: bookingGroupPrice});

    // update total booking price
    var allBookingGroupPrices = BookingGroupPrices.find({invoiceId: details['_id']}).fetch();

    var finalAmount = 0;

    for(x in allBookingGroupPrices) {
      finalAmount += allBookingGroupPrices[x].afterTotal;
      finalAmount -= allBookingGroupPrices[x].privilege.value;
    }


    var bookingPrice = BookingPrices.findOne({invoiceId: details['_id']});



    bookingPrice.gst = parseFloat(finalAmount * 0.07).toFixed(2);
    bookingPrice.total = parseFloat(bookingPrice.gst) + finalAmount;
    bookingPrice.balanceDue = bookingPrice.total;

    for(x in bookingPrice.payment) {
      balanceDue -= bookingPrice.payment[x].amount;
    }

    delete bookingPrice._id;

    

    BookingPrices.update({invoiceId: details['_id']}, {$set: bookingPrice});
  },
  updateBookingGroupPrice: function(details) {
    var bookingLineItem;

    if(BookingLineItems.findOne({_id: details['id']}) != undefined) {
      bookingLineItem = BookingLineItems.findOne({_id: details['id']});
    } else {
      bookingLineItem = details['bookingLineItem'];
    }

    var bookingLineItems = BookingLineItems.find({invoiceId: details['_id'], groupCounter: parseInt(bookingLineItem.groupCounter)}).fetch();

    var subTotal = 0;
    var subDiscount = 0;
    var afterTotal = 0;

    for(x in bookingLineItems) {
      subTotal += (bookingLineItems[x].rate * bookingLineItems[x].originalPriced);

      if(bookingLineItems[x].discountOverwrite != undefined && bookingLineItems[x].booked != 0) {
        subDiscount += bookingLineItems[x].discountOverwrite;
      }
    }

    afterTotal = subTotal - subDiscount;

    var bookingGroupPrice = BookingGroupPrices.findOne({invoiceId: details['_id'], groupId: parseInt(bookingLineItem.groupCounter)});

    bookingGroupPrice.subTotal = subTotal;
    bookingGroupPrice.subDiscount = subDiscount;
    bookingGroupPrice.afterTotal = afterTotal - bookingGroupPrice.privilege.value;

    var bookingGroupPriceId = bookingGroupPrice._id;
    delete bookingGroupPrice._id;

    BookingGroupPrices.update({_id: bookingGroupPriceId}, {$set: bookingGroupPrice});

    // update total booking price
    var allBookingGroupPrices = BookingGroupPrices.find({invoiceId: details['_id']}).fetch();



    var finalAmount = 0;

    for(x in allBookingGroupPrices) {
      finalAmount += allBookingGroupPrices[x].afterTotal;
      finalAmount -= allBookingGroupPrices[x].privilege.value;
    }


    var bookingPrice = BookingPrices.findOne({invoiceId: details['_id']});



    bookingPrice.gst = parseFloat(finalAmount * 0.07).toFixed(2);
    bookingPrice.total = parseFloat(bookingPrice.gst) + finalAmount;
    bookingPrice.balanceDue = bookingPrice.total;

    for(x in bookingPrice.payment) {
      balanceDue -= bookingPrice.payment[x].amount;
    }

    delete bookingPrice._id;

    

    BookingPrices.update({invoiceId: details['_id']}, {$set: bookingPrice});
  }
})
