console.log('1..2');

var str = 'DNS:*.github.com, DNS:github.com';

var arr = str.split(/, /g);
console.log(arr.length == 2 ? 'ok' : 'not ok');

var a = /a(b)|c/g;

'abc'.replace(a, function (all, sub) {
	if (all == 'c') {
		console.log(sub == null ? 'ok' : 'not ok')
	}
})
