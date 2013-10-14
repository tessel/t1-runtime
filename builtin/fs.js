exports.readFileSync = function () {
  return "";
};

exports.readdirSync = function (path) {
  var ptr = tm_fs_dir_open(path), dir;
  if (ptr == undefined) {
    throw 'ENOENT: Could not open ' + path;
  }
  var dirs = [];
  while ((dir = tm_fs_dir_next(ptr)) != undefined) {
    dirs.push(dir);
  }
  tm_fs_dir_close(ptr);
  return dirs;
};