var tap = require('../tap');

tap.count(26);

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

// parse testing
var obj = JSON.parse("{\"hi\": 5}");
tap.ok(obj.hi == 5, 'json parse object');

var obj = JSON.parse("[0, 1, 2]");
tap.ok(arreq(obj, [0,1,2]), 'json parse array');

tap.ok(JSON.parse("{\"hi\": 5}").hasOwnProperty, 'json object is real object');
tap.ok(JSON.parse("[0, 1, 2]").slice, 'json array is real array');

// stringify testing
var foo = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
var censor_arr = ['transport','month'];
function censor(key, value) {
	tap.ok(this[key] == value, '"this" value correct in replacer');
  if (typeof(value) == "string") {
    return undefined;
  }
  return value;
}

//    1:object to testing 			2:expected string result			3:message				4:replacer		5:spacer
var objs = [
	{ 1:null,						2:'null',							3:'non object undef',	4:null,			5:null },
	{ 1:true,						2:'true',							3:'non object bool',	4:null,			5:null },
	{ 1:3,							2:'3',								3:'non object number',	4:null,			5:null },
	{ 1:[0, 1, 2], 					2:'[0,1,2]',						3:'stringify array',	4:null,			5:null },
	{ 1:{a: function () {}, b: 5}, 	2:'{"b":5}', 						3:'stringify function',	4:null,			5:null },
	{ 1:[1,function(){},2],			2:'[1,null,2]',						3:'function in array',	4:null,			5:null },
	{ 1:{"hi": 5},					2:'{"hi":5}', 						3:'stringify object',	4:null,			5:null },
	{ 1:Object(), 					2:'{}',								3:'empty object',		4:null,			5:null },
	{ 1:[],							2:'[]',								3:'empty array',		4:null,			5:null },
	{ 1:{hi : 5},					2:'{\n  "hi": 5\n}',				3:'spacer string',		4:null,			5:'  ' },
	{ 1:{hi : 5},					2:'{\n123456789A"hi": 5\n}',		3:'spacer string long',	4:null,			5:'123456789AB' },
	{ 1:{hi : 5},					2:'{\n   "hi": 5\n}',				3:'spacer number',		4:null,			5:3 },
	{ 1:foo,						2:'{"month":7,"transport":"car"}',	3:'replacer array',		4:censor_arr,	5:null },
	{ 1:foo,						2:'{"week":45,"month":7}',			3:'replacer function',	4:censor,		5:null },

]
for (var i in objs) {
	tap.ok(JSON.stringify(objs[i][1],objs[i][4],objs[i][5]) == objs[i][2],objs[i][3]);
}

// toJSON testing
//    1:object to testing 					2:expected string result				3:message
var objs = [
	{ 1:{},									2:'{}',									3:'toJSON on empty object'},
	{ 1:{fn: "John", ln: "Doe", age: 50},	2:'{"fn":"John","age":50,"ln":"Doe"}',	3:'toJSON on object'},
]
for (var i in objs) {
	tap.ok(objs[i][1].toJSON() == objs[i][2],objs[i][3]);
}

var objs = [censor]
for (var i in objs) {
	try { objs[i].toJSON(); }
	catch (e) { tap.ok(0==0,'toJSON called on array failed correctly'); break; }
	tap.ok(0==1,'toJSON called on array should have failed')
}
