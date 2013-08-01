#!/usr/bin/env node

var fs = require('fs')
  , falafel = require('falafel')
  , colors = require('colors')
  , path = require('path')
  , mdeps = require('module-deps')
  , JSONStream = require('JSONStream')
  , optimist = require('optimist');

var colony = require('./');

var args = optimist
  .usage('Compile JavaScript to Lua.\nUsage: $0 file1 [file2 file3...]')
  .alias('b', 'bundle').boolean('b').describe('b', 'Concatenate library and source files.')
  .alias('c', 'compile').boolean('c').describe('c', 'Compile code to lua and output.')
  .alias('l', 'library').boolean('l').describe('l', 'Output the colony library.')
  .alias('e', 'evalsource').describe('e', 'Evaluate a line of code.');

function cli () {
  var argv = args.argv;

  var flagconcat = argv.b || !argv.c;
  var evalsource = argv.e;

  // List out just the colony lib.
  if (argv.l) {
    fs.createReadStream(path.join(__dirname, '../lib/colony.lua')).pipe(process.stdout);

  } else {
    // Run file.
    if (!flagconcat) {
      args.demand(1).argv;

      try {
        var file = argv._[0];
        if (!fs.existsSync(file) && fs.existsSync(file + '.js')) {
          file = file + '.js';
        }
        var src = fs.readFileSync(file, 'utf-8');
        var luacode = colony.colonize(src);
      } catch (e) {
        console.error(String(e.stack).red);
        process.exit(100);
      }

      cli_run(luacode);

    // Evaluate string.
    } else if (evalsource) {

      colony.bundleDependencies([
        {"id": "/example.js","source":evalsource,"entry":true,"deps":{}}
      ], cli_run);

    // Bundle code.
    } else {
      args.demand(1).argv;

      // List of filenames or streams
      var srcs = argv._.map(function (name) {
        if (name == '-') {
          return process.stdin;
        }
        name = path.join(process.cwd(), name);
        if (!fs.existsSync(name)) {
          if (!fs.existsSync(name + '.js')) {
            throw new Error('File doesn\'t exist: ' + name);
          }
          name = name + '.js';
        }
        return name;
      });

      colony.bundleFiles(srcs, cli_run);
    }
  }
}

function cli_run (luacode) {
  if (args.argv.c) {
    console.log(luacode);
  } else {
    colony.runlua(luacode);
  }
}

if (require.main == module) {
  cli();
}