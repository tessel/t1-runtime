var tap = require('../tap')

tap.count(2)

var arr = [1,2,3,4,5];
arr.length = 3;

tap.eq(JSON.stringify(arr), '[1,2,3]', 'array is stringified to trimmed array');
tap.eq(Object.keys(arr).join(','), '0,1,2', 'array keys are trimmed');
