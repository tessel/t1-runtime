var tap = require('../tap');
var buf = require('buffer');

tap.count(68);

// testing vars
var foo1 = {foundation: "Mozilla", model: "box", week: 45, transport: "car", month: 7};
var foo2 = { "a": 2, "b": [false, true, "a"] };
var foo3 = { "a": 3, "b": { "1": false, "x": 54 } };
var foo4 = { "a": { "b": { "c": { "d": 1 } } } };
var foo5 = '{\n "a": {\n  "b": {\n   "c": {\n    "d": 1\n   }\n  }\n }\n}'
var foo6 = { "location": { "city": { "name": "Chattanooga", "population": 167674 }, "state": { "abbreviation": "TN", "name": "Tennessee", "population": 6403000 } }, "name": "Jim Cowart", "company": "appendTo" };
var foo7 = '{"location":{"city":{"name":"Chattanooga","population":167674},"state":{"abbreviation":"TN","name":"Tennessee","population":6403000}},"name":"Jim Cowart","company":"appendTo"}';
var foo8 = { "a": [ { "b": [ { "c": [ [1,2,3], [], [4,5,6] ] }, { "d": { "e": { "f": [7,8,9], "g": [ [9,8,7], [] ] } } } ] }, "g", [ [ [ { "h": [ [ [ [ [6,5,4] ] ] ] ] } ] ] ], { "i": [ { "j": [ { "k": [ [3,2,1] ] } ] } ] } ] };
var foo9 = '{"a":[{"b":[{"c":[[1,2,3],[],[4,5,6]]},{"d":{"e":{"g":[[9,8,7],[]],"f":[7,8,9]}}}]},"g",[[[{"h":[[[[[6,5,4]]]]]}]]],{"i":[{"j":[{"k":[[3,2,1]]}]}]}]}';
var fooA = { "1800": { "name": "Generic Access", "type": "org.bluetooth.service.generic_access" }, "1801": { "name": "Generic Attribute", "type": "org.bluetooth.service.generic_attribute" }, "1802": { "name": "Immediate Alert", "type": "org.bluetooth.service.immediate_alert" } };
var fooB = '{"1800":{"name":"Generic Access","type":"org.bluetooth.service.generic_access"},"1801":{"name":"Generic Attribute","type":"org.bluetooth.service.generic_attribute"},"1802":{"name":"Immediate Alert","type":"org.bluetooth.service.immediate_alert"}}';

// testing replacer array and functions
var censor_arr = ['transport','month'];
function censor(key, value) {
  tap.ok(this[key] == value, '"this" value correct in replacer');
  if (typeof(value) == "string") {
    return undefined;
  }
  return value;
}

//  1:objects                                   2:string                             3:message                       4:replacer         5:spacer
var objs = [
  { 1:null,                                     2:'null',                            3:'non object null',            4:null,            5:null },
  { 1:true,                                     2:'true',                            3:'non object bool',            4:null,            5:null },
  { 1:3,                                        2:'3',                               3:'non object number',          4:null,            5:null },
  { 1:7.42,                                     2:'7.42',                            3:'non object double',          4:null,            5:null },
  { 1:[],                                       2:'[]',                              3:'empty array',                4:null,            5:null },
  { 1:[0, 1, 2],                                2:'[0,1,2]',                         3:'array',                      4:null,            5:null },
  { 1:[3,"a"],                                  2:'[3,"a"]',                         3:'mixed array',                4:null,            5:null },
  { 1:[3,false,3.454,"a","a"],                  2:'[3,false,3.454,"a","a"]',         3:'repeat value array',         4:null,            5:null },
  { 1:[[[],[],[]],[[],[[1,2]]]],                2:'[[[],[],[]],[[],[[1,2]]]]',       3:'super nested arrays',        4:null,            5:null },
  { 1:foo2,                                     2:'{"a":2,"b":[false,true,"a"]}',    3:'sringify lvl 1 array',       4:null,            5:null },
  { 1:{},                                       2:'{}',                              3:'empty object',               4:null,            5:null },
  { 1:Object(),                                 2:'{}',                              3:'empty object constructor',   4:null,            5:null },
  { 1:{"hi":5},                                 2:'{"hi":5}',                        3:'object explicit key',        4:null,            5:null },
  { 1:{hi:5},                                   2:'{"hi":5}',                        3:'object implicit key',        4:null,            5:null },
  { 1:{"a":{}},                                 2:'{"a":{}}',                        3:'lvl 1 empty object',         4:null,            5:null },
  { 1:foo3,                                     2:'{"a":3,"b":{"1":false,"x":54}}',  3:'lvl 1 object',               4:null,            5:null },
  { 1:foo4,                                     2:'{"a":{"b":{"c":{"d":1}}}}',       3:'super nested objects',       4:null,            5:null },
  { 1:foo6,                                     2:foo7,                              3:'realistic object',           4:null,            5:null },
  { 1:foo8,                                     2:foo9,                              3:'array object mess',          4:null,            5:null },
  { 1:fooA,                                     2:fooB,                              3:'input file test',            4:null,            5:null },
  { 1:{"hi":5},                                 2:'{\n  "hi": 5\n}',                 3:'spacer string',              4:null,            5:'  ' },
  { 1:{"hi":5},                                 2:'{\n   "hi": 5\n}',                3:'spacer number',              4:null,            5:3 },
  { 1:foo4,                                     2:foo5,                              3:'super nested spacer',        4:null,            5:' ' },
  { 1:foo1,                                     2:'{"month":7,"transport":"car"}',   3:'replacer array',             4:censor_arr,      5:null },
  { 1:{a: function () {}, b: 5},                2:'{"b":5}',                         3:'function',                   4:null,            5:null },
  { 1:[1,function(){},2],                       2:'[1,null,2]',                      3:'function in array',          4:null,            5:null },
  { 1:new buf.Buffer([11,22,33,44]),            2:'[11,22,33,44]',                   3:'buffer',                     4:null,            5:null },
  { 1:NaN,                                      2:'null',                            3:'NaN',                        4:null,            5:null },
  { 1:Infinity,                                 2:'null',                            3:'Infinity',                   4:null,            5:null },
  { 1:-Infinity,                                2:'null',                            3:'-Infinity',                  4:null,            5:null },
  { 1:[[],"11"],                                2:'[[],"11"]',                       3:'arr in arr then value',      4:null,            5:null },
  { 1:'hello\n',                                2:'"hello\\n"',                      3:'non object string',          4:null,            5:null },
]

var objs2 = [
  { 1:{"hi":5},                                 2:'{\n123456789A"hi": 5\n}',         3:'spacer string long',         4:null,            5:'123456789AB' },
  { 1:foo1,                                     2:'{"month":45,"week":7}',           3:'replacer function',          4:censor,          5:null },
]

// Simple parsing testing
console.log('# parsing tesing');
tap.ok(JSON.parse("{\"hi\": 5}").hasOwnProperty, 'json object is real object');
tap.ok(JSON.parse("[0, 1, 2]").slice, 'json array is real array');

// string->parse->stringify should equal original string
for (var i in objs) {
  var obj = JSON.parse(objs[i][2])
  var res = JSON.stringify(obj, objs[i][4], objs[i][5]);
  tap.eq(res, objs[i][2], objs[i][3]);

  tap.eq(JSON.stringify(objs[i][1], objs[i][4], objs[i][5]), objs[i][2], objs[i][3]);
}

// stringified object should equal corresponding string
for (var i in objs2) {
  var res = JSON.stringify(objs[i][1], objs[i][4], objs[i][5]);
  tap.eq(res, objs[i][2], objs[i][3]);
}

var d = new Date(42);
tap.eq(JSON.stringify({
  toJSON: function () { return "foo"; }
}), "\"foo\"", 'toJSON called on dates');

var a = { toJSON: function () { return "hello"; }}
tap.eq(JSON.stringify(a), '"hello"', 'toJSON called on objects')

var a = { toJSON: function () { return { toJSON: function () { return 5; }}; }}
tap.eq(JSON.stringify(a), '{}', 'toJSON isnt recursive')
