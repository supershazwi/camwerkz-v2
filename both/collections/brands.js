Brands = new Mongo.Collection('brands');

Meteor.methods({
  addInventoryBrand: function(brandAttributes) {

    var brand = _.extend(brandAttributes, {
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: 'Jason',
      updatedBy: 'Jason'
    });

    Brands.insert(brand);
  }
});