console.log('1..2')
var b = Buffer(20),
    s = b.fill(0xFF) || b.slice(5,15);
b.fill(0);
console.log(s.toString('hex') == '00000000000000000000' ? 'ok' : 'not ok');
s.fill(42);
console.log(b.toString('hex') == '00000000002a2a2a2a2a2a2a2a2a2a0000000000' ? 'ok' : 'not ok');
