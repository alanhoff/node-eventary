var Eventary = require('../');
var events = new Eventary();
var http = require('http');

// We will listen the main page
events.hook('/', function(event) {

  // We don't need that this event continue to the
  // 404 page
  event.preventDefault();

  // Let's answer this incomming request
  event.data.res.end('Welcome to the main page!');

});

// Listen to '/user/whatever'
events.hook('/user/*', function(event) {

  event.preventDefault();

  // Let's answer this incomming request
  event.data.res.end('We should ask our database for this ' + event.name);
});

// Listen to '/error'
events.hook('/error', function() {
  throw new Error('Something bad happened!');
});

// Listen for EVERY routes
events.hook('**', function(event) {
  // Just log it to the stdout
  console.log('HIT - ' + event.name);
});

// Start the server
http.Server(function(req, res) {
  events.dispatch(req.url, {req: req, res: res})
    .then(function() {

      // No one prevented us, sadly this is a 404
      res.statusCode = 404;
      res.end('404 - I don\'t know what you want :-(');

    }).catch(function(err) {

      // We can catch errors!
      res.statusCode = 500;
      res.end('500 - OMG!');
      console.log(err.stack);
    });
}).listen(8080);
