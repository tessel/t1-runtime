var tap = require('../tap')

tap.count(3)

tap.eq(String([1]), '1', 'stringed-array doesn\'t leave trailing comma');

tap.eq("12345678".match(/\d/g).length, [1,2,3,4,5,6,7,8].length, 'match split length');
tap.eq(String("12345678".match(/\d/g)), '1,2,3,4,5,6,7,8', 'match split entries');
