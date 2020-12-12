BookingStatuses = new Mongo.Collection('bookingstatuses');

BookingStatuses.search = function(query) {

  
  if (!query) {
   return BookingStatuses.find({quickbooksInvoiceId: {$in: query}}, {sort: {quickbooksInvoiceId: 1}});
  }

  
  return BookingStatuses.find({
    quickbooksInvoiceId: { $regex: RegExp.escape(query), $options: 'i' }
  }, {
    limit: 20
  });
};

Meteor.methods({
	
})
