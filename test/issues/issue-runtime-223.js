/* test rig */ 
var tap = require('../tap');
var util = require('util');
var events = require('events');

function Test() {}

util.inherits(Test, events.EventEmitter);

var i = new Test();

tap.count(3);

tap.ok(process.versions.colony, 'running in colony');

try {
   i.once('event', undefined);
   tap.ok(false, 'once');
} catch(e) {
   tap.ok(true, 'once');
}

try {
   i.on('event', undefined);
   tap.ok(false, 'on');
} catch(e) {
   tap.ok(true, 'on');
}