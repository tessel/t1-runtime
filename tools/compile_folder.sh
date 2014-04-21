#!/usr/bin/env node

var fs = require('fs');
var async = require('async');
var path = require('path');

function packageFolder (files, varname, section, filter, next)
{
  var dirname = varname;
  section = section ? '__attribute__ ((section ("' + section + '\\n\\t#")))' : '';

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
    write('static unsigned char ' + section + ' ' + name + '[] = {');

    fs.readFile(f, 'utf-8', function (err, buf) {
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


// console.log(process.argv);

if (process.argv.length < 5) {
  console.error('Usage: ./compile_files.js outfile token_name section [files ... ]') 
  process.exit(1);
}

var outfile = process.argv[2];
var varname = process.argv[3];
var section = process.argv[4];
var infiles = process.argv.slice(5);


var colony = require('colony');

// console.log('>>>', process.argv);

packageFolder(infiles, varname, section, function (file, buf, next) {
  if (file.match(/\.js$/)) {
    try {
      next(null, new Buffer(colony.colonize(String(buf)).source));
      //colony.toBytecode(colony.colonize(String(buf)), '[T]:' + file, next);
    } catch (e) {
      throw new Error('Bytecode compilation of ' + file + ' failed.');
    }
  } else if (file.match(/\.lua$/)) {
    try {
      next(null, new Buffer(String(buf)));
      //colony.toBytecode({ source: String(buf) }, '[T]: ' + file, next);
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