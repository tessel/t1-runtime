console.log('1..2');
var i = 0;

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
    console.log(data, ++i, '-', this.name);
  }.bind(this));
}

t.emit('booted', 'ok');

c.emit('booted', 'ok');

console.log('# no more not oks');

t.emit('booted', 'not ok');

c.emit('booted', 'not ok');

t.emit('booted', 'not ok');