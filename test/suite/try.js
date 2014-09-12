var tap = require('../tap');

tap.count(5);

var e = null;
try {
	throw "BOO";
} catch (e) { }
tap.ok(e == null, 'error should not escape scope of try #TODO')

try {
	try {
	    throw 'hi';
	} finally {
	    tap.ok(true);
	}
} catch (e) {
	tap.ok(true);
} finally {
	tap.ok(true);
}

var err;
try {
    throw Error("ERRR");
} catch (e) { err = e; }
tap.ok(err, 'error exists');