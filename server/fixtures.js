Meteor.startup(function () {
  if(Inventory.find().count() == 0) {

  	Inventory.insert({
  		bookableQuantity: 10,
  		brand: "Canon",
  		category: "Cameras",
  		item: "5D Mk II",
  		price: 250,
  		rate: 50,
  		quantity: 10,
  		supplier: "",
		createdAt: new Date(),
		updatedAt: new Date(),
		queryName: "Canon 5D Mk II",
		createdBy: "supershazwi",
		updatedBy: "supershazwi",
		remarkCount: 0,
		remarks: [],
    serialNo: [
    {
        "id" : 0, 
        "serialNo" : "1", 
        "status" : "Available", 
        "remarkCount" : 0, 
        "remarks" : [

        ]
    }, 
    {
        "id" : 0, 
        "serialNo" : "2", 
        "status" : "Available", 
        "remarkCount" : 0, 
        "remarks" : [

        ]
    }, 
    {
        "id" : 0, 
        "serialNo" : "3", 
        "status" : "Available", 
        "remarkCount" : 0, 
        "remarks" : [

        ]
    }, 
    ],
		logs: [ 
			{
			    "content" : "supershazwi created item.",
			    "owner" : "supershazwi",
			    "dateTime" : new Date()
			}, 
		]
	});

  }

  if(Customers.find().count() == 0) {

  	Customers.insert({
  		name: "Shazwi Suwandi",
  		firstName: "Shazwi",
  		middleName: "",
  		lastName: "Suwandi",
  		email: "supershazwi@gmail.com",
  		ic: "S123456789G",
  		company: "Camwerkz",
  		address: "",
  		noOfBookings: 0,
  		totalValue: 0,
  		contact: "93839053",
  		createdAt: new Date(),
  		updatedAt: new Date(),
  		createdBy: "supershazwi",
  		updatedBy: "supershazwi",
  		quickbooksId: null,
  		logs: [],
  		images: [],
  		icStatus: false
	});

  }

  if(Brands.find().count() == 0) {

  	Brands.insert({
  		name: "Canon", 
  		category: "Cameras", 
  		noOfItems: 30
	});

  }

  if(Categories.find().count() == 0) {

  	Categories.insert({
  		name: "Cameras", 
  		noOfItems: 30
	});

  }
});