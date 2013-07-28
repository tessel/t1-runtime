#!/usr/bin/env node

var fs = require('fs')
  , falafel = require('falafel')
  , colors = require('colors')
  , path = require('path');

var colonize = require('./colonize');

/**
 * Arguments
 */

var argv = require('optimist')
  .usage('Compile JavaScript to Lua.\nUsage: $0 file1 [file2 file3...]')
  .alias('b', 'bundle').boolean('b').describe('b', 'Concatenate library and source files.')
  .alias('c', 'compile').boolean('c').describe('c', 'Compile code to lua and output.')
  .alias('l', 'library').boolean('l').describe('l', 'Output the colony library.')
  .alias('e', 'evalsource').describe('e', 'Evaluate a line of code.')
  .argv;

var flagconcat = argv.b || !argv.c;
var evalsource = argv.e;

/**
 * Output
 */

function runluacode (luacode) {
  luacode = 'package.path = ' + JSON.stringify(path.join(__dirname, '../lib') + '/?.lua;') + ' .. package.path; \n' + luacode;
  var lua = require('child_process').spawn(path.join(__dirname, '../bin/lua-5.2.2/src/lua'), ['-e', luacode]);
  process.stdin.pipe(lua.stdin);
  lua.stdout.on('data', function (str) {
    process.stdout.write(String(str));
  });
  lua.stderr.on('data', function (str) {
    process.stderr.write(String(str).yellow);
  });
  lua.on('close', function (code) {
    process.exit(code);
  });
}

function lua2c (luacode) {
  var temp = require('temp');
  temp.open('myprefix', function(err, info) {
    fs.write(info.fd, luacode);
    fs.close(info.fd, function (err) {
      var lua = require('child_process').spawn('lua', ['lua2c.lua', info.path], {
        cwd: '/Users/tim/Code/tcr/lua2c52'
      });
      process.stdin.pipe(lua.stdin);
      lua.stdout.pipe(process.stdout);
      lua.stderr.pipe(process.stderr);
      lua.stdout.on('close', function () {
        process.exit(0);
      })
    });
  });
}

function luastringifytable (obj) {
  return '{ ' + Object.keys(obj).map(function (key) {
    return '[' + JSON.stringify(key) + '] = ' + JSON.stringify(obj[key])
  }).join(', ') + ' }';
}

function compile (srcs) {
  // Run
  if (!flagconcat) {
    try {
      var file = srcs[0];
      if (!fs.existsSync(file) && fs.existsSync(file + '.js')) {
        file = file + '.js';
      }
      var src = fs.readFileSync(file, 'utf-8');
      var luacode = colonize(src);
    } catch (e) {
      console.error(String(e.stack).red);
      process.exit(100);
    }

    if (argv.c) {
      console.log(luacode);
    } else {
      runluacode(luacode);
    }

  // Evaluate
  } else if (evalsource) {

    ondeps([
      {"id": "/example.js","source":evalsource,"entry":true,"deps":{}}
    ]);

  // Bundle code
  } else {
    var mdeps = require('module-deps');
    var JSONStream = require('JSONStream');

    var stringify = JSONStream.stringify();
    var buf = [];
    stringify.on('data', function (data) {
      buf.push(data);
    });
    stringify.on('close', function () {
      var deps = JSON.parse(buf.join(''));
      ondeps(deps);
    });

    mdeps(srcs).pipe(stringify);
  }

  function ondeps (deps) {
    var out = [];
    out.push('local colony = require(\'colony\');');
    //out.push('local colony = (function ()\n' + fs.readFileSync(path.join(__dirname, '../lib/colony.lua')) + '\nend)()\n');
    out.push('local deps = {')
    deps.forEach(function (dep) {
      out.push('[' + JSON.stringify(dep.id) + '] = {\n\tfunc = ' + colonize(dep.source));
      out.push(',\ndeps = ' + luastringifytable(dep.deps) + '\n},');
    })
    out.push('}')
    out.push('');
    out.push('collectgarbage();'); // for good measure
    out.push('colony.global.process.env = colony.global._obj({ DEPLOY_IP = ' + JSON.stringify(require('my-local-ip')()) + ' });');
    out.push('return colony.enter(deps, ' + JSON.stringify(deps.filter(function (dep) {
      return dep.entry;
    })[0].id) + ')');

    var luacode = out.join('\n');

    if (argv.c) {
      console.log(luacode);
    } else {
      runluacode(luacode);
    }
  }
}

if (argv.l) {
  fs.createReadStream(path.join(__dirname, '../lib/colony.lua')).pipe(process.stdout);
} else {
  compile(argv._.map(function (name) {
    return name == '-' ? process.stdin : path.join(process.cwd(), name);
  }));
}