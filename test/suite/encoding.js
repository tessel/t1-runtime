/* test rig */ var t = 1, tmax = 10
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
console.log(t + '..' + tmax);
ok(process.versions.colony, 'running in colony')

ok(String.fromCharCode(0x1A) == '\u001A')
ok(String.fromCharCode(0x1A) == '\x1A');

console.log('#', String.fromCharCode(0x2603), 'is', String.fromCharCode(0x2603).length, 'bytes');
ok(String.fromCharCode(0x2603) == '☃');
ok(String.fromCharCode(0x2603) == '\u2603');
ok(String.fromCharCode(0x2603) != '\x26\x03');

var poo = '💩';
console.log('#', poo, 'is', poo.length, 'bytes');
ok(0xd83d == poo[0]);
ok(0xdca9 == poo[1]);
ok(0xd83d == poo.charCodeAt(0), poo.charCodeAt(0));
ok(0xdca9 == poo.charCodeAt(1), poo.charCodeAt(1));
ok(poo == '\ud83d\udca9');
ok(poo != '\xd8\x3d\xdc\xa9');