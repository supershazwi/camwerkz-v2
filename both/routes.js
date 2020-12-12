// Router.route('/', {
//   name: 'splashPage'
// });

// Router.map(function () {
//     this.route('splashPage', {
//         path: '/',

//         onBeforeAction: function (pause) {
//           if (Meteor.user()) {
//             // render the login template but keep the url in the browser the same
//             Router.go('home');
//           } else {
//             this.next();
//           }
//         }
//     })
// });

Router.configure({
  progress: false
});

Router.route('/', {
  name: 'login'
});

Router.route('/home', {
  name: 'home'
});

Router.route('/unrelated', {
  name: 'unrelated'
});

//Router.route('/', {
  //name: 'trending'
//});

LogsController = RouteController.extend({
  layoutTemplate: 'appLayout',
  template: 'logs',
  increment: 5,
  logsLimit: function() {
    return parseInt(this.params.logsLimit) || this.increment;
  },
  findOptions: function() {
    return {sort: {createdAt: -1}, limit: this.logsLimit()};
  },
  subscriptions: function() {
    this.logsSub = Meteor.subscribe('logsPaginate', this.findOptions());
  },
  logs: function() {
    return Logs.find({}, this.findOptions());
  },
  data: function() {
    var hasMore = this.logs().count() === this.logsLimit();
    var nextPath = this.route.path({logsLimit: this.logsLimit() + this.increment});
    return {
      logs: this.logs(),
      ready: this.logsSub.ready,
      nextPath: hasMore ? nextPath : null
    };
  }
});

Router.route('/logs/:logsLimit?', {
  name: 'logs'
});

Router.route('/eula', {
  name: 'eula'
});

Router.route('/privacy', {
  name: 'privacy'
});

// OthersController = RouteController.extend({
//   layoutTemplate: 'appLayout',
//   template: 'others',
//   increment: 5,
//   othersLimit: function() {
//     return parseInt(this.params.othersLimit) || this.increment;
//   },
//   findOptions: function() {
//     return {sort: {createdAt: -1}, limit: this.othersLimit()};
//   },
//   subscriptions: function() {
//     this.othersSub = Meteor.subscribe('othersPaginate', this.findOptions());
//   },
//   others: function() {
//     return Others.find({}, this.findOptions());
//   },
//   data: function() {
//     var hasMore = this.others().count() === this.othersLimit();
//     var nextPath = this.route.path({othersLimit: this.othersLimit() + this.increment});
//     return {
//       others: this.others(),
//       ready: this.othersSub.ready,
//       nextPath: hasMore ? nextPath : null
//     };
//   }
// });

Router.route('/others', {
  name: 'others'
});

Router.route('/others/:_id', {
  name: 'others.show'
});



// QuotationsController = RouteController.extend({
//   layoutTemplate: 'appLayout',
//   template: 'quotations',
//   increment: 5,
//   quotationsLimit: function() {
//     return parseInt(this.params.quotationsLimit) || this.increment;
//   },
//   findOptions: function() {
//     return {sort: {createdAt: -1}, limit: this.quotationsLimit()};
//   },
//   subscriptions: function() {
//     this.quotationsSub = Meteor.subscribe('quotationsPaginate', this.findOptions());
//   },
//   quotations: function() {
//     return Quotations.find({}, this.findOptions());
//   },
//   data: function() {
//     var hasMore = this.quotations().count() === this.quotationsLimit();
//     var nextPath = this.route.path({quotationsLimit: this.quotationsLimit() + this.increment});
//     return {
//       quotations: this.quotations(),
//       ready: this.quotationsSub.ready,
//       nextPath: hasMore ? nextPath : null
//     };
//   }
// });

Router.route('/quotations', {
  name: 'quotations'
});


Router.route('/quotations/:_id', {
  name: 'quotations.show'
});

// BookingsController = RouteController.extend({
//   layoutTemplate: 'appLayout',
//   template: 'bookings',
//   increment: 5,
//   bookingsLimit: function() {
//     return parseInt(this.params.bookingsLimit) || this.increment;
//   },
//   findOptions: function() {
//     return {sort: {createdAt: -1}, limit: this.bookingsLimit()};
//   },
//   subscriptions: function() {
//     this.bookingsSub = Meteor.subscribe('bookingsPaginate', this.findOptions());
//   },
//   bookings: function() {
//     return Bookings.find({}, this.findOptions());
//   },
//   data: function() {
//     var hasMore = this.bookings().count() === this.bookingsLimit();
//     var nextPath = this.route.path({bookingsLimit: this.bookingsLimit() + this.increment});
//     return {
//       bookings: this.bookings(),
//       ready: this.bookingsSub.ready,
//       nextPath: hasMore ? nextPath : null
//     };
//   }
// });

// Router.route('/bookings/limit/:bookingsLimit?', {
//   name: 'bookings'
// });

Router.route('/bookings', {
  name: 'bookings'
});

// Router.route('/bookings/:_id/logs/:bookingLogsLimit?', {
//   name: 'bookingLogs'
// });

Router.route('/bookings/:_id/recordPayment', {
  name: 'bookingsRecordPayment'
});

Router.route('/bookings/bookings/:_id', {
  name: 'bookingsshow2'
});

Router.route('/bookings/:_id', {
  name: 'bookings.show'
});

Router.route('/bookings/:_id/logs', {
  name: 'bookingLogs'
});

Router.route('/customers/:_id/logs', {
  name: 'customerLogs'
});

// Router.route('/bookings/:_id', {

//   layoutTemplate: 'appLayout',
//   waitOn: function() {
//       // returning a subscription handle or an array of subscription handles
//       // adds them to the wait list.
//       return [
//         Meteor.subscribe('booking',this.params._id),
//         Meteor.subscribe('bookinglineitemsByBooking',this.params._id),
//         Meteor.subscribe('bookinggroupsByBooking',this.params._id),
//         Meteor.subscribe('bookingcustomersByBooking',this.params._id)
//       ];
//     },

//     action: function () {
//       this.render('bookings.show',this.params._id);
//     }
// });

Router.route('/overdueBookings', {
  name: 'overdueBookings'
});

Router.route('/bookings/:_id/print', {
  name: 'bookingPrint.show'
});

Router.route('/others/:_id/print', {
  name: 'otherPrint.show'
});

Router.route('/others/:_id/logs', {
  name: 'otherLogs'
});

CustomersController = RouteController.extend({
  layoutTemplate: 'appLayout',
  template: 'customers',
  increment: 5,
  customersLimit: function() {
    return parseInt(this.params.customersLimit) || this.increment;
  },
  findOptions: function() {
    return {sort: {createdAt: -1}, limit: this.customersLimit()};
  },
  subscriptions: function() {
    this.customersSub = Meteor.subscribe('customersPaginate', this.findOptions());
  },
  customers: function() {
    return Customers.findFromPublication('customersPaginate');
  },
  data: function() {
    var hasMore = this.customers().count() === this.customersLimit();
    var nextPath = this.route.path({customersLimit: this.customersLimit() + this.increment});
    return {
      customers: this.customers(),
      ready: this.customersSub.ready,
      nextPath: hasMore ? nextPath : null
    };
  }
});



Router.route('/customers/limit/:customersLimit?', {
  name: 'customers'
});

//Router.route('/logs', {
  //name: 'logs'
//});

Router.route('/customers/:_id/editDetails', {
  name: 'customersEditDetails'
});

Router.route('/tests', {
  name: 'tests'
});

Router.route('/customers/:_id/addPackage', {
  name: 'customersAddPackage'
});

Router.route('/customers/:_id/addPrivilege', {
  name: 'customersAddPrivilege'
});


Router.route('/customers/quickbookscreate', {
  name: 'customersQuickbooksCreate'
});

Router.route('/customers/create', {
  name: 'customersCreate'
});

Router.route('/inventory/create', {
  name: 'inventoryCreate'
});

Router.route('/inventory/duplicate', {
  name: 'inventoryDuplicate'
});

Router.route('/inventory/:_id/edit', {
  name: 'inventoryEdit'
});


Router.route('/customers/:_id', {
  name: 'customers.show'
});

Router.route('/privileges', {
  name: 'privileges'
});

Router.route('/privileges/:_id/edit', {
  name: 'privilegesEdit'
});

Router.route('/privileges/:_id/editEquipment', {
  name: 'privilegesEditEquipment'
});

Router.route('/privileges/:_id/editCustomers', {
  name: 'privilegesEditCustomers'
});

Router.route('/privileges/create', {
  name: 'privilegesCreate'
});

Router.route('/bookings/:_id/createInvoice', {
  name: 'bookingCreateInvoice'
});

Router.route('/privileges/:_id', {
  name: 'privileges.show'
});

Router.route('/privileges/:url', {
  name: 'privilegeLogs.show'
});

Router.route('/sigpad', {
  name: 'sigpad'
});

Router.route('/customerPackages/:_id', {
  name: 'customerPackages.show'
});

Router.route('/customerPackages/:url', {
  name: 'customerPackageLogs.show'
});

Router.route('/brands', {
  name: 'brands'
});

Router.route('/items', {
  name: 'items'
});

Router.route('/inventory', {
  name: 'inventory'
});

// Router.route('/notifications', {
//   loadingTemplate: 'loading',

//   waitOn: function() {
//       // returning a subscription handle or an array of subscription handles
//       // adds them to the wait list.
//       return [
//         Meteor.subscribe('calendars'),
//         Meteor.subscribe('bookingsWithoutBaggage')
//       ];
//     },

//     action: function () {
//       this.render('notifications');
//     }
// });

Router.route('/notifications', {
  name: "notifications"
});

Router.route('/overdueBookingsTemplate', {
  loadingTemplate: 'loading2',

  waitOn: function() {
      // returning a subscription handle or an array of subscription handles
      // adds them to the wait list.
      return [
        Meteor.subscribe('calendars'),
        Meteor.subscribe('bookingsWithoutBaggage')
      ];
    },

    action: function () {
      this.render('overdueBookingsTemplate');
    }
});

Router.route('/repairs', {
  name: 'repairs'
});

Router.route('/inventoryItem/:_id', {
  name: 'inventoryItem.show'
});

Router.route('/inventoryItem/:_id/addRemark', {
  name: 'inventoryItemAddRemark'
});

Router.route('/inventoryItem/:url', {
  name: 'inventoryLogs.show'
});

Router.route('/inventoryItem/:itemId', {
  name: 'repairItem.show'
});

Router.route('/others/:_id/viewCustomerSignature', {
  name: 'othersViewCustomerSignature'
});

Router.route('/others/:_id/customerSign', {
  name: 'othersCustomerSign'
});

Router.route('/bookings/:_id/viewCustomerSignature', {
  name: 'bookingsViewCustomerSignature'
});

Router.route('/bookings/:_id/viewSignature', {
  name: 'bookingsViewSignature'
});

Router.route('/bookings/:_id/staffSign', {
  name: 'bookingsStaffSign'
});

Router.route('/bookings/:_id/customerSign', {
  name: 'bookingsCustomerSign'
});


Router.route('/bookings/:_id/viewStatuses', {
  name: 'bookingsViewStatuses'
});

Router.route('/bookings/:_id/addBookingDates', {
  name: 'bookingsAddBookingDates'
});

Router.route('/bookings/:_id/serialNoSelect', {
  name: 'bookingsSerialNoSelect'
});

Router.route('/bookings/:_id/addBookingItems', {
  name: 'bookingsAddBookingItems'
});

Router.route('/others/:_id/recordPayment', {
  name: 'othersRecordPayment'
});

Router.route('/others/:_id/addOtherItems', {
  name: 'othersAddOtherItems'
});

Router.route('/others/:_id/serialNoSelect', {
  name: 'othersSerialNoSelect'
});

Router.route('/bookings/:url', {
  name: 'bookLogs.show'
});

Router.route('/packages', {
  name: 'packages'
});

Router.route('/makebooking', {
  layoutTemplate: 'appLayout',
  name: 'makeBooking'
});



Router.route('/calendars', {
  name: 'calendars'
});

Router.route('/clashCalendars', {
  name: 'clashCalendars'
});

Router.route('/overbookedCalendars', {
  name: 'overbookedCalendars'
});

// Router.route('/equipmentCalendars', {
//   name: 'equipmentCalendars'
// });

Router.route('/equipmentCalendars', {

  waitOn: function() {
      // returning a subscription handle or an array of subscription handles
      // adds them to the wait list.
      return [
        Meteor.subscribe('inventories')
      ];
    },

    action: function () {
      this.render('equipmentCalendars');
    }
});

Router.route('/calendars/:_id', {
  name: 'calendars.show'
});

Router.route('/loading', {
  name: 'loading'
});

Router.route('/recent', {
  name: 'recent'
});

Router.route('/settings', {
  name: 'settings'
});

Router.route('/products/:_id', {
  name: 'products.show'
});

Router.route('/users/:_id', {
  name: 'users.show'
});

Router.route('/profile', {
  name: 'profile'
});

var requireLogin = function() {
  if (!Meteor.user()) {
    if (Meteor.loggingIn()) {
      this.render(this.loadingTemplate);
    } else {
      Router.go('login');
    }
  } else {
    this.next();
  }
}

// if (Meteor.isClient){
//   Router.onBeforeAction(requireLogin, {only: ['home', 'hasMore','logs', 'settings', 'customers', 'customers.show', 'privileges', 'others', 'customerPackages.show', 'brands', 'items', 'inventory', 'notifications', 'reapirs', 'inventoryItem.show', 'repairItem.show', 'packages', 'bookings', 'makeBooking', 'bookings.show', 'calendars', 'equipmentCalendars', 'calendars.show', 'quotations', 'quotations.show']});
// }
