/* test rig */ var t = 1, tmax = 1
function ok (a, d) { console.log(a ? 'ok ' + (t++) + ' -' : 'not ok ' + (t++) + ' -', d); }
// console.log(t + '..' + tmax);

var builtin = ['assert', 'buffer', 'child_process', 'crypto', 'dgram', 'events', 'fs', 'http',
'net', 'os', 'path', 'punycode', 'querystring', 'stream', 'string_decoder', 'tty',
'url', 'util', 'zlib']

console.log('1..' + (builtin.length+1))
ok(process.versions.colony, 'running in colony')

for (var i = 0; i < builtin.length; i++) {
	ok(require(builtin[i]), builtin[i])
}