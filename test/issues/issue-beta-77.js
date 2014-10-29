var tap = require('../tap');

tap.count(3);

function TestObj() {}

var globalDict = {};

var t = new TestObj();

globalDict[t] = "hi";

tap.eq(JSON.stringify(globalDict), '{"[object Object]":"hi"}');

var dict = {};
dict[/a/] = 'hi';
tap.eq(dict[/a/], 'hi');
tap.eq(JSON.stringify(dict), '{"/a/":"hi"}');
