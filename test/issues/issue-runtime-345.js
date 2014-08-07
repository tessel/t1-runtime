console.log('1..2')

// Array.prototype.forEach applied to String
var a = [];
Array.prototype.forEach.call("foobar", function(ch) {
  a.push(ch);
});
console.log(a.join('') == 'foobar' ? 'ok' : 'not ok');

// Array.prototype.forEach applied to array
var a = [];
Array.prototype.forEach.call("foobar".split(''), function(ch) {
  a.push(ch);
});
console.log(a.join('') == 'foobar' ? 'ok' : 'not ok');
