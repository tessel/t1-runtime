var fs = require('fs')
  , falafel = require('falafel')
  , colors = require('colors')
  , path = require('path')
  , spawn = require('child_process').spawn;

var colonize = require('./colonize');

/**
 * Bytecode
 */

var compile_lua = __dirname + '/../build/Release/compile_lua';

function toBytecode (lua, next) {
  var bufs = [];
  var c = spawn(compile_lua, ['//']);
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