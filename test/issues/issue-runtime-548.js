var tap = require('../tap');

tap.count(1);

var events = require('events');
var e = new events.EventEmitter();

function f() {
  tap.ok(false, 'removeListener did not remove once listener.');
}

tap.ok(true, 'first.');
e.once('evt', f)
e.removeListener('evt', f)
e.emit('evt')
