// test rig
function ok (a) { return a ? 'ok -' : 'not ok -'; }
var t = 1;
console.log('1..7')

function eq (a, b) {
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

var a = [1];
a.splice(0, 1);
console.log(ok(eq(a, [])), t++);

var a = [1, 2, 3];
a.splice(1, 1);
console.log(ok(eq(a, [1, 3])), t++);

var a = [2, 3];
a.unshift(1);
console.log(ok(eq(a, [1, 2, 3])), t++);

var a = [];
a.unshift(1);
console.log(ok(eq(a, [1])), t++);

console.log(ok([0, 0, 0, 0, 0, 0].length == 6), t++);
console.log(ok(eq([0, 1, 2, 3, 4, 5].slice(0, 5), [0, 1, 2, 3, 4])), t++);
console.log(ok(eq([0, 0, 0, 0, 0, 0].slice(0, 5), [0, 0, 0, 0, 0])), t++);