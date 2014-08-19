var tap = require('../tap');

tap.count(1);

function TestObj() {}

var globalDict = {};

var t = new TestObj();

globalDict[t] = "hi";

tap.eq(JSON.stringify(globalDict), '{"[object Object]":"hi"}');