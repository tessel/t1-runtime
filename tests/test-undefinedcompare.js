function a (a, b, c, d, e) { }

var arity = a.length;
console.log('arity', arity);
if (arity < 4) {
  console.log('arity < 4');
} else {
  console.log('arity >= 4');
}