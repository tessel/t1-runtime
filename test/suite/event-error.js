/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }

tap(4);

var EventEmitter = require('events').EventEmitter;

var a = new EventEmitter

try {
	a.emit('error', 'some error')
} catch (e) {
	ok(e instanceof TypeError);
}

try {
	a.emit('error', new RangeError('some error'))
} catch (e) {
	ok(e instanceof RangeError);
}

a.once('error', function (err) {
	ok(typeof err == 'string');
});

a.emit('error', 'some error')

a.once('error', function (err) {
	ok(err instanceof SyntaxError);
});

a.emit('error', new SyntaxError('some error'))
