Template.packages.events({
	'click #items': function(event, template) {
		Router.go('inventory');
	},
  'click #repairs': function(event, template) {
    Router.go('repairs');
  }
});