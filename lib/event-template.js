var EventTemplate = function(name, data, hooks) {
  this._canceled = false;
  this._prevented = false;
  this._stopped = false;

  this.name = name;
  this.data = data;
  this.hooks = hooks;
};

EventTemplate.prototype.cancel = function() {
  this._canceled = true;
};

EventTemplate.prototype.preventDefault = function() {
  this._prevented = true;
};

EventTemplate.prototype.stopPropagation = function() {
  this._stopped = true;
};

module.exports = EventTemplate;
