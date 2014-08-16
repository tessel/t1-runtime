/* test rig */ var t = 1, tmax = 3;
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony');

var util = require('util');
var events = require('events');

function Test() {}

util.inherits(Test, events.EventEmitter);

var i = new Test();

try {
   i.once('event', undefined);
   ok(false);
} catch(e) {
   ok(true)
}

try {
   i.on('event', undefined);
   ok(false);
} catch(e) {
   ok(true);
}