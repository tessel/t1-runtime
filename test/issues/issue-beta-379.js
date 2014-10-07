var tap = require('../tap');

tap.count(3);

tap.eq(Buffer([255]).readUInt32BE(0, true).toString(16), 'ff000000');
tap.ok(isNaN(Buffer(0).readUInt32BE(9999, true)), 'reading beyond buffer length (noAssert) is NaN');
tap.eq(Buffer(0).readUInt8(9999, true), undefined);
