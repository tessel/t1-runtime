var tap = require('../tap');

tap.count(3);

var arr = [];
tap.eq(arr.length, 0, 'array [] len 0')
arr.hello = 'hi';
tap.eq(arr.length, 0, 'array keys constant')

arr.push(1, 2, 3, 4, 5);
tap.eq(arr[0], 1, 'array key set');