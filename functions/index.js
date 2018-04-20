// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');
var _ = require('underscore');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp();

let GeoFire = require('geofire');


const dbRef=admin.database().ref();
const cabRef=admin.database().ref('cabs');
const cabLocationsRef=admin.database().ref('cabLocations');


exports.findCabs = 
	functions.https.onRequest((request, response) => {
	
		response.setHeader("Access-Control-Allow-Origin", "*");
		
		var status_code;
		var result = {};


		if (request.method === "POST"){

			var request_data = request.body;

			var user_location = [];
			var cab_color = [];
			var available_cabs = []

			var filters = {};

			if (request_data.hasOwnProperty('user_location')){
				user_location = request_data['user_location'];
			}

			if (request_data.hasOwnProperty('radius')){
				radius = request_data['radius'];
			}
			else{
				radius = 10;
			}		

			if (request_data.hasOwnProperty('filters')){
				filters = request_data['filters'];
			}	


			// Get all cabs within a radius of 10kms from sent user location
			var geoFire = new GeoFire(cabLocationsRef);	

			var geoQuery = geoFire.query({
			  center:  user_location,
			  radius: radius //km
			});  


			var nearestCabs = {};

			geoQuery.on("key_entered", function(key, location, distance){
				nearestCabs[key] = distance
			});

			geoQuery.on("ready", function() {
				geoQuery.cancel();

				// Query RTDB for cabs status assigned false
				var queryAllUnassignedCabs = cabRef
				.orderByChild('assigned')
				.equalTo(false);
				

				queryAllUnassignedCabs.on('value', snap=> {
					
					console.log (nearestCabs);
					
					snap.forEach(function (cab) {
		 				var cabId = cab.key;
		 				
		 				if(nearestCabs.hasOwnProperty(cabId)){
		 					
		 					var keyToUpdate = '/'+cabId+'/distanceFromAssignee' ;
		 					var updated_obj = {};
		 					updated_obj[keyToUpdate] = nearestCabs[cabId];
		 					
		 					cabRef.update(updated_obj);

							available_cabs.push({
	      						_key: cab.key,
	      						...cab.val()
	    					});

		 				}

		 			});

		 			filtered_cabs = getFilteredCabs(available_cabs,filters);


					status_code = 200;
					
					result = {
						"status": "success",
						"message": "",
						"data": filtered_cabs
					};

					response.status(status_code).send(result);
				})				

				  
			});
			
		}
		else{
			status_code = 400;
			
			result = {	"status": "error", 
						"message": 'Method not supported' 
					};

			response.status(status_code).send(result);
		} 

 	
	});

exports.assignCab = 
	functions.https.onRequest((request, response) => {
	
		response.setHeader("Access-Control-Allow-Origin", "*");	

		var status_code;
		var result = {};

		if (request.method === "POST"){
			var request_data = request.body;

				// Query RTDB for cabs status assigned false
				var queryCab = cabRef
				.orderByKey()
				.equalTo(request_data['cabId'])
				.limitToFirst(1);
				

				queryCab.on('value', snap=> {
 					
 					var keyToUpdate = '/'+request_data['cabId']+'/assigned' ;
 					var updated_obj = {};
 					updated_obj[keyToUpdate] = true;
 					
 					cabRef.update(updated_obj);	

 					//@todo make entry in trips node - start time, end time, start location, end location				
					
					status_code = 200;
			
					result = {	"status": "success", 
								"message": '',
								"data": snap.val()
							 };

					response.status(status_code).send(result);			 
		 			
		 		});

		
		}
		else{
			status_code = 400;
			
			result = {	"status": "error", 
						"message": 'Method not supported' 
					};

			response.status(status_code).send(result);
		} 

 	
	});	

function getFilteredCabs(available_cabs,filters){

	var filtered_cabs = [];

	filtered_cabs = _.filter(available_cabs, function(cab) {
 
     	if( filters.hasOwnProperty('cab_color') && _.contains(filters['cab_color'], cab.color ) ){
     		return cab;
     	}
     	
	});

	return filtered_cabs;
}





