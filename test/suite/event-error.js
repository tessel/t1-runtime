var tap = require('../tap');

tap.count(4);

var EventEmitter = require('events').EventEmitter;

var a = new EventEmitter

try {
	a.emit('error', 'some error')
} catch (e) {
	tap.ok(e instanceof TypeError);
}

try {
	a.emit('error', new RangeError('some error'))
} catch (e) {
	tap.ok(e instanceof RangeError);
}

a.once('error', function (err) {
	tap.ok(typeof err == 'string');
});

a.emit('error', 'some error')

a.once('error', function (err) {
	tap.ok(err instanceof SyntaxError);
});

a.emit('error', new SyntaxError('some error'))
