var tap = require('../tap');

tap.count(2);

// Array.prototype.forEach applied to String
var a = [];
Array.prototype.forEach.call("foobar", function(ch) {
  a.push(ch);
});
tap.eq(a.join(''), 'foobar');

// Array.prototype.forEach applied to array
var a = [];
Array.prototype.forEach.call("foobar".split(''), function(ch) {
  a.push(ch);
});
tap.eq(a.join(''), 'foobar');
