var tap = require('../tap')

tap.count(4)

var querystring = require('querystring');
var util = require('util');

console.log('#', isFinite(5))
tap.eq(isFinite(5), true);
console.log('#', querystring.stringify({room_id: 5}))
tap.eq(querystring.stringify({room_id: 5}), 'room_id=5');
tap.eq(isFinite("0"), true);
tap.eq(isFinite("hi"), false);
