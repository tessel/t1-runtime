var tap = require('../tap');

tap.count(9);

function test(cb) {
    cb(0, 1, 2);
    cb(null, 1, 2);
    cb(1, null, 2);
}

test(function (e,d,m) {
	tap.eq(arguments[0], e);
	tap.eq(arguments[1], d);
	tap.eq(arguments[2], m);
});
