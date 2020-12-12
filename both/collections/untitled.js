// updateQuickbooksInvoice: function(quickbooksAttributes) {
//         console.log("////////////////////////////");
//         console.log("updateQuickbooksInvoice");
//         console.log("////////////////////////////");
//         this.unblock();
//         var privilegeAdded = [];
//         var QuickBooks = Meteor.npmRequire('node-quickbooks');
//         // var qbo = new QuickBooks('qyprdrp2E0Mk07aFBGxmMOK1CjQQq4',
//         //                        '8ncd4Bl90kkBDo0PMQhnNrBDcMXDzb6f018hrm2J',
//         //                        'qyprd8vaWwih1jyXPKYEH3G8CTuxmAeOwVn1kjJK5XdEntVJ',
//         //                        '2danHBCW5dr6HiCpNf6Q13Fg3er8O22rmdISP6Av',
//         //                        1440848740,
//         //                        true, // don't use the sandbox (i.e. for testing)
//         //                        true); // turn debugging on

//         var qbo = new QuickBooks('qyprd6qLQolZgKo8IlXlqMeeL3eqqd',
//                                'soTT6LsqZlA5XZFW5pUBzryuTt3ulbGPLk0t2xu6',
//                                'qyprde8UrNqEGKDGQlXzYFg49UtZNpY5IQQi04fLbo9ZsXWf',
//                                '8aF9t8rMbyiXVzdicM3HcOrnppf3Uz3hvfl8ECBc',
//                                412738331,
//                                false, // don't use the sandbox (i.e. for testing)
//                                true); // turn debugging on

//         var booking = Bookings.findOne({_id: quickbooksAttributes['_id']});
//         var bookingId = booking._id;

//         var bookingCustomer = BookingCustomers.findOne({invoiceId: bookingId});
//         var bookingPrice = BookingPrices.findOne({invoiceId: bookingId});
//         var bookingStatus = BookingStatuses.findOne({invoiceId: bookingId});

//         console.log("bookingStatus.status: " + bookingStatus.status);

//         var bookingProject = BookingProjects.findOne({invoiceId: bookingId});

//         var bookingLineItems = BookingLineItems.find({invoiceId: bookingId}, {sort: {sortNumber: 1}}).fetch();

//         // check whether customer has valid quickbooks id
//         var customer2 = Customers.findOne({_id: bookingCustomer.customerId});
//         if(customer2.quickbooksId == null || customer2.quickbooksId == 0 || customer2.quickbooksId == "0" || customer2.quickbooksId == "") {
//             customer2.customerId = bookingCustomer.customerId;

//             var address = new Object();
//             address.Line1 = customer2.name;
//             address.Line2 = customer2.address;

//             qbo.createCustomer({
//               BillAddr: address,
//               CompanyName: customer2.company, 
//               DisplayName: customer2.name,
//               FamilyName: customer2.lastName,
//               GivenName: customer2.firstName,
//               MiddleName: customer2.middleName,
//               Active: true,
//               PrimaryPhone: {
//                 FreeFormNumber: customer2.contact
//               },
//               PrimaryEmailAddr: {
//                 Address: customer2.email
//               }
//             }, Meteor.bindEnvironment(function(err, customer) {
//               Customers.update(customer2._id, {$set: {quickbooksId: customer['Id']}});var lineArray = [];
//             var chartOfAccounts = ChartOfAccounts.find();
//             var chartOfAccountsArray = [];
//             var customer = Customers.findOne({_id: bookingCustomer.customerId});
              
//             if(bookingStatus.status == "Void") {
//               var lineObject = new Object();
//               lineObject.Amount = 0;
//               lineObject.DetailType = "SalesItemLineDetail";
//               lineObject.Description = "Cancellation";
//               lineObject.SalesItemLineDetail = new Object();
//               lineObject.SalesItemLineDetail.ItemRef = new Object();
//               lineObject.SalesItemLineDetail.ItemRef.value = "23";
//               lineObject.SalesItemLineDetail.ItemRef.name = "VOID";
//               lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//               lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//               lineObject.SalesItemLineDetail.UnitPrice = 0;
//               lineObject.SalesItemLineDetail.Qty = 1;
//               lineArray.push(lineObject);
//             }

//             if(bookingLineItems.length > 0) {
//               for(x in bookingLineItems) {
//                 var bookingGroupPrice = BookingGroupPrices.findOne({invoiceId: bookingId, groupId: parseInt(bookingLineItems[x].groupCounter)});
//                 if(privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] == undefined) {
//                   privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] = false;
//                 }
//                 if(bookingGroupPrice.privilege != undefined && privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] == false) {
//                     privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] = true;
//                     if(bookingGroupPrice.privilege.value > 0) {

//                       var customerArray = [];
//                       customerArray.push(bookingCustomer.customerId);

//                       var privilege = Privileges.findOne({customerId: {$in: customerArray}});

//                       var lineObject = new Object();
//                       if(booking.status == "Void") {
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -(bookingGroupPrice.privilege.value);
//                       }              
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "Privilege - " + privilege.name + " - " + bookingGroupPrice.privilege.percentage + "% off";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(booking.status == "Void") {
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -(bookingGroupPrice.privilege.value);
//                       } 
                      
//                       lineObject.SalesItemLineDetail.Qty = 1;
//                       lineArray.push(lineObject);
//                     }
//                 }
                
//                 for(y in bookingLineItems) {
//                     var lineObject = new Object();
//                     if(bookingStatus.status == "Void") {
//                       lineObject.Amount = 0;
//                     } else {
//                       lineObject.Amount = (bookingLineItems[y].discount + bookingLineItems[y].rate) * bookingLineItems[y].days * bookingLineItems[y].booked;
//                     } 
                    
//                     lineObject.DetailType = "SalesItemLineDetail";
//                     if(bookingLineItems[y].category == "Custom Item Rental") {
//                       lineObject.Description = "(Group " + (parseInt(x)+1) + ") " + bookingLineItems.item + " (" + bookingLineItems.booked + " units X " + bookingLineItems.days + "days) - CUSTOM";
//                     } else {
//                       lineObject.Description = "(Group " + (parseInt(x)+1) + ") " + bookingLineItems.brand + " " + bookingLineItems.item + " (" + bookingLineItems.booked + " units X " + bookingLineItems.days + "days)";
//                     }
//                     lineObject.SalesItemLineDetail = new Object();
//                     lineObject.SalesItemLineDetail.ItemRef = new Object();

                    

//                     var coa = ChartOfAccounts.findOne({category: bookingLineItems[y].category});


//                     lineObject.SalesItemLineDetail.ItemRef.value = coa.qbValue;
//                     lineObject.SalesItemLineDetail.ItemRef.name = coa.qbName;
//                     lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                     lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                     if(bookingStatus.status == "Void") {
//                       lineObject.SalesItemLineDetail.UnitPrice = 0;
//                     } else {
//                       lineObject.SalesItemLineDetail.UnitPrice = (bookingLineItems[y].discount + bookingLineItems[y].rate);
//                     } 
                    
//                     lineObject.SalesItemLineDetail.Qty = bookingLineItems[y].booked * bookingLineItems[y].days;
//                     lineArray.push(lineObject);

//                     //check discount
//                     if(bookingLineItems[y].category == "Custom Item Rental" && bookingLineItems[y].discountOverwrite > 0) {
//                       var lineObject = new Object();
//                       if(bookingStatus.status == "Void") {
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -bookingLineItems[y].discountOverwrite;
//                       }
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "(Group " + (parseInt(x)+1) + ") " + bookingLineItems[y].item + " (" + bookingLineItems[y].booked + " units X " + bookingLineItems[y].days + "days) - DISCOUNT - CUSTOM";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(bookingStatus.status == "Void") {
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -bookingLineItems[y].discountOverwrite;
//                       }
//                       lineObject.SalesItemLineDetail.Qty = 1;
//                       lineArray.push(lineObject);
//                     }
//                     else if(bookingLineItems[y].discountOverwrite > 0) {
//                       var lineObject = new Object();
//                       if(bookingStatus.status == "Void") {
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -bookingLineItems[y].discountOverwrite;
//                       } 
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "(Group " + (parseInt(x)+1) + ") " + bookingLineItems[y].brand + " " + bookingLineItems[y].item + " (" + bookingLineItems[y].booked + " units X " + bookingLineItems[y].days + "days) - DISCOUNT";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(bookingStatus.status == "Void") {
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -bookingLineItems[y].discountOverwrite;
//                       }
//                       lineObject.SalesItemLineDetail.Qty = 1;
//                       lineArray.push(lineObject);
//                     } else if(bookingLineItems[y].discountPriced > 0) {
//                       var lineObject = new Object();
//                       if(bookingStatus.status == "Void") {
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -(bookingLineItems[y].discount * bookingLineItems[y].discountPriced);
//                       } 
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "(Group " + (parseInt(x)+1) + ") " + bookingLineItems[y].brand + " " + bookingLineItems[y].item + " (" + bookingLineItems[y].booked + " units X " + bookingLineItems[y].days + "days) - DISCOUNT";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(bookingStatus.status == "Void") {
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -bookingLineItems[y].discount;
//                       }
//                       lineObject.SalesItemLineDetail.Qty = bookingLineItems[y].discountPriced;
//                       lineArray.push(lineObject);
//                     }
//                 }
//               }
//             } else {
//               var lineObject = new Object();
//               lineObject.Amount = 0;
//               lineObject.DetailType = "SalesItemLineDetail";
//               lineObject.Description = "Application Query";
//               lineObject.SalesItemLineDetail = new Object();
//               lineObject.SalesItemLineDetail.ItemRef = new Object();
//               lineObject.SalesItemLineDetail.ItemRef.value = "44";
//               lineObject.SalesItemLineDetail.ItemRef.name = "Application Query";
//               lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//               lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//               lineObject.SalesItemLineDetail.UnitPrice = 0;
//               lineObject.SalesItemLineDetail.Qty = 0;
//               lineArray.push(lineObject);
//             }

//             var txn = new Object();
//             txn.TxnTaxDetail = new Object();
//             if(bookingStatus.status == "Void") {
//                 txn.TxnTaxDetail.TotalTax = 0;
//             } else {
//                 var subsubtotal = 0;

//                 for(r in bookingLineItems) {
//                     subsubtotal += (bookingLineItems[r].originalPriced * bookingLineItems[r].rate);
//                 }

//                 var gstgst = 0;

//                 var subsubdiscount = 0;

//                 var bookingprivilege = BookingPrivileges.findOne({invoiceId: bookingId});

//                 for(r in bookingLineItems) {
//                   if(bookingLineItems[r].discountOverwrite != undefined) {
//                     subsubdiscount += bookingLineItems[r].discountOverwrite;
//                   }
//                 }

//                 var bookinggroupprices = BookingGroupPrices.find({invoiceId: bookingId}).fetch();

//                 for(x in bookinggroupprices) {
//                   subsubtotal -= bookinggroupprices[x].privilege.value;
//                 }

//                 if(bookingprivilege != undefined && bookingprivilege.status == true) {
//                   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: bookingId});

//                   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);
//                 } 

//                 gstgst = (subsubtotal - subsubdiscount) * 0.07;


//                 console.log("/////subsubtotal/////");
//                 console.log(subsubtotal);

//                 console.log("/////subsubdiscount/////");
//                 console.log(subsubdiscount);

//                 console.log("/////gstgst/////");
//                 console.log(gstgst);

//                 txn.TxnTaxDetail.TotalTax = gstgst;
//             }
//             txn.TxnTaxDetail.TaxLine = [];
//             var taxLineObject = new Object();
//             if(bookingStatus.status == "Void") {
//                 taxLineObject.Amount = 0;
//             } else {

//                 var subsubtotal = 0;

//                 for(r in bookingLineItems) {
//                     subsubtotal += (bookingLineItems[r].originalPriced * bookingLineItems[r].rate);
//                 }

//                 var gstgst = 0;

//                 var subsubdiscount = 0;

//                 var bookingprivilege = BookingPrivileges.findOne({invoiceId: bookingId});

//                 for(r in bookingLineItems) {
//                   if(bookingLineItems[r].discountOverwrite != undefined) {
//                     subsubdiscount += bookingLineItems[r].discountOverwrite;
//                   }
//                 }

//                 var bookinggroupprices = BookingGroupPrices.find({invoiceId: bookingId}).fetch();

//                 for(x in bookinggroupprices) {
//                   subsubtotal -= bookinggroupprices[x].privilege.value;
//                 }

//                 if(bookingprivilege != undefined && bookingprivilege.status == true) {
//                   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: bookingId});

//                   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);
//                 } 

//                 gstgst = (subsubtotal - subsubdiscount) * 0.07;


//                 console.log("/////subsubtotal/////");
//                 console.log(subsubtotal);

//                 console.log("/////subsubdiscount/////");
//                 console.log(subsubdiscount);

//                 console.log("/////gstgst/////");
//                 console.log(gstgst);
                
//                 taxLineObject.Amount = gstgst;
//             }
//             taxLineObject.DetailType = "TaxLineDetail"; 
//             taxLineObject.TaxLineDetail = new Object();
//             taxLineObject.TaxLineDetail.TaxRateRef = new Object();
//             taxLineObject.TaxLineDetail.TaxRateRef.value = "5";
//             taxLineObject.TaxLineDetail.PercentBased = true;
//             taxLineObject.TaxLineDetail.TaxPercent = 7;
//             if(bookingStatus.status == "Void") {
//                 taxLineObject.TaxLineDetail.NetAmountTaxable = 0;
//             } else {
//                 var subsubtotal = 0;

//                 for(r in bookingLineItems) {
//                     subsubtotal += (bookingLineItems[r].originalPriced * bookingLineItems[r].rate);
//                 }

//                 var gstgst = 0;

//                 var subsubdiscount = 0;

//                 var bookingprivilege = BookingPrivileges.findOne({invoiceId: bookingId});

//                 for(r in bookingLineItems) {
//                   if(bookingLineItems[r].discountOverwrite != undefined) {
//                     subsubdiscount += bookingLineItems[r].discountOverwrite;
//                   }
//                 }

//                 var bookinggroupprices = BookingGroupPrices.find({invoiceId: bookingId}).fetch();

//                 for(x in bookinggroupprices) {
//                   subsubtotal -= bookinggroupprices[x].privilege.value;
//                 }

//                 if(bookingprivilege != undefined && bookingprivilege.status == true) {
//                   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: bookingId});

//                   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);
//                 } 

//                 gstgst = (subsubtotal - subsubdiscount) * 0.07;


//                 console.log("/////subsubtotal/////");
//                 console.log(subsubtotal);

//                 console.log("/////subsubdiscount/////");
//                 console.log(subsubdiscount);

//                 console.log("/////gstgst/////");
//                 console.log(gstgst);

//                 taxLineObject.TaxLineDetail.NetAmountTaxable = subsubtotal - subsubdiscount;
//             }
//             txn.TxnTaxDetail.TaxLine.push(taxLineObject);

//             var currencyRef = new Object();
//             currencyRef.value = "SGD";
//             currencyRef.name = "Singapore Dollar";

//             var string = "";

//             if(bookingProject.projectName != undefined) {
//                 string = string.concat("Project Name: " + bookingProject.projectName + ".");
//             }

//             for(d in bookingStatus.displayDates) {
//               string = string.concat("Group " + (parseInt(bookingStatus.displayDates[d].id) + 1) + ": ");

//               for(e in bookingStatus.displayDates[d].dateArray) {
//                 if(bookingStatus.displayDates[d].dateArray[e].length > 1) {
//                   string = string.concat(bookingStatus.displayDates[d].dateArray[e][0] + " - " + bookingStatus.displayDates[d].dateArray[e][1]) + ",";
//                 } else {
//                   string = string.concat(bookingStatus.displayDates[d].dateArray[e][0]) + ",";
//                 }
//               }
//             }

//             var customerMemo = new Object();

//             string = string.concat(" --- Generated at: " + moment().format('Do MMMM YYYY, h:mma'));

//             customerMemo.value = string;
            
//             var billObject = new Object();
//             billObject.Address = customer.email;

//             var billAddr = new Object();
//             billAddr.Id = parseInt(customer2.quickbooksId) + 1;
//             billAddr.Line1 = customer2.name;
//             billAddr.Line2 = customer2.address;

//             if(bookingStatus.quickbooksInvoiceQueryId == "Pending") {
//               var latestDocNumber = QuickbooksInvoices.findOne({latest: true});

//               latestDocNumber.invoiceDocNumber = parseInt(latestDocNumber.invoiceDocNumber);  
              

//               qbo.createInvoice({
//                 DocNumber: latestDocNumber.invoiceDocNumber,
//                 Line: lineArray,
//                   CurrencyRef: currencyRef,
//                 CustomerRef: {
//                   value: customer.quickbooksId
//                 },
//                 BillAddr: billAddr,
//                 BillEmail: billObject,
//                 TxnTaxDetail: txn.TxnTaxDetail,
//                 CustomerMemo: customerMemo
//               }, Meteor.bindEnvironment(function (error, invoice) {
             

                

//                 if(invoice.Fault != undefined) {
//                   var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                   bookingUpdate.status = invoice.Fault.Error[0].Message;

//                   delete bookingUpdate._id;
//                   BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                 } else {
//                   latestDocNumber.invoiceDocNumber += 1;

//                   var latestDocNumberId = latestDocNumber._id;
//                   delete latestDocNumber._id;

//                   QuickbooksInvoices.update({_id: latestDocNumberId}, {$set: latestDocNumber});
//                   console.log("INVOICE OK CREATE");
//                   console.log(bookingId);
//                   bookingStatus.quickbooksInvoiceId = invoice.DocNumber;
//                   bookingStatus.quickbooksInvoiceQueryId = invoice.Id;

//                   BookingStatuses.update({invoiceId: bookingId}, {$set: bookingStatus});

//                   console.log(bookingId);

//                   InvoiceNeedingUpdate.remove({bookingId: bookingId});

//                   var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                   bookingUpdate.status = "OK";

//                   delete bookingUpdate._id;
//                   BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                 }
//               }));
//             } else {
//                 console.log("INSIDE NOT PENDING");
//                 console.log(bookingStatus.quickbooksInvoiceQueryId);

//                 console.log("customerMemo");
//                 console.log(customerMemo);
//                 qbo.getInvoice(bookingStatus.quickbooksInvoiceQueryId, Meteor.bindEnvironment(function (error, invoice) {
//                     if(invoice) {
//                       console.log(invoice);
//                       qbo.updateInvoice({
//                         Id: bookingStatus.quickbooksInvoiceQueryId,
//                         Line: lineArray,
//                         BillEmail: billObject,
//                         CurrencyRef: currencyRef,
//                         SyncToken: invoice['SyncToken'],
//                         CustomerRef: {
//                           value: customer.quickbooksId
//                         },
//                         BillAddr: billAddr,
//                         TxnDate: moment(invoice.MetaData.CreateTime).format("YYYY-MM-DD"),
//                         TxnTaxDetail: txn.TxnTaxDetail,
//                         CustomerMemo: customerMemo
//                         //CustomField: customArray
//                       }, Meteor.bindEnvironment(function(error, invoice) {

//                       if(invoice.Fault != undefined) {
//                         var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                         bookingUpdate.status = invoice.Fault.Error[0].Message;

//                         delete bookingUpdate._id;
//                         BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                       } else {
//                         var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                         bookingUpdate.status = "OK";

//                         delete bookingUpdate._id;
//                         BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                       }
//                     }));

//                     InvoiceNeedingUpdate.remove({bookingId: bookingId});


//                     return "OK";
//                     }
//                 }));
//             }
//               return "Done";
//             }, function(error) {
//               return "Error";
//             }));
//         } else {
//             console.log("inside else");
//             var lineArray = [];
//             var chartOfAccounts = ChartOfAccounts.find();
//             var chartOfAccountsArray = [];
//             var customer = Customers.findOne({_id: bookingCustomer.customerId});
              
//             if(bookingStatus.status == "Void") {
//               console.log("inside void");
//               var lineObject = new Object();
//               lineObject.Amount = 0;
//               lineObject.DetailType = "SalesItemLineDetail";
//               lineObject.Description = "Cancellation";
//               lineObject.SalesItemLineDetail = new Object();
//               lineObject.SalesItemLineDetail.ItemRef = new Object();
//               lineObject.SalesItemLineDetail.ItemRef.value = "23";
//               lineObject.SalesItemLineDetail.ItemRef.name = "VOID";
//               lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//               lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//               lineObject.SalesItemLineDetail.UnitPrice = 0;
//               lineObject.SalesItemLineDetail.Qty = 1;
//               lineArray.push(lineObject);
//             }

//             if(bookingLineItems.length > 0) {
//               for(x in bookingLineItems) {
//                 var bookingGroupPrice = BookingGroupPrices.findOne({invoiceId: bookingId, groupId: parseInt(bookingLineItems[x].groupCounter)});

//                 if(privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] == undefined) {
//                   privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] = false;
//                 }
//                 if(bookingGroupPrice.privilege != undefined && privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] == false) {
//                     privilegeAdded[parseInt(bookingLineItems[x].groupCounter)] = true;
                    
//                     if(bookingGroupPrice.privilege.value > 0) {
//                       var customerArray = [];
//                       customerArray.push(bookingCustomer.customerId);

//                       var privilege = Privileges.findOne({customerId: {$in: customerArray}});

//                       var lineObject = new Object();
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -(bookingGroupPrice.privilege.value);
//                       }              
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "Privilege - " + privilege.name + " - " + bookingGroupPrice.privilege.percentage + "% off";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -(bookingGroupPrice.privilege.value);
//                       } 
                      
//                       lineObject.SalesItemLineDetail.Qty = 1;
//                       lineArray.push(lineObject);
//                     }
//                 }
                

//                     var lineObject = new Object();
//                     if(bookingStatus.status == "Void") {
//                       console.log("inside void");
//                       lineObject.Amount = 0;
//                     } else {
//                       lineObject.Amount = (bookingLineItems[x].discount + bookingLineItems[x].rate) * bookingLineItems[x].days * bookingLineItems[x].booked;
//                     } 
                    
//                     lineObject.DetailType = "SalesItemLineDetail";
//                     if(bookingLineItems[x].category == "Custom Item Rental") {
//                       lineObject.Description = "(Group " + (parseInt(bookingLineItems[x].groupCounter)+1) + ") " + bookingLineItems[x].item + " (" + bookingLineItems[x].booked + " units X " + bookingLineItems[x].days + "days) - CUSTOM";
//                     } else {
//                       lineObject.Description = "(Group " + (parseInt(bookingLineItems[x].groupCounter)+1) + ") " + bookingLineItems[x].brand + " " + bookingLineItems[x].item + " (" + bookingLineItems[x].booked + " units X " + bookingLineItems[x].days + "days)";
//                     }
//                     lineObject.SalesItemLineDetail = new Object();
//                     lineObject.SalesItemLineDetail.ItemRef = new Object();

//                     var coa = ChartOfAccounts.findOne({category: bookingLineItems[x].category});


//                     lineObject.SalesItemLineDetail.ItemRef.value = coa.qbValue;
//                     lineObject.SalesItemLineDetail.ItemRef.name = coa.qbName;
//                     lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                     lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                     if(bookingStatus.status == "Void") {
//                       console.log("inside void");
//                       lineObject.SalesItemLineDetail.UnitPrice = 0;
//                     } else {
//                       lineObject.SalesItemLineDetail.UnitPrice = (bookingLineItems[x].discount + bookingLineItems[x].rate);
//                     } 
                    
//                     lineObject.SalesItemLineDetail.Qty = bookingLineItems[x].booked * bookingLineItems[x].days;
//                     lineArray.push(lineObject);

//                     //check discount
//                     if(bookingLineItems[x].category == "Custom Item Rental" && bookingLineItems[x].discountOverwrite > 0) {
//                       var lineObject = new Object();
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -bookingLineItems[x].discountOverwrite;
//                       }
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "(Group " + (parseInt(x)+1) + ") " + bookingLineItems[x].item + " (" + bookingLineItems[x].booked + " units X " + bookingLineItems[x].days + "days) - DISCOUNT - CUSTOM";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -bookingLineItems[x].discountOverwrite;
//                       }
//                       lineObject.SalesItemLineDetail.Qty = 1;
//                       lineArray.push(lineObject);
//                     }
//                     else if(bookingLineItems[x].discountOverwrite > 0) {
//                       var lineObject = new Object();
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -bookingLineItems[x].discountOverwrite;
//                       } 
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "(Group " + (parseInt(bookingLineItems[x].groupCounter)+1) + ") " + bookingLineItems[x].brand + " " + bookingLineItems[x].item + " (" + bookingLineItems[x].booked + " units X " + bookingLineItems[x].days + "days) - DISCOUNT";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -bookingLineItems[x].discountOverwrite;
//                       }
//                       lineObject.SalesItemLineDetail.Qty = 1;
//                       lineArray.push(lineObject);
//                     } else if(bookingLineItems[x].discountPriced > 0) {
//                       var lineObject = new Object();
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.Amount = 0;
//                       } else {
//                         lineObject.Amount = -(bookingLineItems[x].discount * bookingLineItems[x].discountPriced);
//                       } 
//                       lineObject.DetailType = "SalesItemLineDetail";
//                       lineObject.Description = "(Group " + (parseInt(bookingLineItems[x].groupCounter)+1) + ") " + bookingLineItems[x].brand + " " + bookingLineItems[x].item + " (" + bookingLineItems[x].booked + " units X " + bookingLineItems[x].days + "days) - DISCOUNT";
//                       lineObject.SalesItemLineDetail = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef = new Object();
//                       lineObject.SalesItemLineDetail.ItemRef.value = "37";
//                       lineObject.SalesItemLineDetail.ItemRef.name = "Rental Discounts";
//                       lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//                       lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//                       if(bookingStatus.status == "Void") {
//                         console.log("inside void");
//                         lineObject.SalesItemLineDetail.UnitPrice = 0;
//                       } else {
//                         lineObject.SalesItemLineDetail.UnitPrice = -bookingLineItems[x].discount;
//                       }
//                       lineObject.SalesItemLineDetail.Qty = bookingLineItems[x].discountPriced;
//                       lineArray.push(lineObject);
//                     }

//               }
//             } else {
//               var lineObject = new Object();
//               lineObject.Amount = 0;
//               lineObject.DetailType = "SalesItemLineDetail";
//               lineObject.Description = "Application Query";
//               lineObject.SalesItemLineDetail = new Object();
//               lineObject.SalesItemLineDetail.ItemRef = new Object();
//               lineObject.SalesItemLineDetail.ItemRef.value = "44";
//               lineObject.SalesItemLineDetail.ItemRef.name = "Application Query";
//               lineObject.SalesItemLineDetail.TaxCodeRef = new Object();
//               lineObject.SalesItemLineDetail.TaxCodeRef.value = "6";
//               lineObject.SalesItemLineDetail.UnitPrice = 0;
//               lineObject.SalesItemLineDetail.Qty = 0;
//               lineArray.push(lineObject);
//             }

//             var txn = new Object();
//             txn.TxnTaxDetail = new Object();
//             if(bookingStatus.status == "Void") {
//               console.log("inside void");
//                 txn.TxnTaxDetail.TotalTax = 0;
//             } else {
//                 var subsubtotal = 0;

//                 for(r in bookingLineItems) {
//                     subsubtotal += (bookingLineItems[r].originalPriced * bookingLineItems[r].rate);
//                 }

//                 var gstgst = 0;

//                 var subsubdiscount = 0;

//                 var bookingprivilege = BookingPrivileges.findOne({invoiceId: bookingId});

//                 for(r in bookingLineItems) {
//                   if(bookingLineItems[r].discountOverwrite != undefined) {
//                     subsubdiscount += bookingLineItems[r].discountOverwrite;
//                   }
//                 }

//                 var bookinggroupprices = BookingGroupPrices.find({invoiceId: bookingId}).fetch();

//                 for(x in bookinggroupprices) {
//                   subsubtotal -= bookinggroupprices[x].privilege.value;
//                 }

//                 if(bookingprivilege != undefined && bookingprivilege.status == true) {
//                   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: bookingId});

//                   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);
//                 } 

//                 gstgst = (subsubtotal - subsubdiscount) * 0.07;


//                 console.log("/////subsubtotal/////");
//                 console.log(subsubtotal);

//                 console.log("/////subsubdiscount/////");
//                 console.log(subsubdiscount);

//                 console.log("/////gstgst/////");
//                 console.log(gstgst);

//                 txn.TxnTaxDetail.TotalTax = gstgst;
//             }
//             txn.TxnTaxDetail.TaxLine = [];
//             var taxLineObject = new Object();
//             if(bookingStatus.status == "Void") {
//               console.log("inside void");
//                 taxLineObject.Amount = 0;
//             } else {
//                 var subsubtotal = 0;

//                 for(r in bookingLineItems) {
//                     subsubtotal += (bookingLineItems[r].originalPriced * bookingLineItems[r].rate);
//                 }

//                 var gstgst = 0;

//                 var subsubdiscount = 0;

//                 var bookingprivilege = BookingPrivileges.findOne({invoiceId: bookingId});

//                 for(r in bookingLineItems) {
//                   if(bookingLineItems[r].discountOverwrite != undefined) {
//                     subsubdiscount += bookingLineItems[r].discountOverwrite;
//                   }
//                 }

//                 var bookinggroupprices = BookingGroupPrices.find({invoiceId: bookingId}).fetch();

//                 for(x in bookinggroupprices) {
//                   subsubtotal -= bookinggroupprices[x].privilege.value;
//                 }

//                 if(bookingprivilege != undefined && bookingprivilege.status == true) {
//                   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: bookingId});

//                   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);
//                 } 

//                 gstgst = (subsubtotal - subsubdiscount) * 0.07;


//                 console.log("/////subsubtotal/////");
//                 console.log(subsubtotal);

//                 console.log("/////subsubdiscount/////");
//                 console.log(subsubdiscount);

//                 console.log("/////gstgst/////");
//                 console.log(gstgst);

//                 taxLineObject.Amount = gstgst;
//             }
//             taxLineObject.DetailType = "TaxLineDetail"; 
//             taxLineObject.TaxLineDetail = new Object();
//             taxLineObject.TaxLineDetail.TaxRateRef = new Object();
//             taxLineObject.TaxLineDetail.TaxRateRef.value = "5";
//             taxLineObject.TaxLineDetail.PercentBased = true;
//             taxLineObject.TaxLineDetail.TaxPercent = 7;
//             if(bookingStatus.status == "Void") {
//               console.log("inside void");
//                 taxLineObject.TaxLineDetail.NetAmountTaxable = 0;
//             } else {
//                 var subsubtotal = 0;

//                 for(r in bookingLineItems) {
//                     subsubtotal += (bookingLineItems[r].originalPriced * bookingLineItems[r].rate);
//                 }

//                 var gstgst = 0;

//                 var subsubdiscount = 0;

//                 var bookingprivilege = BookingPrivileges.findOne({invoiceId: bookingId});

//                 for(r in bookingLineItems) {
//                   if(bookingLineItems[r].discountOverwrite != undefined) {
//                     subsubdiscount += bookingLineItems[r].discountOverwrite;
//                   }
//                 }

//                 var bookinggroupprices = BookingGroupPrices.find({invoiceId: bookingId}).fetch();

//                 for(x in bookinggroupprices) {
//                   subsubtotal -= bookinggroupprices[x].privilege.value;
//                 }

//                 if(bookingprivilege != undefined && bookingprivilege.status == true) {
//                   var bookinggroupprices = BookingGroupPrices.findOne({invoiceId: bookingId});

//                   var privilegepercentage = parseFloat(bookinggroupprices.privilege.percentage);
//                 } 

//                 gstgst = (subsubtotal - subsubdiscount) * 0.07;


//                 console.log("/////subsubtotal/////");
//                 console.log(subsubtotal);

//                 console.log("/////subsubdiscount/////");
//                 console.log(subsubdiscount);

//                 console.log("/////gstgst/////");
//                 console.log(gstgst);

//                 taxLineObject.TaxLineDetail.NetAmountTaxable = subsubtotal - subsubdiscount;
//             }
//             txn.TxnTaxDetail.TaxLine.push(taxLineObject);

//             var currencyRef = new Object();
//             currencyRef.value = "SGD";
//             currencyRef.name = "Singapore Dollar";

//             var string = "";

//             if(bookingProject.projectName != undefined) {
//                 string = string.concat("Project Name: " + bookingProject.projectName + ".");
//             }

//             for(d in bookingStatus.displayDates) {
//               string = string.concat("Group " + (parseInt(bookingStatus.displayDates[d].id) + 1) + ": ");

//               for(e in bookingStatus.displayDates[d].dateArray) {
//                 if(bookingStatus.displayDates[d].dateArray[e].length > 1) {
//                   string = string.concat(bookingStatus.displayDates[d].dateArray[e][0] + " - " + bookingStatus.displayDates[d].dateArray[e][1]) + ",";
//                 } else {
//                   string = string.concat(bookingStatus.displayDates[d].dateArray[e][0]) + ",";
//                 }
//               }
//             }

//             var customerMemo = new Object();

//             string = string.concat(" --- Generated at: " + moment().format('Do MMMM YYYY, h:mma'));

//             customerMemo.value = string;

//             var billObject = new Object();
//             billObject.Address = customer.email;
            
//             var billAddr = new Object();
//             billAddr.Id = parseInt(customer2.quickbooksId) + 1;
//             billAddr.Line1 = customer2.name;
//             billAddr.Line2 = customer2.address;

//             if(bookingStatus.quickbooksInvoiceQueryId == "Pending") {
//               var latestDocNumber = QuickbooksInvoices.findOne({latest: true});

//               latestDocNumber.invoiceDocNumber = parseInt(latestDocNumber.invoiceDocNumber);  
              

//               qbo.createInvoice({
//                 DocNumber: latestDocNumber.invoiceDocNumber,
//                 Line: lineArray,
//                   CurrencyRef: currencyRef,
//                 CustomerRef: {
//                   value: customer.quickbooksId
//                 },
//                 BillAddr: billAddr,
//                 BillEmail: billObject,
//                 TxnTaxDetail: txn.TxnTaxDetail,
//                 CustomerMemo: customerMemo
//               }, Meteor.bindEnvironment(function (error, invoice) {
             

//                 if(invoice.Fault != undefined) {
//                   var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                   bookingUpdate.status = invoice.Fault.Error[0].Message;

//                   delete bookingUpdate._id;
//                   BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                 } else {
//                   latestDocNumber.invoiceDocNumber += 1;

//                   var latestDocNumberId = latestDocNumber._id;
//                   delete latestDocNumber._id;

//                   QuickbooksInvoices.update({_id: latestDocNumberId}, {$set: latestDocNumber});
//                   console.log("INVOICE OK CREATE");
//                   console.log(bookingId);
//                   bookingStatus.quickbooksInvoiceId = invoice.DocNumber;
//                   bookingStatus.quickbooksInvoiceQueryId = invoice.Id;
//                   var bookingId = booking._id;
//                   BookingStatuses.update({invoiceId: bookingId}, {$set: bookingStatus});

//                   console.log(bookingId);

//                   InvoiceNeedingUpdate.remove({bookingId: bookingId});

//                   var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                   bookingUpdate.status = "OK";

//                   delete bookingUpdate._id;
//                   BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                 }
//               }));
//             } else {
//                 console.log("INSIDE NOT PENDING");
//                 console.log(bookingStatus.quickbooksInvoiceQueryId);
                
//                 qbo.getInvoice(bookingStatus.quickbooksInvoiceQueryId, Meteor.bindEnvironment(function (error, invoice) {
//                     if(invoice) {
//                       qbo.updateInvoice({
//                       Id: bookingStatus.quickbooksInvoiceQueryId,
//                       Line: lineArray,
//                       CurrencyRef: currencyRef,
//                       SyncToken: invoice['SyncToken'],
//                       CustomerRef: {
//                         value: customer.quickbooksId
//                       },
//                       BillAddr: billAddr,
//                       BillEmail: billObject,
//                       TxnDate: moment(invoice.MetaData.CreateTime).format("YYYY-MM-DD"),
//                       TxnTaxDetail: txn.TxnTaxDetail,
//                       CustomerMemo: customerMemo
//                       //CustomField: customArray
//                     }, Meteor.bindEnvironment(function(error, invoice) {

//                       if(invoice.Fault != undefined) {
//                         var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                         bookingUpdate.status = invoice.Fault.Error[0].Message;

//                         delete bookingUpdate._id;
//                         BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                       } else {
//                         var bookingUpdate = BookingUpdates.findOne({invoiceId: bookingId});
//                         bookingUpdate.status = "OK";

//                         delete bookingUpdate._id;
//                         BookingUpdates.update({invoiceId: bookingId}, {$set: bookingUpdate});
//                       }
//                     }));

//                     InvoiceNeedingUpdate.remove({bookingId: booking._id});


//                     return "OK";
//                     }
//                 }));
//             }
//         }  
//       },