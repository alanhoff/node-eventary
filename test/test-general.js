var Eventary = require('../');
var assert = require('assert');

describe('System events testing', function() {

  it('should dispatch events', function(done) {
    var events = new Eventary();

    events.dispatch('test', {
      hello: 'world'
    }).then(function(data) {
      assert.equal('world', data.hello);
      done();
    });
  });

  it('#hook should return an object', function() {
    var events = new Eventary();

    var hook = events.hook('test', function(event) {
      event.data.hello = 'hello from hook';
    });

    assert.equal(typeof hook, 'object');
  });

  it('should apply hooks to dispatched events', function(done) {
    var events = new Eventary();

    events.hook('test', function(event) {
      event.data.hello += ' plugin';
    });

    events.dispatch('test', {
      hello: 'world'
    }).then(function(data) {
      assert.equal(data.hello, 'world plugin');
      done();
    });
  });

  it('should be able to cancel event chain and default', function(done) {
    var events = new Eventary();

    events.hook('test', function(event) {
      event.cancel();
    });

    events.hook('test', function() {
      throw new Error('The event wasn\'t canceled!');
    });

    events.dispatch('test', {}).then(function() {
      throw new Error('The event wasn\'t canceled!');
    }).catch(function(err) {
      throw err;
    });

    setTimeout(function() {
      done();
    }, 1500);
  });

  it('should be able to cancel propagation', function(done) {
    var events = new Eventary();

    events.hook('test', function(event) {
      event.data.hook1 = true;
    });

    events.hook('test', function(event) {
      event.data.hook2 = true;
      event.stopPropagation();
    });

    events.hook('test', function() {
      throw new Error('The event wasn\'t canceled!');
    });

    events.dispatch('test', {}).then(function(data) {
      assert.ok(data.hook1);
      assert.ok(data.hook2);
      done();
    }).catch(function(err) {
      throw err;
    });
  });

  it('should catch errors', function(done) {
    var events = new Eventary();

    events.hook('test', function() {
      throw new Error('Test error');
    });

    events.hook('test', function() {
      throw new Error('This hook can\'t run!');
    });

    events.dispatch('test', {}).then(function() {
      throw new Error('The error wasn\'t catched!');
    }).catch(function(err) {
      assert.ok(err.message, 'Test error');
      done();
    });
  });

  it('should be able to prevent defaults', function(done) {
    var events = new Eventary();

    events.hook('test', function(event) {
      event.data.hook1 = true;
      event.preventDefault();
    });

    events.hook('test', function(event) {
      event.data.hook2 = true;
    });

    events.hook('test', function(event) {
      assert.ok(event.data.hook1);
      assert.ok(event.data.hook2);
    });

    events.dispatch('test', {}).then(function() {
      throw new Error('The event wasn\'t prevented!');
    }).catch(function(err) {
      throw err;
    });

    setTimeout(function() {
      done();
    }, 1500);
  });

  it('should sort hooks execution by weight', function(done) {
    var events = new Eventary();

    events.hook('test', function(event) {
      event.data.push('hook 1');
    }, 3);

    events.hook('test', function(event) {
      event.data.push('hook 2');
    }, 2);

    events.hook('test', function(event) {
      event.data.push('hook 3');
    }, 1);

    events.dispatch('test', []).then(function(data) {
      assert.equal(data[0], 'hook 3');
      assert.equal(data[1], 'hook 2');
      assert.equal(data[2], 'hook 1');
      done();
    }).catch(function(err) {
      throw err;
    });
  });

  it('glob star should catch all events', function(done) {
    var events = new Eventary();
    var catched = [];

    events.hook('*', function(event) {
      catched.push(event.name);
    });

    events.dispatch('evt1');
    events.dispatch('evt2');
    events.dispatch('evt3');

    setTimeout(function() {
      assert.equal(catched.join(','), 'evt1,evt2,evt3');
      done();
    }, 500);
  });

  it('should have the #hooks property', function(done) {
    var events = new Eventary();

    events.hook('test', function(event) {
      event.data.push('hook 1');
    });

    events.hook('test', function(event) {
      event.data.push('hook 2');
    });

    events.hook('test', function(event) {
      assert.equal(event.hooks.length, 3);
    });

    events.dispatch('test', []).then(function() {
      done();
    }).catch(function(err) {
      throw err;
    });
  });

  it('should hook to wildcards events', function(done) {
    var events = new Eventary();

    events.hook('system.*', function(event) {
      event.data.name = event.name;
    });

    events.hook('system.nono', function() {
      throw new Error('This hook can\'t run!');
    });

    events.dispatch('system.test', {
      hello: 'world'
    }).then(function(data) {
      assert.equal(data.name, 'system.test');
      done();
    }).catch(function(err) {
      throw err;
    });
  });

  it('should unhook hooks', function(done) {
    var events = new Eventary();

    events.hook('system.*', function(event) {
      event.data.name = event.name;
    });

    var hook = events.hook('system.*', function() {
      throw new Error('This hook can\'t run!');
    });

    events.unhook(hook);

    events.dispatch('system.test', {
      hello: 'world'
    }).then(function(data) {
      assert.equal(data.name, 'system.test');
      done();
    }).catch(function(err) {
      throw err;
    });
  });

  it('should allow async hooks', function(done) {
    var events = new Eventary();

    events.hook('system.*', function(event, promise) {
      setTimeout(function() {
        promise.resolve();
      }, 500);

      event.data.name = event.name;
    });

    events.dispatch('system.test', {
      hello: 'world'
    }).then(function(data) {
      assert.equal(data.name, 'system.test');
      done();
    }).catch(function(err) {
      throw err;
    });
  });

});
