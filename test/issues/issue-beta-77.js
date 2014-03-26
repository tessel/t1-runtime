function TestObj() {}

var globalDict = {};

var t = new TestObj();

globalDict[t] = "hi";

console.log('1..1')
console.log(JSON.stringify(globalDict) == '{"[object Object]":"hi"}' ? 'ok' : 'not ok');