var fs = require('fs')
  , falafel = require('falafel')
  , colors = require('colors')
  , path = require('path')
  , mdeps = require('module-deps')
  , JSONStream = require('JSONStream')
  , luamin = require('luamin');

var colonize = require('./colonize');

/**
 * Output
 */

function runlua (luacode) {
  luacode = 'package.path = ' + JSON.stringify(path.join(__dirname, '../lib') + '/?.lua;') + ' .. package.path; ' + luacode;
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

function bundleDependencies (deps, opts, next) {
  if (!next) {
    next = opts;
    opts = {};
  }

  var out = [];
  if (opts.bundleLib) {
    out.push('local colony = (function ()\n' + fs.readFileSync(path.join(__dirname, '../lib/colony.lua')) + '\nend)()\n');
  } else {
    out.push('local colony = require(\'colony\');');
  }
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
  var code = out.join('\n');

  next(opts.minify ? luamin.minify(code) : code);
}

function bundleFiles (srcs, opts, next) {
  if (!next) {
    next = opts;
    opts = {};
  }
  var inject = opts.inject || {};

  var stringify = JSONStream.stringify();
  var buf = [];
  stringify.on('data', function (data) {
    buf.push(data);
  });
  stringify.on('close', function () {
    var deps = JSON.parse(buf.join(''));
    bundleDependencies(deps, opts, next);
  });

  mdeps(srcs, {
    filter: function (id) {
      return !(id in inject) || inject[id] != null;
    },
    resolve: function (id, info, cb) {
      if (id in inject) {
        if (inject[id] == null) {
          cb(null, null, null);
        } else {
          require('browser-resolve')(inject[id] + '/index.js', __filename, cb);
        }
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