var tap = require('../tap');

tap.count(4);

var root = __dirname.replace(/[^\/]+\/[^\/]+$/, '')

tap.ok(true, __dirname)
tap.ok(true, root)

tap.eq(require.resolve('../tap').substr(root.length), 'test/tap.js');
tap.eq(require.resolve('tape').substr(root.length), 'node_modules/tape/index.js');
tap.eq(require.resolve('./require').substr(root.length), 'test/suite/require.js');

try {
	require.resolve('./PHONY');
	tap.ok(false, 'require.resolve cant find fake module');
} catch (e) {
	tap.ok(true, 'require.resolve cant find fake module');
}
