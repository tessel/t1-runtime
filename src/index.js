var fs = require('fs')
  , falafel = require('falafel')
  , colors = require('colors')
  , path = require('path')
  , mdeps = require('module-deps')
  , JSONStream = require('JSONStream');

var colonize = require('./colonize');

/**
 * Output
 */

function runlua (luacode) {
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

// function lua2c (luacode) {
//   var temp = require('temp');
//   temp.open('myprefix', function(err, info) {
//     fs.write(info.fd, luacode);
//     fs.close(info.fd, function (err) {
//       var lua = require('child_process').spawn('lua', ['lua2c.lua', info.path], {
//         cwd: '/Users/tim/Code/tcr/lua2c52'
//       });
//       process.stdin.pipe(lua.stdin);
//       lua.stdout.pipe(process.stdout);
//       lua.stderr.pipe(process.stderr);
//       lua.stdout.on('close', function () {
//         process.exit(0);
//       })
//     });
//   });
// }

function luastringifytable (obj) {
  return '{ ' + Object.keys(obj).map(function (key) {
    return '[' + JSON.stringify(key) + '] = ' + JSON.stringify(obj[key])
  }).join(', ') + ' }';
}

function bundleDependencies (deps, next) {
  var out = [];
  out.push('local colony = require(\'colony\');');
  //out.push('local colony = (function ()\n' + fs.readFileSync(path.join(__dirname, '../lib/colony.lua')) + '\nend)()\n');
  out.push('local deps = {')
  deps.forEach(function (dep) {
    out.push('[' + JSON.stringify(dep.id) + '] = {\n\tfunc = ' + colonize(dep.source));
    out.push(',\ndeps = ' + luastringifytable(dep.deps) + '\n},');
  });
  out.push('}')
  out.push('');
  out.push('collectgarbage();'); // for good measure
  out.push('colony.global.process.env = colony.global._obj({ DEPLOY_IP = ' + JSON.stringify(require('my-local-ip')()) + ' });');
  out.push('return colony.enter(deps, ' + JSON.stringify(deps.filter(function (dep) {
    return dep.entry;
  })[0].id) + ')');

  next(out.join('\n'));
}

function bundleFiles (srcs, inject, next) {
  if (!next) {
    next = inject;
    inject = {};
  }

  var stringify = JSONStream.stringify();
  var buf = [];
  stringify.on('data', function (data) {
    buf.push(data);
  });
  stringify.on('close', function () {
    var deps = JSON.parse(buf.join(''));
    bundleDependencies(deps, next);
  });

  mdeps(srcs, {
    resolve: function (id, info, cb) {
      if (id in inject) {
        require('browser-resolve')('./', inject[id] + '/index.js', cb);
      } else {
        require('browser-resolve').apply(null, arguments);
      }
    }
  }).pipe(stringify);
}


/**
 * Module API
 */

exports.colonize = colonize;
exports.bundleFiles = bundleFiles;
exports.bundleDependencies = bundleDependencies;
exports.runlua = runlua;