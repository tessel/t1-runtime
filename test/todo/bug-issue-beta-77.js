function TestObj() {}

var globalDict = {};

var t = new TestObj();

globalDict[t] = "hi";

console.log(globalDict);