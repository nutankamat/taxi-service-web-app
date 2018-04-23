'use strict';

// Initializes FuberTaxiService
function FuberTaxiService() {
	this.checkSetup();

	this.base_api_url = "https://us-central1-fuber-taxi-service.cloudfunctions.net/" 
	// this.base_api_url = "http://localhost:5001/fuber-taxi-service/us-central1/" //(for local testing)

	// Data for list of cabs
	var url = new URL(window.location.href);

	this.user_lat =  url.searchParams.get("lat");
	this.user_long = url.searchParams.get("long") ;
	this.radius = url.searchParams.get("radius"); 
	
	this.colors = url.searchParams.get("colors");
	this.color_choices = [];

	if(this.user_lat){
		this.user_lat = parseFloat(this.user_lat);
	}
	else{
		this.user_lat = 15.537727;
	}

	if(this.user_long){
		this.user_long = parseFloat(this.user_long);
	}
	else{
		this.user_long = 73.831614;
	}	

	if(this.radius){
		this.radius = parseFloat(this.radius);
	}
	else{
		this.radius = 10;
	}	

	if(this.colors){
		this.color_choices =  this.colors.split(",");
	}
	else{
		this.color_choices = [];
	}	
	
	this.initFirebase();
}  

FuberTaxiService.prototype.checkSetup = function() {

	try {
		let app = firebase.app();
		let features = ['auth', 'database', 'messaging', 'storage'].filter(feature => typeof app[feature] === 'function');
		document.getElementById('load').innerHTML = `Firebase SDK loaded with ${features.join(', ')}`;
	} catch (e) {
		console.error("Error - " , e);
		document.getElementById('load').innerHTML = 'Error loading the Firebase SDK, check the console.';
	}
		 
};

// Sets up shortcuts to Firebase features and initiate firebase auth.
FuberTaxiService.prototype.initFirebase = function() {
	// Shortcuts to Firebase SDK features.
	// this.auth = firebase.auth();
	this.database = firebase.database();
	// this.storage = firebase.storage();

	this.loadAvailableCabs();
};

FuberTaxiService.prototype.displayCabs = function(data) {
	console.log(data);
};


// Sets up shortcuts to Firebase features and initiate firebase auth.
FuberTaxiService.prototype.loadAvailableCabs = function() {

	// api url for finding cabs
	var api_url = this.base_api_url + "findCabs";
	
	// set data to be sent to api
	var data = {
		"user_location" : [this.user_lat, this.user_long]
	}

	if(this.radius){
		data["radius"] = this.radius
	}

	if(this.color_choices.length > 0){
		data["filters"] = {
			"cab_color": this.color_choices
		}
	}

	var _parent = this;

	$.ajax(
		{
			url: api_url,
			data: JSON.stringify(data),
			type: "POST",
			contentType: 'application/json; charset=utf-8' 
		})
		.done(
				function(response) {          
          if(response.status == "success" && response.data.length > 0){
          	_parent.displayCabs(response.data);
          }
        })
		.fail(function(error) {
          return alert('Error in loading cabs!\n');
        });

};


window.onload = function() {
	window.fuberTaxiService = new FuberTaxiService();
};    
