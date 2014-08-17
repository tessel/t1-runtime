var tap = require('../tap');

tap.count(3);

var dict = {};
dict['1'] = 1;
dict['01'] = 2;
dict['0x10'] = 3;
dict['a'] = 4;
// console.log(dict, Object.keys(dict), dict['1'], dict['0x10'], dict['16']);

tap.ok(dict['1'] == 1)
tap.ok(Object.keys(dict).map(String).indexOf('01') > 0)
tap.ok(Object.keys(dict).map(String).indexOf('0x10') > 0)
