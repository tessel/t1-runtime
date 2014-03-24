console.log('1..2');

console.log(String.fromCharCode(0x1A) == '\u001A' ? 'ok' : 'not ok');
console.log(String.fromCharCode(0x1A) == '\x1A' ? 'ok' : 'not ok');

console.log('#', String.fromCharCode(0x2603), 'is', String.fromCharCode(0x2603).length, 'bytes');
console.log(String.fromCharCode(0x2603) == '☃');
console.log(String.fromCharCode(0x2603) == '\u2603');
console.log(String.fromCharCode(0x2603) != '\x26\x03');

var poo = '💩';
console.log('#', poo, 'is', poo.length, 'bytes');
console.log(0xd83d == poo[0]);
console.log(0xdca9 == poo[1]);
console.log(poo == '\ud83d\udca9');
console.log(poo != '\xd8\x3d\xdc\xa9');