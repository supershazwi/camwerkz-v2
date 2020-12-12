Accounts.onCreateUser(function(options, user) {
    //pass the surname in the options
    if (options.profile) {
        user.profile = options.profile;
        user.username = user.services.quickbooks.firstName + " " + user.services.quickbooks.lastName;
    }

  return user;
});	