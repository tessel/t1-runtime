/* TAP rig */
function tap (max) { tap.t = 1; console.log(tap.t + '..' + max); };
function ok (a, d) { console.log((a ? '' : 'not ') + 'ok', tap.t++, '-', d); }
function eq (a, b, c) { ok(a == b, String(c) + ': ' + JSON.stringify(String(a)) + ' == ' + JSON.stringify(String(b))); }

tap(11);

ok((new Buffer([-1]))[0] == 0xff, 'wrap: -1 == 0xff');
ok((new Buffer([0x555 % 0xFF]))[0] == 0x5a, 'wrap: 0x555 % 0xFF == 0x5a');

ok((new Buffer([256]))[0] == 0x00, 'wrap: 256 == 0');
ok((new Buffer([-256]))[0] == 0x00, 'wrap: -256 == 0');
ok((new Buffer([0x555]))[0] == 0x55, 'wrap: 0x555 == 0x55');
ok((new Buffer([300]))[0] == 0x2c, 'wrap: 300 == 0x2c');
ok((new Buffer([-300]))[0] == 0xd4, 'wrap: -300 == 0xd4');
ok((new Buffer([-0x555]))[0] == 0xab, 'wrap: -0x555 == 0xab');

var a = 0x555, b = 0xFF
ok((-a) % b == -90, 'modulus check: -0x555 % 0xFF == -90');
ok((new Buffer([(-0x555) % 0xff]))[0] == 0xa6, 'wrap: -0x555 % 0xff == 0xa6');

var b = new Buffer(1);
b.writeInt8(-1, 0);
ok(b[0] == 0xff, 'writing -1 yields 0');