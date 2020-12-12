Template.inventory.created = function () {
    Meteor.subscribe('inventories');
    Meteor.subscribe('categories');
    Meteor.subscribe('brands');

    console.log(Meteor.user()._id);
};

Template.inventory.rendered = function () {
  Session.clear("category");
  Session.clear("brand");
};

Template.inventory.helpers({
  categories: function () {
    var distinctCategories = _.uniq(Categories.find({}, {
        sort: {name: 1}, fields: {name: true}
    }).fetch().map(function(x) {
        return x.name;
    }), true);

    if(distinctCategories.length != 0) {
      if(distinctCategories.length % 2 == 0) { //number of distinctCategories is even
        var distinctCategoriesArray = []; 

        for (i = 0; i < distinctCategories.length; i++) { 
          if(i%2 == 0) {
            object = [];
            object.push(distinctCategories[i]);
          } else {
            object.push(distinctCategories[i]);
            distinctCategoriesArray.push(object);
          }
        }
      } else { //number of distinctCategories is odd
        var distinctCategoriesArray = []; 
        for (i = 0; i < distinctCategories.length; i++) { 
          if(i%2 == 0) {
            if(distinctCategories.length - 1 == i) {
              object = [];
              object.push(distinctCategories[i]);
              distinctCategoriesArray.push(object);
            } else {
              object = [];
              object.push(distinctCategories[i]);
            }
          } else {
            object.push(distinctCategories[i]);
            distinctCategoriesArray.push(object);
          }
        }
      }
    }
    return distinctCategoriesArray;
  },
});

Template.inventory.events({
  'click #hello': function() {
    console.log("Hello");
  },
	'click .category': function(event, template) {
    Session.setTemp('category', event.currentTarget.id);
		Router.go('brands');
	},
  'click #packages': function(event, template) {
    Router.go('packages');
  },
  'click #repairs': function(event, template) {
    Router.go('repairs');
  }
});