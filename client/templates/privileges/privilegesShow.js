Template.privilegesShow.created = function () {
  Meteor.subscribe('privilege', Router.current().params._id);
  Meteor.subscribe('customersByPrivilege', Router.current().params._id);
};

Template.privilegesShow.rendered = function () {
  var customers = Customers.find({}, {fields: {name: 1, company: 1}, sort: {name: 1}}).fetch();

  $('#inventoryCategorySearch').selectize({
      persist: false,
      maxItems: null,
      valueField: '_id',
      labelField: 'name',
      searchField: ['name', 'company'],
      options: customers,
      render: {
          item: function(item, escape) {
              return '<div>' +
                  (item.name ? '<span class="name"><strong>' + escape(item.name) + '</strong></span>' : '') +
                  (item.company ? ' <span class="email">' + escape(item.company) + '</span>' : '') +
              '</div>';
          },
          option: function(item, escape) {
              var label = item.name || item.company;
              var caption = item.name ? item.company : null;
              return '<div>' +
                  '<span class="label"><strong>' + escape(label) + '</strong></span>' +
                  (caption ? ' <span class="caption">' + escape(caption) + '</span>' : '') +
              '</div>';
          }
      },
  });

  $('#inventorySearch').selectize({
      persist: false,
      maxItems: null,
      valueField: '_id',
      labelField: 'name',
      searchField: ['name', 'company'],
      options: customers,
      render: {
          item: function(item, escape) {
              return '<div>' +
                  (item.name ? '<span class="name"><strong>' + escape(item.name) + '</strong></span>' : '') +
                  (item.company ? ' <span class="email">' + escape(item.company) + '</span>' : '') +
              '</div>';
          },
          option: function(item, escape) {
              var label = item.name || item.company;
              var caption = item.name ? item.company : null;
              return '<div>' +
                  '<span class="label"><strong>' + escape(label) + '</strong></span>' +
                  (caption ? ' <span class="caption">' + escape(caption) + '</span>' : '') +
              '</div>';
          }
      },
  });
};

Template.privilegesShow.helpers({
  privilegeId: function() {
    return Router.current().params._id;
  },
  privilege: function () {
    return Privileges.findOne({_id: Router.current().params._id});
  },
  customersExist: function() {
    if(Privileges.findOne({_id: Router.current().params._id}).customerId.length == 0)
      return false;
    else
      return true;
  },
  customer: function() {
    var customerId = Privileges.findOne({_id: Router.current().params._id}).customerId;
    var customers = [];
    for(x in customerId) {
      customers.push(Customers.findOne({_id: customerId[x]}));
    }

    return customers;
  },
  equipmentExist: function() {
    if(Privileges.findOne({_id: Router.current().params._id}).equipments.length == 0)
      return false;
    else
      return true;
  },
  equipment: function() {
    var equipmentId = Privileges.findOne({_id: Router.current().params._id}).equipments;
    var equipments = [];
    for(x in equipmentId) {
      equipments.push(Inventory.findOne({_id: equipmentId[x]}));
    }

    return equipments;
  }
});

Template.privilegesShow.events({
  'click [data-action="showDeleteConfirm"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Privilege',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        Meteor.call('deletePrivilege', Router.current().params._id, function(error, result) {
          Router.go('privileges');
        });
      },
      onCancel: function() {
      }
    });
  },
  'click #remove': function(e) {
    console.log('remove');
  },
  'click .removeCustomer': function(e) {
    var attr = new Object();
    attr._id = Router.current().params._id;
    attr.customerId = e.currentTarget.id;

    Meteor.call('removeCustomerFromPrivilege', attr, function(error, result) {
        });
  },
  'click .removeEquipment': function(e) {
    var attr = new Object();
    attr._id = Router.current().params._id;
    attr.equipmentId = e.currentTarget.id;

    Meteor.call('removeEquipmentFromPrivilege', attr, function(error, result) {
    });
  },
  'click [data-action="removeAllCustomers"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Item',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        Meteor.call('removeAllCustomersFromPrivilege', Router.current().params._id, function(error, result) {
        });
      },
      onCancel: function() {
      }
    });
  },
  'click [data-action="removeAllEquipments"]': function(event, template) {
    IonPopup.confirm({
      title: 'Delete Item',
      template: 'Are you <strong>really</strong> sure?',
      onOk: function() {
        Meteor.call('removeAllEquipmentsFromPrivilege', Router.current().params._id, function(error, result) {
        });
      },
      onCancel: function() {
      }
    });
  },
});