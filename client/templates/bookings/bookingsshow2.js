

Template.bookingsshow2.created = function () {
  Router.go('bookings.show', {_id: Router.current().params._id}, {});
};
