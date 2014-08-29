var tap = require('../tap');

tap.count(5);

var a = {};

Object.defineProperty(a, 'hello', {
	value: 'hi'
})

tap.eq(a.hello, 'hi');

try {
	Object.defineProperty(null, 'hello', {
		value: 'hi'
	})
	tap.ok(false);
} catch (e) {
	tap.ok(true);
}

try {
	Object.defineProperty('', 'hello', {
		value: 'hi'
	})
	tap.ok(false);
} catch (e) {
	tap.ok(e);
}

try {
	Object.defineProperty(0, 'hello', {
		value: 'hi'
	})
	tap.ok(false);
} catch (e) {
	tap.ok(e);
}

try {
	Object.defineProperty(true, 'hello', {
		value: 'hi'
	})
	tap.ok(false);
} catch (e) {
	tap.ok(e);
}
