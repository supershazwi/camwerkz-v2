Template.brands.created = function () {
};

Template.brands.rendered = function () {
};

Template.brands.helpers({
  brands: function () {
    var distinctBrands = _.uniq(Inventory.find({category: Session.get("category")}, {
        sort: {brand: 1}, fields: {brand: true}
    }).fetch().map(function(x) {
        return x.brand;
    }), true);

    console.log(distinctBrands);

    if(distinctBrands.length != 0) {
      if(distinctBrands.length % 2 == 0) { //number of distinctBrands is even
        var distinctBrandsArray = []; 

        for (i = 0; i < distinctBrands.length; i++) { 
          if(i%2 == 0) {
            object = [];
            object.push(distinctBrands[i]);
          } else {
            object.push(distinctBrands[i]);
            distinctBrandsArray.push(object);
          }
        }
      } else { //number of distinctBrands is odd
        var distinctBrandsArray = []; 
        for (i = 0; i < distinctBrands.length; i++) { 
          if(i%2 == 0) {
            if(distinctBrands.length - 1 == i) {
              object = [];
              object.push(distinctBrands[i]);
              distinctBrandsArray.push(object);
            } else {
              object = [];
              object.push(distinctBrands[i]);
            }
          } else {
            object.push(distinctBrands[i]);
            distinctBrandsArray.push(object);
          }
        }
      }
    }

    return distinctBrandsArray;
  },
  category: function () {
    return Session.get('category');
  }
});

Template.brands.events({
  'click .brand': function(event, template) {
    Session.setTemp('brand', event.currentTarget.id);
    Router.go('items');
  },
});