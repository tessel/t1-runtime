console.log('1..3');
console.log(Buffer([255]).readUInt32BE(0, true).toString(16) == 'ff000000' ? 'ok' : 'not ok');
console.log(Buffer(0).readUInt32BE(9999, true) == 0 ? 'ok' : 'not ok');
console.log(Buffer(0).readUInt8(9999, true) == undefined ? 'ok' : 'not ok');
