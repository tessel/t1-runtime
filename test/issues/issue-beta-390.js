var tap = require('../tap');

tap.count(3);

var test = {};

test['A'] = 0;
Object.defineProperty(test, 'a', {
    get: function () { return 0 } 
});

test['B'] = 1;
console.log('# test', test);
tap.ok(Object.keys(test).indexOf('B') > -1);
tap.ok('B' in test);
tap.eq(test.a, 0);
