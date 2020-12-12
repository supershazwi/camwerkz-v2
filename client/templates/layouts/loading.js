Template.loading.rendered = function () {
  this.loading = window.pleaseWait({
      logo: '/images/calendar.png',
      backgroundColor: '#468966',
      loadingHtml: message + spinner
    });
};

Template.loading.destroyed = function () {
  if ( this.loading ) {
    this.loading.finish();
  }
};

var message = '<p class="loading-message" style="color: white;">Loading Equipment Calendar</p>';
var spinner = '<div class="sk-spinner sk-spinner-pulse"></div>';