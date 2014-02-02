/* test rig */ var t = 1, tmax = 5
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var arr = [];
arr.hello = 'hi';
arr.push(1, 2, 3, 4, 5);

ok(arr[0] == 1, 'first index was null');

var had0 = false;
for (var i in arr) {
	if (i == 1 && !had0) {
		throw new Error('1 came before 0');
	}
	if (i == 0) {
		had0 = true;
	}
	if (arr[i] == null) {
		ok(false, 'array string index was null #TODO');
	} else if (typeof arr[i] != 'string') {
		ok(false, 'for..in index was not string #TODO');
	}
	// console.log(JSON.stringify(i))
}

// console.log('ok')