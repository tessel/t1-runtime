console.log('1..2');
var a = [];
console.log(a.length == 0 ? 'ok' : 'not ok');
a.sort(function(a, b) {return a.foo - b.foo});
console.log('#', a);
console.log(a.length == 0 ? 'ok' : 'not ok');
