var EventEmitter = (function () {

  function EventEmitter () { }

  EventEmitter.prototype.listeners = function (type) {
    return this.hasOwnProperty.call(this._events || (this._events = {}), type) ? this._events[type] : this._events[type] = [];
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener = function (type, f) {
    if (this._maxListeners !== 0 && this.listeners(type).push(f) > (this._maxListeners || 10)) {
      console && console.warn('Possible EventEmitter memory leak detected. ' + this._events[type].length + ' listeners added. Use emitter.setMaxListeners() to increase limit.');
    }
    this.emit("newListener", type, f);
    return this;
  };

  EventEmitter.prototype.once = function (type, f) {
    this.on(type, function g () { f.apply(this, arguments); this.removeListener(type, g) });
  };

  EventEmitter.prototype.removeListener = function (type, f) {
    var i;
    (i = this.listeners(type).indexOf(f)) != -1 && this.listeners(type).splice(i, 1);
    return this;
  };

  EventEmitter.prototype.removeAllListeners = function (type) {
    for (var k in this._events) {
      (!type || type == k) && this._events[k].splice(0, this._events[k].length);
    }
    return this;
  };

  EventEmitter.prototype.emit = function (type) {
    var args = Array.prototype.slice.call(arguments, 1);
    for (var i = 0, fns = this.listeners(type).slice(); i < fns.length; i++) {
      fns[i].apply(this, args);
    }
    return fns.length;
  };

  EventEmitter.prototype.setMaxListeners = function (maxListeners) {
    this._maxListeners = maxListeners;
  };

  return EventEmitter;
})();



var stream = new EventEmitter();

stream.on('data', function (data) {
  console.log(data);
});

// Should print "Cool, this works."
stream.emit('data', 'Cool, this works.');

function TestClass () {
  this.str = "Extending works too!!!"
}

TestClass.prototype = new EventEmitter();

TestClass.prototype.hello = function () {
  this.emit('data', this.str);
}

var t = new TestClass();
t.on('data', function (data) {
  console.log(data);
})
t.hello();