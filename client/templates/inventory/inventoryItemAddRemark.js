Template.inventoryItemAddRemark.rendered = function() {


  $("#remark").focus();
}

Template.inventoryItemAddRemark.events({
    'click #addRemark': function(e) {
      e.preventDefault();  

      var remarkAttributes = {
        remark: $("#remark").val(),
          routeId: Router.current().params._id,
          serialNoClicked: Session.get("serialNoClicked"),
          itemIdClicked: Session.get("itemIdClicked")
      };

      IonModal.close();
      IonKeyboard.close();
          
      Meteor.call('addItemRemark', remarkAttributes, function(error, result) {
        Router.go('inventoryItem.show', {_id: Router.current().params._id}, {});
      });
    }
});

Template.inventoryItemAddRemark.helpers({
 
});