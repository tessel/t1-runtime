#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var path = require('path');
var packageFolder = require('./package-folder');


// console.log(process.argv);

if (process.argv.length < 4) {
  console.error('Usage: ./compile_folder.sh outfile token_name no_compile [files ... ]') 
  console.error('Compiles code into built-in binary.')
  process.exit(1);
}

var outfile = process.argv[2];
var varname = process.argv[3];
var docompile = !parseInt(process.argv[4]);
var infiles = process.argv.slice(5);


var colonyCompiler = require('colony-compiler');

// console.log('>>>', process.argv);

packageFolder(infiles, varname, function (file, buf, next) {
  buf = buf.toString('utf-8');
  if (file.match(/\.js$/)) {
    try {
      if (docompile) {
        colonyCompiler.toBytecode(colonyCompiler.colonize(String(buf)), '[T]:' + file, next);
      } else {
        next(null, colonyCompiler.colonize(String(buf)).source);
      }
    } catch (e) {
      throw new Error('Bytecode compilation of ' + file + ' failed.');
    }
  } else if (file.match(/\.lua$/)) {
    try {
      if (docompile) {
        colonyCompiler.toBytecode({ source: String(buf) }, '[T]: ' + file, next);
      } else {
        next(null, buf);
      }
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