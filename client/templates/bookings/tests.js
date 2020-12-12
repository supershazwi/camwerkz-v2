Template.tests.rendered = function() {
	
	scheduler.config.dblclick_create = true;
	scheduler.config.edit_on_create = false;
	scheduler.config.drag_create = true;
	scheduler.config.full_day = true;

	scheduler.attachEvent("onClick", function (id, e){
       //any custom logic here
       scheduler.deleteEvent(id);
       return true;
  });

	scheduler.attachEvent("onEventAdded", function(id,ev){
    //any custom logic here
    
    scheduler.showEvent(id);
});

      scheduler.attachEvent("onEventCreated", function (event_id) {
      	console.log("on event created");
         var ev = scheduler.getEvent(event_id);
         ev.text = "";
         ev.color = "#ff4a4a";
         //full day event, 'full day' will be checked
         ev.start_date = scheduler.date.date_part(new Date(ev.start_date));
         ev.end_date = scheduler.date.add(ev.start_date, 1, 'day')
         ev.description = "default value";
         //scheduler.showEvent(event_id);
      });



	scheduler.init("scheduler_here", new Date(), "month");

};