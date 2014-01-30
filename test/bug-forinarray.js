console.log('1..1')

var arr = [];
arr.hello = 'hi';
arr.push(1, 2, 3, 4, 5);

var had0 = false;
for (var i in arr) {
	if (i == 1 && !had0) {
		throw new Error('1 came before 0');
	}
	if (i == 0) {
		had0 = true;
	}
	if (arr[i] == null) {
		console.error('not ok - array string index was null #TODO');
	} else if (typeof arr[i] != 'string') {
		console.error('not ok - for..in index was not string #TODO');
	}
	console.log(JSON.stringify(i))
}

console.log('ok')