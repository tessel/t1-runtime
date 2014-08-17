var tap = require('../tap');

tap.count(5);

var table = [];
table["0"] = true;
tap.ok(table["0"] == true)
tap.ok(table[0] == true)

var table = {};
table[0] = true;
tap.ok(table["0"] == true)
tap.ok(table[0] == true)

var table = {};
table[5] = true;
tap.ok(table["5"] == true)

var table = {};
table[function hi() { }] = true
table[5] = true;
table["hi"] = true;
console.log(table);
