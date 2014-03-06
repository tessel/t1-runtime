/* test rig */ var t = 1, tmax = 6
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var table = [];
table["0"] = true;
ok(table["0"] == true)
ok(table[0] == true)

var table = {};
table[0] = true;
ok(table["0"] == true)
ok(table[0] == true)

var table = {};
table[5] = true;
ok(table["5"] == true)

var table = {};
table[function () { }] = true
table[5] = true;
table["hi"] = true;
console.log(table);