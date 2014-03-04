/* test rig */ var t = 1, tmax = 8
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

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

var obj = JSON.parse("{\"hi\": 5}");
ok(obj.hi == 5, 'json parse object')

var obj = JSON.parse("[0, 1, 2]");
ok(arreq(obj, [0,1,2]), 'json parse array');

ok(JSON.parse("{\"hi\": 5}").hasOwnProperty, 'json object is real object');
ok(JSON.parse("[0, 1, 2]").slice, 'json array is real array');

ok(JSON.stringify([0, 1, 2]) == '[0,1,2]', 'stringify array');
ok(JSON.stringify({a: function () {}, b: 5}) == '{"b":5}', 'stringify fn #TODO functions should not be output');
ok(JSON.stringify({"hi": 5}) == "{\"hi\":5}", 'stringify obj');

ok(JSON.stringify(Object()) == '{}', 'empty obj')
ok(JSON.stringify([]) == '[]', 'empty array #TODO')

ok(JSON.stringify({hi : 5}, null, '  ') == '{\n  "hi": 5\n}\n', 'indentation formatting');

// function censor(key, value) {
// 	console.log('CENSORING', key, value);
//   if (typeof(value) == "string") {
//     return undefined;
//   }
//   return value;
// }
// var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
// var jsonString = JSON.stringify(foo, censor);
// console.log(jsonString);