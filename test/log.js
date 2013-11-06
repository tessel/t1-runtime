var a = {}
a.hello = 'A'
console.log('A:', a.hello)
Object.defineProperties(a, {
  'hello': {
    get: function () {
      return 'B';
    }
  }
});
a.__defineSetter__('hello', function (val) {
  console.log('called setter (C):', val);
});
console.log('B:', a.hello);
a.hello = 'C'
console.log('B:', a.hello);

console.log();

var b = {};
b.hello = 'A';
console.log('A:', b.hello);
b.__defineSetter__('hello', function (val) {
  console.log('called setter: (B)', val)
});
b.hello = 'B';
console.log('A:', b.hello);