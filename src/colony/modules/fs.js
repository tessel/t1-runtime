var tm = process.binding('tm');

exports.readFileSync = function (pathname, encoding) {
  var _ = tm.fs_open(pathname, tm.OPEN_EXISTING | tm.RDONLY)
    , fd = _[0]
    , err = _[1];
  if (err || fd == undefined) {
    throw 'ENOENT: Could not open file ' + pathname;
  }
  var res = [];
  while (true) {
    if (tm.fs_readable(fd) != 0) {
      var len = 16*1024;
      var _ = tm.fs_read(fd, len)
        , buf = _[0]
        , err = _[1];
      if (!err && buf && buf.length > 0) {
        res.push(buf);
      }
      if (err || !buf || buf.length < len) {
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
  var _ = tm.fs_dir_open(pathname)
    , dir = _[0]
    , err = _[1];
  if (err || dir == undefined) {
    throw 'ENOENT: Could not open directory ' + pathname;
  }
  var entries = [], ent;
  while ((_ = tm.fs_dir_read(dir), err = _[1], ent = _[0]) != undefined) {
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
