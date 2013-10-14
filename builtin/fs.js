exports.readFileSync = function () {
  return "";
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