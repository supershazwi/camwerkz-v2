Template.splashPage.created = function () {
};

Template.splashPage.rendered = function () {
  
};


Template.splashPage.events({
  'click #login': function (event, template) {
    var email = $('[name=email]').val();
    var password = $('[name=password]').val();

    Meteor.loginWithPassword(email, password, function(error){
        if(error){
          Session.setTemp("error", true);
          Session.setTemp("errorMessage", error.reason);
        } else {
            Router.go("home");
        }
    });
  },
  'click #signUp': function (event, template) {
    var email = $('[name=email]').val();
    var password = $('[name=password]').val();
    var username = $('[name=username]').val();

    console.log(email);
    console.log(password);
    Accounts.createUser({
        username: username,
        email: email,
        password: password
    }, function(error) {
      console.log(error);
      if(error) {
        Session.setTemp("error", true);
        Session.setTemp("errorMessage", error.reason);
      } else {
        Meteor.loginWithPassword(email, password, function(error){
            if(error){
              Session.setTemp("error", true);
              Session.setTemp("errorMessage", error.reason);
            } else {
                Router.go("home");
            }
        });
      }
    });
  }
});

Template.splashPage.helpers({
  error: function() {
    return Session.get("error");
  },
  errorMessage: function() {
    return Session.get("errorMessage");
  }
});