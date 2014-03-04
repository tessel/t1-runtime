/* test rig */ var t = 1, tmax = 5
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

var n = 0xF0F0F0F0E1;
ok(String(n) == '1034834473185');
ok(n.toString(10) == '1034834473185');
console.log("# base 10:", n.toString(10), '==', '1034834473185');
ok(n.toString(16) == 'f0f0f0f0e1');
console.log("# base 16:", n.toString(16), '==', 'f0f0f0f0e1');

var n = 1034834473185;
ok(String(n) == '1034834473185');
ok(n.toString(10) == '1034834473185');
console.log('# base 10:', n.toString(10), '==', '1034834473185');
ok(n.toString(16) == 'f0f0f0f0e1');
console.log('# base 16:', n.toString(16), '==', 'f0f0f0f0e1');

ok((0xFFFFFFFF * 2) > 0xFFFFFFFF, "supports > 0xFFFFFFFF")