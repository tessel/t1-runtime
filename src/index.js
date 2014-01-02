var fs = require('fs')
  , falafel = require('falafel')
  , colors = require('colors')
  , path = require('path')
  , spawn = require('child_process').spawn;

var colonize = require('./colonize');

/**
 * Bytecode
 */

var compile_lua = process.platform != 'win32'
  ? fs.existsSync(__dirname + '/../bin/build/Release')
    ? __dirname + '/../bin/build/Release/compile_lua'
    : __dirname + '/../bin/build/Debug/compile_lua'
  : __dirname + '/../bin/compile_lua_x64.exe';

function toBytecode (lua, f, next) {
  next = typeof f == 'function' ? f : next;
  f = typeof f == 'string' ? f : 'usercode.js';

  if (!fs.existsSync(compile_lua)) {
    console.error('WARNING: Bytecode compiler was not compiled for module "colony". Check that node-gyp is installed properly on your system and reinstall. Skipping for now...');
    setImmediate(next, lua, 0);
    return;
  }

  var bufs = [];
  var c = spawn(compile_lua, ['@' + f]);
  c.stdout.on('data', function (buf) {
    bufs.push(buf);
  });
  c.stdout.on('close', function (code) {
    var res = Buffer.concat(bufs);
    next(code, res);
  });
  c.stdin.write(lua);
  c.stdin.end();
}


/**
 * Module API
 */

exports.colonize = colonize;
exports.toBytecode = toBytecode;