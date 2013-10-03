/**
 * EventEmitter
 */

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
    this.on(type, function g () {
      f.call(this, arguments[0], arguments[1], arguments[2]); // TODO fix
      this.removeListener(type, g)
    });
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
      // fns[i].apply(this, args);
      fns[i].call(this, args[0], args[1], args[2]); // TODO fix
    }
    return fns.length;
  };

  EventEmitter.prototype.setMaxListeners = function (maxListeners) {
    this._maxListeners = maxListeners;
  };

  return EventEmitter;
})();


/**
 * Public API
 */

exports.EventEmitter = EventEmitter;