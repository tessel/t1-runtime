var tap = require('../tap')

tap.count(15)

var arr = [1, 2, 3, 1, 2, 3];

console.log('#', arr.indexOf(2));
tap.eq(arr.indexOf(2), 1);

console.log('#', arr.indexOf(2, 0));
tap.eq(arr.indexOf(2, 0), 1);

console.log('#', arr.indexOf(2, 1));
tap.eq(arr.indexOf(2, 1), 1);

console.log('#', arr.indexOf(2, 2));
tap.eq(arr.indexOf(2, 2), 4);

console.log('#', arr.indexOf(2, 4));
tap.eq(arr.indexOf(2, 4), 4);

console.log('#', arr.indexOf(2, 5));
tap.eq(arr.indexOf(2, 5), -1);

console.log('#', arr.indexOf(3, 5));
tap.eq(arr.indexOf(3, 5), 5);

console.log('#', arr.indexOf(3, 6));
tap.eq(arr.indexOf(3, 6), -1);

console.log('#', arr.indexOf(2, 10));
tap.eq(arr.indexOf(2, 10), -1);

console.log('#', arr.indexOf(2, -1));
tap.eq(arr.indexOf(2, -1), -1);

console.log('#', arr.indexOf(2, -2));
tap.eq(arr.indexOf(2, -2), 4);

console.log('#', arr.indexOf(2, -2));
tap.eq(arr.indexOf(2, -2), 4);

console.log('#', arr.indexOf(2, -4));
tap.eq(arr.indexOf(2, -4), 4);

console.log('#', arr.indexOf(2, -5));
tap.eq(arr.indexOf(2, -5), 1);

console.log('#', arr.indexOf(2, -10));
tap.eq(arr.indexOf(2, -10), 1);

