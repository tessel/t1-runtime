var tap = require('../tap');

tap.count(2);

try {
	throw Error("Test");
	tap.ok(false)
} catch (e) {
	tap.ok(true)
}

tap.ok(Error("Test").message)
