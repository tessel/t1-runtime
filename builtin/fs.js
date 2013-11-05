var tm = process.binding('tm');

exports.readFileSync = function (pathname) {
  var fd = tm.fs_open(pathname, tm.OPEN_EXISTING);
  var res = [];
  while (true) {
    if (tm.fs_readable(fd)) {
      var len = 100;
      var buf = tm.fs_read(fd, len);
      if (buf.length > 0) {
        res.push(buf);
      }
      if (buf.length < len) {
        break;
      }
    }
  }
  return res.join('');
};

exports.readdirSync = function (path) {
  var ptr = ffi.C.tm_fs_dir_open(path), dir;
  if (ptr == undefined) {
    throw 'ENOENT: Could not open ' + path;
  }
  var dirs = [];
  while ((dir = ffi.C.tm_fs_dir_next(ptr)) != undefined) {
    dirs.push(ffi.string(dir));
  }
  ffi.C.tm_fs_dir_close(ptr);
  return dirs;
};

exports.readFile = function (path, next) {
  setImmediate(function () {
    next("error");
  });
};