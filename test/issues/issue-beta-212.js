/* test rig */ var t = 1, tmax = 2
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var n = 42;
ok(n.toString(10) == '42')
console.log("# base 10:", JSON.stringify(n.toString(10)));
ok(n.toString(16) == '2a')
console.log("# base 16:", JSON.stringify(n.toString(16)));
ok(n.toString(2) == '101010')
console.log("# base  2:", JSON.stringify(n.toString(2)));
ok(n.toString(24) == '1i')
console.log("# base 24:", JSON.stringify(n.toString(24)));

console.log()

// stress test invalid radixes
try { n.toString(1); console.log('not ok'); }
catch (e) { console.log('ok'); }
try { n.toString(0); console.log('not ok'); }
catch (e) { console.log('ok'); }
try { n.toString(37); console.log('not ok'); }
catch (e) { console.log('ok'); }
try { n.toString("1"); console.log('not ok'); }
catch (e) { console.log('ok'); }