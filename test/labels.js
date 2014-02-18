console.log('1..4');

var i = 0;
while (i < 5) {
	i = i + 1;
	continue;
	console.log('nok');
}
console.log('ok');

var i = 0, out = [];
apples: while (i < 5) {
	console.log("# Level " + i)
	i++
	var j = 0
	pears: while (j < 5) {
		console.log("# J: " + j)
		out.push(i + '/' + j);
		if (i == 3) continue apples;
		j++
	}
}

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

console.log(arreq(out, [ '1/0', '1/1', '1/2', '1/3', '1/4', '2/0', '2/1', '2/2', '2/3', '2/4', '3/0', '4/0', '4/1', '4/2', '4/3', '4/4', '5/0', '5/1', '5/2', '5/3', '5/4' ]) ? 'ok' : 'nok', 1);

console.log('# Just say hi once then break:')
var i = 0, j = 0;
a_1: while (i < 5) {
	b_1: while (j < 5) {
		if (i == 1) continue a_1;
		break;
	}
	console.log('# hi');
	break;
}
console.log('ok');

var out = [];
for (var i = 0; i < 5; i++) {
	if (i % 2) continue;
	console.log('# even i: ' + i)
	out.push(i);
}
console.log(arreq(out, [0, 2, 4]) ? 'ok' : 'nok');

var i = 0
candy: while (i < 7) {
	i++
	try {
		if (i == 3) continue candy;
		console.log("# i="+i)
		if (i == 5) throw new Error("ok # Some error when i == 5")
	} catch (e) {
		console.log(e.message)
	}
	console.log("# Incrementing...")
}
