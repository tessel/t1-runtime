console.log('1..2');

console.log(String.fromCharCode(0x1A) == '\u001A' ? 'ok' : 'not ok');
console.log(String.fromCharCode(0x1A) == '\x1A' ? 'ok' : 'not ok');

// console.log(String.fromCharCode(0x2603) == '☃');
// console.log(String.fromCharCode(0x2603) == '\u2603');
// console.log(String.fromCharCode(0x2603) != '\x26\x03');