Categories = new Mongo.Collection('categories');

Meteor.methods({
  addInventoryCategory: function(categoryAttributes) {

    var category = _.extend(categoryAttributes, {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Jason',
      updatedBy: 'Jason'
    });

    Categories.insert(category);
  }
});