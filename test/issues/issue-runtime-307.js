console.log('1..4')

var test = /^(?::(\d*))?/
var a = ('WRONG'.match(test))

console.log(a[0] == "" ? 'ok' : 'not ok');
console.log(a[1] == undefined ? 'ok' : 'not ok');

var test = /^(?::(\d*))?/
var a = (':5'.match(test))

console.log(a[0] == ":5" ? 'ok' : 'not ok');
console.log(a[1] == "5" ? 'ok' : 'not ok');
