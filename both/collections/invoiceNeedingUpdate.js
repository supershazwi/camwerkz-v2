InvoiceNeedingUpdate = new Mongo.Collection('invoiceNeedingUpdate');



Meteor.methods({
  checkInvoiceNeedingUpdate: function(bookingId) {
    this.unblock();
    if(InvoiceNeedingUpdate.findOne({bookingId: bookingId}) == undefined) {
      var invoiceNeedingUpdate = InvoiceNeedingUpdate.insert({
      bookingId: bookingId,
      customerIdd: "0",
      voidId:"0",
      otherId:"0"
    });
    }
  },
  checkInvoiceNeedingUpdateVoid: function(bookingId) {
    this.unblock();
    var ivnu = InvoiceNeedingUpdate.findOne({bookingId: bookingId});

    if(ivnu != undefined) {

      ivnu.voidId = bookingId;
      ivnu.bookingId = "0";
      ivnu.customerIdd= "0";
      ivnu.otherId = "0";

      delete ivnu._id;

      InvoiceNeedingUpdate.update({bookingId: bookingId}, {$set: ivnu});
    } else {
      InvoiceNeedingUpdate.insert({
        bookingId: "0",
        voidId: bookingId,
        customerIdd: "0",
        otherId:"0"
      });
    }
  },
  checkCustomerNeedingUpdate: function(customerIdd) {
    this.unblock();
    if(InvoiceNeedingUpdate.findOne({customerIdd: customerIdd}) == undefined) {
      var invoiceNeedingUpdate = InvoiceNeedingUpdate.insert({
        bookingId: "0",
        customerIdd: customerIdd,
        voidId: "0",
        otherId: "0"
      });
    }
  },
  checkOtherInvoiceNeedingUpdate: function(otherId) {
    this.unblock();
    if(InvoiceNeedingUpdate.findOne({otherId: otherId}) == undefined) {
      var invoiceNeedingUpdate = InvoiceNeedingUpdate.insert({
      otherId: otherId,
      bookingId: "0",
      customerIdd: "0",
      voidId: "0"
    });
    }
  },
  removeOtherInvoiceNeedingUpdate: function(otherId) {
    this.unblock();
    InvoiceNeedingUpdate.remove({otherId:otherId});
    var other = Others.findOne({_id: bookingId});

    if(other.quickbooksInvoiceQueryId == "Pending" && other.quickbooksInvoiceId != "Pending") {
      var qbi = QuickbooksInvoices.findOne({latest: true});
      qbi.invoiceDocNumber = qbi.invoiceDocNumber - 1;
      delete qbi._id;

      QuickbooksInvoices.update({latest: true}, {$set: qbi});
    }
  },
  removeInvoiceNeedingUpdate: function(bookingId) {
    this.unblock();
    InvoiceNeedingUpdate.remove({bookingId:bookingId});
    var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});

    if(bookingStatus.quickbooksInvoiceQueryId == "Pending" && bookingStatus.quickbooksInvoiceId != "Pending") {
      var qbi = QuickbooksInvoices.findOne({latest: true});
      qbi.invoiceDocNumber = qbi.invoiceDocNumber - 1;
      delete qbi._id;

      QuickbooksInvoices.update({latest: true}, {$set: qbi});
    }
  }
});