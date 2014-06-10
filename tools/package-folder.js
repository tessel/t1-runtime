var fs = require('fs');
var async = require('async');
var path = require('path');

function packageFolder (files, varname, filter, next)
{
  if (!next) {
    next = filter;
    filter = function (file, buf, next) {
      next(null, buf);
    }
  }

  var dirname = varname;

  var _out = [];
  function write (arg) {
    _out.push(arg);
    // console.log(arg);
  }

  write('#include <stddef.h>\n');
  write('typedef struct dir_reg { const char *path; const unsigned char *src; unsigned int len; } dir_reg_t;')

  async.map(files, function (f, next) {
    var _out = [];
    function write (arg) {
      _out.push(arg);
      // console.log(arg);
    }

    var name = path.basename(f).replace(/[^a-z0-9_]/g, '_');
    write('static const unsigned char ' + ' ' + name + '[] = {');

    fs.readFile(f, function (err, buf) {
      filter(f, buf, function (err, buf) {
        write([].slice.apply(Buffer.isBuffer(buf) ? buf : new Buffer(buf)).map(function (h) {
          return '0x' + h.toString(16)
        }).join(', ') + ' \n');
        write('};\n');
        setImmediate(next, null, [path.basename(f), name, buf.length, _out.join('\n')]);
      });
    });
  }, function (err, results) {
    for (var i = 0; i < results.length; i++) {
      write(results[i][3]);
    }

    write('\n\nconst dir_reg_t ' + dirname + '[] = {')
    write(results.map(function (e) {
      return '{' + [JSON.stringify(e[0]), e[1], e[2]].join(', ') + '}'
    }).join(',\n'));
    write(', {0, 0, 0} };');

    next(err, _out.join('\n'));
  });
}

module.exports = packageFolder;
