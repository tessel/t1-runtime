var tap = require('../tap');

tap.count(2)

var obj = [ ];
function test (k) {
	tap.eq(typeof k, 'string', typeof k)
	var b = obj[k]
	tap.eq(typeof k, 'string', typeof k)
}
test('5')
