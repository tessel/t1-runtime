var tap = require('../tap');

tap.count(13);

var arr = [];
arr.hello = 'hi';
arr.push(1, 2, 3, 4, 5);

tap.ok(arr[0] == 1, 'first index was null');

var had0 = false;
for (var i in arr) {
	if (i == 1 && !had0) {
		throw new Error('1 came before 0');
	}
	if (i == 0) {
		had0 = true;
	}
	
	tap.ok(typeof i == 'string', 'for..in index is string');
	tap.ok(arr[i] != null, 'array string index is not null');
}

// console.log('ok')