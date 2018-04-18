'use strict';

// Initializes FuberTaxiService
function FuberTaxiService() {
  this.checkSetup();

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
};


window.onload = function() {
  window.fuberTaxiService = new FuberTaxiService();
};    
