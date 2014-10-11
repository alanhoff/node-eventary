var EventTemplate = require('./event-template');
var minimatch = require('minimatch');
var Bluebird = require('bluebird');

var Eventary = function() {
  this._events = {};
};

Eventary.prototype.dispatch = function(name, data) {
  var promise = Bluebird.pending();
  var hooks = [];
  var events = this._events;

  Object.keys(events).forEach(function(evName) {
    if (minimatch(name, evName))
      hooks = hooks.concat(events[evName]);
  });

  hooks.sort(function(a, b) {
    return a.weight - b.weight;
  });

  var ev = new EventTemplate(name, data, hooks);

  if (ev.hooks.length)
    Bluebird.all(ev.hooks).each(function(hook) {
      return hook.hook(ev);
    }).then(function() {
      if (!ev._canceled && !ev._prevented)
        promise.resolve(ev.data);
    }).catch(function(err) {
      if (err !== 'canceled' && err !== 'stopped')
        promise.reject(err);

      if (err === 'stopped')
        promise.resolve(ev.data);
    });
  else
    promise.resolve(ev.data);

  return promise.promise;
};

Eventary.prototype.hook = function(name, handler, weight) {
  var events = this._events;

  if (!events[name])
    events[name] = [];

  var EventHandler = function() {
    this.name = name;
    this.weight = typeof weight === 'number' ? weight : 0;
    this.hook = function(ev) {
      var promise = Bluebird.pending();

      if (handler.length > 1)
        handler(ev, promise);
      else
        Bluebird.resolve().then(handler(ev)).then(function() {
          promise.resolve();
        });

      return promise.promise.then(function() {
        var promise = Bluebird.pending();

        if (ev._canceled)
          promise.reject('canceled');

        if (ev._stopped)
          promise.reject('stopped');

        promise.resolve();

        return promise.promise;
      });
    };
  };

  var ev = new EventHandler();
  events[name].push(ev);
  return ev;
};

Eventary.prototype.unhook = function(handler) {
  var events = this._events;

  if (events[handler.name] && events[handler.name].indexOf(handler) > -1)
    events[handler.name].splice(events[handler.name].indexOf(handler), 1);
};

module.exports = Eventary;
