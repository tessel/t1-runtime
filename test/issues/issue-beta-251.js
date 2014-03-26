console.log('1..1');

console.log('#', new Buffer([0x35]) + '67');
console.log(new Buffer([0x35]) + '67' == '\x3567' ? 'ok' : 'not ok')