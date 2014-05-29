var test = {};

console.log('1..1');

test['A'] = 0;
Object.defineProperty(test, 'a', {
    get: function () { return 0 } 
});

test['B'] = 1;
console.log('# test', test);
console.log(Object.keys(test).indexOf('B') > -1 ? 'ok' : 'not ok');
console.log('B' in test ? 'ok' : 'not ok')
console.log(test.a == 0 ? 'ok' : 'not ok')
