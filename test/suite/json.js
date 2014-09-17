var tap = require('../tap');

tap.count(16);

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
tap.ok(obj.hi == 5, 'json parse object')

var obj = JSON.parse("[0, 1, 2]");
console.log('#', JSON.parse("[0, 1, 2]"), JSON.parse("[0, 1, 2]").length)
tap.ok(arreq(obj, [0,1,2]), 'json parse array');

tap.ok(JSON.parse("{\"hi\": 5}").hasOwnProperty, 'json object is real object');
tap.ok(JSON.parse("[0, 1, 2]").slice, 'json array is real array');

console.log('#', JSON.stringify([0, 1, 2]))
tap.ok(JSON.stringify([0, 1, 2]) == '[0,1,2]', 'stringify array');
tap.ok(JSON.stringify({a: function () {}, b: 5}) == '{"b":5}', 'stringify fn #TODO functions should not be output');
tap.ok(JSON.stringify({"hi": 5}) == "{\"hi\":5}", 'stringify obj');

tap.ok(JSON.stringify(Object()) == '{}', 'empty obj')
tap.ok(JSON.stringify([]) == '[]', 'empty array')

tap.ok(JSON.stringify({hi : 5}, null, '  ') == '{\n  "hi": 5\n}\n', 'indentation formatting string');
tap.ok(JSON.stringify({hi : 5}, null, '123456789AB') == '{\n123456789A"hi": 5\n}\n', 'indentation formatting long string');
tap.ok(JSON.stringify({hi : 5}, null, 3) == '{\n   "hi": 5\n}\n', 'indentation formatting number');

var censor_arr = ['transport','month']
var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
var jsonString = JSON.stringify(foo, censor_arr);
tap.ok(jsonString == '{"month":7,"transport":"car"}', 'json replacer array works')
console.log('#', jsonString);

function censor(key, value) {
	tap.ok(this[key] == value, '"this" value correct in replacer');
  if (typeof(value) == "string") {
    return undefined;
  }
  return value;
}
var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
var jsonString = JSON.stringify(foo, censor);
tap.ok(jsonString == '{"week":45,"month":7}', 'json replacer function works');
console.log('#', jsonString);

var objs = [
	{1:[1,2,3],2:'[1,2,3]',3:'toJSON on array'},
	{1:{},2:'{}',3:'toJSON on empty object'},
	{1:{firstName: "John", lastName: "Doe", age: 50},2:'{"firstName":"John","lastName":"Doe","age":50}',3:'toJSON on object'},
	{1:censor,2:'{}',3:'toJSON on a function'},
]
for (var i in objs) {
	tap.ok(objs[i][1].toJSON() == objs[i][2],objs[i][3]);
}
