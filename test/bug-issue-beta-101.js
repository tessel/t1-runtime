var arr =  [ 0, 13, 2, 1, 21, 0, 0, 0, 0, 0, 6, 104, 105, 32, 106, 111, 110 ];
var val = new Buffer(arr).slice(7);
console.log('1..2')
console.log(val.length == 10 ? 'ok' : 'nok');
console.log('#', val);
console.log(new Buffer('hello').toString() == 'hello' ? 'ok' : 'nok')
console.log('#', new Buffer('hello').toString())