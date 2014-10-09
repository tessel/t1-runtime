var tap = require('../tap');

tap.count(3);

tap.eq(Buffer([255]).readUInt32BE(0, true).toString(16), 'ff000000');
var res = Buffer(0).readUInt32BE(9999, true);
tap.ok(isNaN(res) || (res == 0), 'reading beyond buffer length (noAssert) is 0 (older) or NaN (newer) depending on node version');
tap.eq(Buffer(0).readUInt8(9999, true), undefined);
