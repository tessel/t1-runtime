var tap = require('../tap');

tap.count(6)

var a = [1,2,3];

Object.keys(a).forEach(function (key) {
	tap.eq(typeof key, 'string', 'Object.keys returns non-string');
})

for (var key in a) {
	tap.eq(typeof key, 'string', 'Object.keys returns non-string');
}
