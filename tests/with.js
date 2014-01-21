var internal = function () {
	return 'external';
}

var external = function () {
	return 'external';
}

var obj = {
	internal: function () {
		return 'internal';
	}
}

console.log('1..4');

var a = 5;
with (obj) {
	console.log(internal() == 'internal' ? 'ok 1' : 'not ok 1');
	console.log(external() == 'external' ? 'ok 2' : 'not ok 2');
	obj.external = function () {
		return 'internal';
	}
	console.log(external() == 'internal' ? 'ok 3' : 'not ok 3');
	a = 6;
}
console.log(a == 6 ? 'ok 4' : 'not ok 4');