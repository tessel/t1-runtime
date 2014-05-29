console.log('1..2');

var a = ['c', 'd', 'a', 'e', 'b']
console.log('#', a);

var b = a.slice()
console.log('#', b.sort());
console.log(JSON.stringify(b) == JSON.stringify(['a', 'b', 'c', 'd', 'e']) ? 'ok' : 'not ok');

b.sort().push('hi');
console.log(b.pop() == 'hi' ? 'ok' : 'not ok')
