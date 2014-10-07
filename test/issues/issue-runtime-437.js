var tap = require('../tap');

tap.count(1)

var simple = '{"price":null}';
var parsed = JSON.parse(simple);
var a = parsed.price
tap.eq(a, null, 'JSON parsed null should be equal to undefined');
