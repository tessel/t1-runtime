var buf = new Buffer('test');

console.log('1..2');
console.log('#', JSON.stringify(String.fromCharCode.apply(null, buf)));
console.log(String.fromCharCode.apply(null, buf) == 'test' ? 'ok' : 'not ok')
console.log('#', JSON.stringify(String.fromCharCode.apply(null, [])));
console.log(String.fromCharCode.apply(null, []) == '' ? 'ok' : 'not ok')
