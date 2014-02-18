#!/usr/bin/env node
var colony = require('./colony')
var fs = require('fs')

if (process.argv.length < 3) {
	process.exit(1);
}

var start = process.hrtime();
var res = colony.parse(fs.readFileSync(process.argv[2]))
var end = process.hrtime(start)[1]/1000000;
// console.error('--> took ' + end + 'ms');

var joiner = '\n', wrapmodule = true;

var source = [
  res.replace(/--\[\[COLONY_MODULE\]\][\s\S]*$/, ''),
  "return function (_ENV, _module)",
  // 'local ' + mask.join(', ') + ' = ' + mask.map(function () { return 'nil'; }).join(', ') + ';',
  "local exports, module = _module.exports, _module;",
  "",
  res.replace(/^[\s\S]*--\[\[COLONY_MODULE\]\]/, ''),
  "",
  "return _module.exports;",
  "end "
].join(joiner);

process.stdout.write(source);