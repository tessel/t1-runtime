#!/usr/bin/env node

// Passthrough
var path = require('path');
var cmd = path.join(path.dirname(require('bindings')('binding').path), 'colony');

var proc = require('child_process').spawn(cmd, process.argv.slice(2), {
	stdio: 'inherit'
});
proc.on('exit', function (err) {
	process.exit(err);
});