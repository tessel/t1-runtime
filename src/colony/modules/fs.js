var tm = process.binding('tm');

exports.readFileSync = function (pathname, encoding) {
  var fd = tm.fs_open(pathname, tm.OPEN_EXISTING | tm.RDONLY);
  if (fd == undefined) {
    throw 'ENOENT: Could not open file ' + pathname;
  }
  var res = [];
  while (true) {
    if (tm.fs_readable(fd) != 0) {
      var len = 16*1024;
      var buf = tm.fs_read(fd, len);
      if (buf && buf.length > 0) {
        res.push(buf);
      }
      if (!buf || buf.length < len) {
        break;
      }
    }
  }
  tm.fs_close(fd);
  
  var buf = Buffer.concat(res);
  if (encoding) {
    return buf.toString(encoding);
  } else {
    return buf;
  }
};

exports.readdirSync = function (pathname) {
  var dir = tm.fs_dir_open(pathname);
  if (dir == undefined) {
    throw 'ENOENT: Could not open directory ' + pathname;
  }
  var entries = [];
  while ((ent = tm.fs_dir_read(dir)) != undefined) {
    if (ent != '.' && ent != '..') {
      entries.push(ent);
    }
  }
  tm.fs_dir_close(dir);
  return entries;
};

exports.readdir = function (pathname, next) {
  setImmediate(function () {
    next(null, exports.readdirSync(pathname));
  })
}

exports.readFile = function (pathname, next) {
  setImmediate(function () {
    next(null, exports.readFileSync(pathname));
  });
};
