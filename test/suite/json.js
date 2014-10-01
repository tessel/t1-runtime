var tap = require('../tap');
var buf = require('buffer');

tap.count(82);

// little empty tester
function is_empty(obj) {
  for(var i in obj) { if(obj.hasOwnProperty(i)) { return false; } }
  return true;
}

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
  { 1:'hello\n',                                2:'"hello\\n"',                      3:'non object string',          4:null,            5:null },
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
  { 1:{"hi":5},                                 2:'{\n123456789A"hi": 5\n}',         3:'spacer string long',         4:null,            5:'123456789AB' },
  { 1:{"hi":5},                                 2:'{\n   "hi": 5\n}',                3:'spacer number',              4:null,            5:3 },
  { 1:foo4,                                     2:foo5,                              3:'super nested spacer',        4:null,            5:' ' },
  { 1:foo1,                                     2:'{"month":7,"transport":"car"}',   3:'replacer array',             4:censor_arr,      5:null },
  { 1:foo1,                                     2:'{"week":45,"month":7}',           3:'replacer function',          4:censor,          5:null },
  { 1:{a: function () {}, b: 5},                2:'{"b":5}',                         3:'function',                   4:null,            5:null },
  { 1:[1,function(){},2],                       2:'[1,null,2]',                      3:'function in array',          4:null,            5:null },
  { 1:new buf.Buffer([11,22,33,44]),            2:'[11,22,33,44]',                   3:'buffer',                     4:null,            5:null },
]

// parsing testing
console.log('Parsing tesing');
tap.ok(JSON.parse("{\"hi\": 5}").hasOwnProperty, 'json object is real object');
tap.ok(JSON.parse("[0, 1, 2]").slice, 'json array is real array');
for (var i in objs) {
  if(parseInt(i) > 19) {
    // note thse cases are not tested in parse
  } else {
    var parsed = JSON.parse(objs[i][2]);
    switch(parseInt(i)) {
      case 0:
        tap.ok(parsed==undefined,objs[i][3]);
        break;
      case 1:
        tap.ok(parsed==objs[i][1],objs[i][3]);
        break;
      case 2:
        tap.ok(parsed==objs[i][1],objs[i][3]);
        break;
      case 3:
        tap.ok(parsed==objs[i][1],objs[i][3]);
        break;
      case 4:
        tap.ok(parsed==objs[i][1],objs[i][3]);
        break;
      case 5:
        tap.ok(is_empty(parsed)==true,objs[i][3]);
        break;
      case 6:
        for (var j in parsed) { tap.ok(parsed[parseInt(j)]==parseInt(j),objs[i][3]+' at index '+j); }
				break;
      case 7:
      case 8:
        for (var j in parsed) { tap.ok(parsed[parseInt(j)]==objs[i][1][parseInt(j)],objs[i][3]+' at index '+j); }
        break;
      case 9:
        tap.ok(is_empty(parsed)==false,objs[i][3]);
        break;
      case 10:
        for (var j in parsed) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
        for (var j in parsed.b) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' key b at index '+j); }
				break;
      case 11:
      case 12:
        tap.ok(is_empty(parsed)==true,objs[i][3]);
        break;
      case 13:
      case 14:
        tap.ok(parsed.hi==5,objs[i][3]);
				break;
      case 15:
        tap.ok(is_empty(parsed.a)==true,objs[i][3]);
				break;
      case 16:
        for (var j in parsed) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
        for (var j in parsed.b) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' key b at key '+j); }
				break;
      case 17:
        tap.ok(parsed.a.b.c.d==1,objs[i][3]);
        break;
      case 18:
        for (var j in parsed) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
        for (var j in parsed.location) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
        for (var j in parsed.location.city) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
        for (var j in parsed.location.state) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
				break;
      case 19:
        for (var j in parsed) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
        for (var j in parsed.a) { tap.ok(parsed.j==objs[i][1].j,objs[i][3]+' at key '+j); }
				break;
      case 20:
        for (var j in parsed) {
          tap.ok(parsed[j].name==objs[i][1][j].name,objs[i][3]+' at key '+j+' name');
          tap.ok(parsed[j].type==objs[i][1][j].type,objs[i][3]+' at key '+j+' type');
        }
        break;
      default:
				break;
    }
  }
}

// stringify testing
console.log('Stringify tesing');
for (var i in objs) {
  tap.ok(JSON.stringify(objs[i][1],objs[i][4],objs[i][5]) == objs[i][2],objs[i][3]);
}
