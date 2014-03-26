console.log('1..1');
var b = new Date()
var a = +b
console.log(a == b.valueOf() ? 'ok' : 'not ok', 1);
console.log('#', a)
console.log('#', b.valueOf())