var tap = require('../tap');

tap.count(2);

var a = ['c', 'd', 'a', 'e', 'b']
console.log('#', a);

var b = a.slice()
console.log('#', b.sort());
tap.eq(JSON.stringify(b), JSON.stringify(['a', 'b', 'c', 'd', 'e']))

b.sort().push('hi');
tap.eq(b.pop(), 'hi');
