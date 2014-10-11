// This is a simple middleware that change the case of a string to uppercase
var Eventary = require('../');
var events = new Eventary();

// We need to create the function that will
// change the case od the username
var changeCase = function(event) {
  // First we need to grab the username
  var username = event.data.username;

  // Now change it inside the event
  event.data.username = username.toUpperCase();
};

// Now we need to hook this function to the
// event 'registration'
events.hook('registration', changeCase);


// Everything is in place, now we need to
// send and event and see what happens
var user = {
  username: 'myUserName',
  email: 'user@roflcopter.com'
};

// Send this user through the chain of middlewares
events.dispatch('registration', user).then(function(data) {
  // Time to save this user inside the database, or
  // just log it to the stdout
  console.log(data);
});
