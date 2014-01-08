#!/usr/bin/env node
var acorn = require('./acolony')
var fs = require('fs')

if (process.argv.length < 3) {
	process.exit(1);
}

var start = process.hrtime();
var res = acorn.parse(fs.readFileSync(process.argv[2]))
var end = process.hrtime(start)[1]/1000000;
console.error('--> took ' + end + 's');

var keywords = ['end', 'do', 'nil', 'error', 'until', 'repeat', 'local', 'in'];
var mask = ['string', 'math', 'print', 'type', 'pairs'];

var joiner = '\n', wrapmodule = true;

var source = [
  "return function (_ENV, _module)",
  'local ' + mask.join(', ') + ' = ' + mask.map(function () { return 'nil'; }).join(', ') + ';',
  "local exports, module = _module.exports, _module;",
  "",
  res,
  "",
  "return _module.exports;",
  "end "
].join(joiner);

process.stdout.write(source);