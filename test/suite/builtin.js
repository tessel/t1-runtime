var tap = require('../tap');

var builtin = ['assert', 'buffer', 'child_process', 'crypto', 'dgram', 'events', 'fs', 'http',
'net', 'os', 'path', 'punycode', 'querystring', 'stream', 'string_decoder', 'tty',
'url', 'util', 'zlib']

tap.count(builtin.length);

for (var i = 0; i < builtin.length; i++) {
	tap.ok(require(builtin[i]), builtin[i])
}