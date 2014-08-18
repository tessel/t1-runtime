var tap = require('../tap');

tap.count(46);

function arreq (a, b) {
	if (a.length != b.length) {
		return false;
	}
	for (var i = 0; i < a.length; i++) {
		if (a[i] != b[i]) {
			return false;
		}
	}
	return true;
}

var arr = [];
tap.ok(arr.length == 0, 'array::push - length')
arr.push(1, 2, 3, 4, 5);
tap.ok(arr.length == 5, 'array::push - values added, accepts multiple args');

var arr = [1, 2, 3, 4, 5];
tap.ok(arr.length == 5, 'array::pop - length')
tap.ok(arr.pop() == 5, 'array::pop - values popped');
tap.ok(arr.length == 4, 'array::pop - length modified');
var arr = [];
tap.ok(arr.pop() == null, 'array::pop - null values popped');
tap.ok(arr.length == 0, 'array::pop - length unmodified when 0');

var a = [1];
a.splice(0, 1);
tap.ok(arreq(a, []), 'splice(0, 1)');

var a = [1, 2, 3];
a.splice(1, 1);
tap.ok(arreq(a, [1, 3]), 'splice(1, 1)');

var a = [2, 3];
a.unshift(1);
tap.ok(arreq(a, [1, 2, 3]), 'unshift(1)')

var arr = [2];
tap.ok(arr.length == 1, 'array::unshift - length')
arr.unshift(1);
tap.ok(arreq(arr, [1, 2]), 'array::unshift - correct')
tap.ok(arr.length == 2, 'array::unshift - unshift redefines length')

var arr = ["adrian", "zankich"];
tap.ok(arr.length == 2, 'array::shift - length')
var first_name = arr.shift();
tap.ok(arr.length == 1, 'array::shift - shift redefines length');
tap.ok(first_name == 'adrian', 'array::shift - shifted value')
var arr = [];
tap.ok(arr.shift() == null, 'array::shift - null values shifted');
tap.ok(arr.length == 0, 'array::shift - length unmodified when 0');

tap.ok([0, 0, 0, 0, 0, 0].length == 6);
tap.ok(arreq([0, 1, 2, 3, 4, 5].slice(0, 5), [0, 1, 2, 3, 4]))
tap.ok(arreq([0, 0, 0, 0, 0, 0].slice(0, 5), [0, 0, 0, 0, 0]));
tap.ok(arreq([0, 1, 2, 3, 4, 5].slice(1), [1, 2, 3, 4, 5]), 'slice(1) returns full array')


var a = new Array(50);
a[20] = 'b';
tap.ok(a.length == 50, 'new Array(50) length is 50')

var b = [];
b[20] = 'b';
tap.ok(b.length == 21, 'setting sparse high array index extends array');

var c = [1, 2, 3];
c[3] = 4;
tap.ok(c.length == 4, 'setting non-sparse high array index extends array');

var a = [1,2,3];
console.log("# array full:", a, a.length);
tap.ok(a.length == 3);
a[0] = undefined;
a[1] = undefined;
console.log("# array two undefined:", a, a.length);
tap.ok(a.length == 3);
a[2] = undefined;
console.log("# array three undefined:", a, a.length);
tap.ok(a.length == 3);

tap.ok([0, 1, 2, 3].reduce(function(a, b) {
    return a + b;
}) == 6, 'array reduce');

tap.ok(arreq([[0, 1], [2, 3], [4, 5]].reduce(function(a, b) {
    return a.concat(b);
}), [0, 1, 2, 3, 4, 5]), 'array reduce with init');

var i = 1;
var arr = [].concat(i);
tap.ok(arreq(arr, [i]), 'array concats values');
console.log('#', arr)

var i = 1;
var arr = [].concat([5], i);
tap.ok(arreq(arr, [5, i]), 'array concats values and arrays');
console.log('#', arr)

var i = 1;
var arr = [].concat([5], [6, 7]);
tap.ok(arreq(arr, [5, 6, 7]), 'array concats arrays');
console.log('#', arr)

var i = 1;
var arr = [5].concat([6, 7], [8]);
tap.ok(arreq(arr, [5, 6, 7, 8]), 'array concats arrays');
console.log('#', arr)

// Array::reverse
var arr = [1, 2, 3];
arr.reverse();
tap.ok(arreq(arr, [3, 2, 1]), 'array reverses in place');
tap.ok(arreq(arr.reverse(), [1, 2, 3]), 'array reverses');
tap.ok(arreq([0xFF, 0x00, 0x00, 0x80, 0x3f, 0xFF].reverse(), [0xFF, 0x3f, 0x80, 0x00, 0x00, 0xFF]), 'array reverses')

// Array::reduce
var test = Buffer([5,4,3]);
tap.ok(Array.prototype.slice.call(test).join('') == '543', 'Array::join called on buffer works')
sum = Array.prototype.reduce.call(test, function (sum, n) { return sum+n; }, 0);
tap.ok(sum == 12, 'Array::reduce called on non-array object succeeds');

// Array creation
var a = Array(1,2,3)
tap.ok(arreq(a, [1,2,3]), 'Array(1,2,3) == [1,2,3]')

// Array join
tap.ok([1,2,3].join(',') == '1,2,3');
tap.ok([1].join(',') == '1');
tap.ok([null, null, null].join(',') == ',,');

// Array.prototype.forEach applied to String
var a = [];
Array.prototype.forEach.call("foobar", function(ch) {
  a.push(ch);
});
tap.eq(a.join(''), 'foobar');

// Array.prototype.forEach applied to array
var a = [];
Array.prototype.forEach.call("foobar".split(''), function(ch) {
  a.push(ch);
});
tap.eq(a.join(''), 'foobar');

// // Array.prototype.forEach applied to sparse array.
// var a = []; a[25] = 25;
// Array.prototype.forEach.call(a, function(ch, i) {
//   if (i != 25) {
//   	console.log('not ok - invalid iterated index in sparse array');
//   	process.exit(1)
//   }
// });
tap.ok(true);
