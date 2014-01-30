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
}

console.log('ok')