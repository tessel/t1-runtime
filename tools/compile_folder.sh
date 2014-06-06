#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var path = require('path');
var packageFolder = require('./package-folder');


// console.log(process.argv);

if (process.argv.length < 5) {
  console.error('Usage: ./compile_files.js outfile token_name section [files ... ]') 
  process.exit(1);
}

var outfile = process.argv[2];
var varname = process.argv[3];
var section = process.argv[4];
var infiles = process.argv.slice(5);


var colonyCompiler = require('colony-compiler');

// console.log('>>>', process.argv);

packageFolder(infiles, varname, section, function (file, buf, next) {
  buf = buf.toString('utf-8');
  if (file.match(/\.js$/)) {
    try {
      colonyCompiler.toBytecode(colonyCompiler.colonize(String(buf)), '[T]:' + file, next);
    } catch (e) {
      throw new Error('Bytecode compilation of ' + file + ' failed.');
    }
  } else if (file.match(/\.lua$/)) {
    try {
      colonyCompiler.toBytecode({ source: String(buf) }, '[T]: ' + file, next);
    } catch (e) {
      throw new Error('Bytecode compilation of ' + file + ' failed.');
    }
  } else {
    next(null, buf);
  }
}, function (err, out) {
  fs.writeFileSync(outfile, out);
  // console.log(out);
});