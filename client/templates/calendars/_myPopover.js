Template._myPopover.created = function () {
  
};

Template._myPopover.rendered = function () {
};

Template._myPopover.helpers({
  
});

Template._myPopover.events({
  'click .item': function(e) {
    $('.popover-backdrop').css('display', 'none');
  },
});