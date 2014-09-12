var tap = require('../tap');

tap.count(2);

var util = require('util');
var events = require('events');

function Test(name) {
  this.name = name;
}

util.inherits(Test, events.EventEmitter);

var t = new Test("t");

t.once('booted', bootSequence.bind(t));

var c = new Test("c");

c.once('booted', bootSequence.bind(c));

function bootSequence(data) {
  setImmediate(function() {
    tap.ok(data, this.name);
  }.bind(this));
}

t.emit('booted', true);

c.emit('booted', true);

console.log('# no more not oks');

t.emit('booted', false);

c.emit('booted', false);

t.emit('booted', false);