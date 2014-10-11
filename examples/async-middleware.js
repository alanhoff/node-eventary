// This middleware will scan this folder and remove all
// extensions from the files
var Eventary = require('../');
var fs = require('fs');
var events = new Eventary();

// This is the function that will scan our directory, note
// the second argument, this is required if you want to peform
// async operations inside the middleware
var read = function(event, promise) {

  // Scan the directory
  fs.readdir(event.data, function(err, files){

    // If errors, stop the middleware chain
    if(err)
      return promise.reject(err);

    event.data = files;

    // This middleware has ended, we need to
    // call this to tell Eventary to move on
    promise.resolve();
  });
};


// This is the sync function that will remove the
// file extension from it's name
var remove = function(event){
  event.data = event.data.map(function(file){
    var pieces = file.split('.');

      if(pieces.length > 1)
        pieces.pop();

    return pieces.join('.');
  });
};

// Now we need to hook the two created functions
// to the readdir event
events.hook('readdir', read);
events.hook('readdir', remove);


// Dispatch the event with the directory that we want to scan
events.dispatch('readdir', __dirname).then(function(data) {

  // Log the result that we got
  console.log(data);

}).catch(function(err){

  // If some error occurs, this block will
  // be called and the event chain will for this
  // specific dispatch
  console.log(err.stack);
});
