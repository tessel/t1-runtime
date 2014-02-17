// Strings should not automatically be coerced to numbers in arithmetic
// but tonumber() should continue to coerce strings

console.log('1..2')

var elem = "2";
console.log(("0" + elem) == '02' ? 'ok' : 'nok', 1)
console.log('#', '0' + elem)

var n = Number("55");
console.log(n == 55 ? 'ok' : 'nok', 2);
console.log('#', n);