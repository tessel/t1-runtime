var tm = process.binding('tm');


function readFileSync (pathname, options)
{
  var _ = tm.fs_open(pathname, tm.OPEN_EXISTING | tm.RDONLY)
    , fd = _[0]
    , err = _[1];
  if (err || fd == undefined) {
    throw 'ENOENT: Could not open file ' + pathname;
  }

  var encoding = options && options.encoding;
  if (typeof options == 'string') {
    encoding = options;
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
  if (err) {
    throw 'ENOENT: Could not open directory ' + pathname;
  }

  var entries = [];
  while (true) {
    var _ = tm.fs_dir_read(dir)
      , ent = _[0]
      , err = _[1];
    // todo throw on err
    if (err || ent == undefined) {
      break;
    }

    if (ent != '.' && ent != '..') {
      entries.push(ent);
    }
  }
  tm.fs_dir_close(dir);
  return entries;
};


function readdirSync (pathname)
{
  var _ = tm.fs_dir_open(pathname)
    , dir = _[0]
    , err = _[1];
  if (err) {
    throw 'ENOENT: Could not open directory ' + pathname;
  }

  var entries = [];
  while (true) {
    var _ = tm.fs_dir_read(dir)
      , ent = _[0]
      , err = _[1];
    // todo throw on err
    if (err || ent == undefined) {
      break;
    }

    if (ent != '.' && ent != '..') {
      entries.push(ent);
    }
  }
  tm.fs_dir_close(dir);
  return entries;
};


function readdir (pathname, next)
{
  setImmediate(function () {
    next(null, exports.readdirSync(pathname));
  })
}


function readFile (pathname, options, next)
{
  if (typeof options == 'function') {
    next = options;
    options = {};
  }

  setImmediate(function () {
    next(null, exports.readFileSync(pathname, options));
  });
}


function writeFileSync (pathname, data)
{
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(String(data));
  }

  var _ = tm.fs_open(pathname, tm.CREATE_ALWAYS | tm.WRONLY, 0644)
    , fd = _[0]
    , err = _[1];
  if (err || fd == undefined) {
    throw 'ENOENT: Could not open file ' + pathname;
  }

  var ret = tm.fs_write(fd, data, data.length);
  tm.fs_close(fd);
}


function appendFileSync (pathname, data)
{
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(String(data));
  }

  var _ = tm.fs_open(pathname, tm.OPEN_EXISTING | tm.APPEND | tm.WRONLY, 0644)
    , fd = _[0]
    , err = _[1];
  if (err || fd == undefined) {
    throw new Error('ENOENT: Could not open file ' + pathname);
  }

  // SEEK TO END OF FILE
  var len = tm.fs_length(fd)
  tm.fs_seek(fd, tm.fs_length(fd));

  var ret = tm.fs_write(fd, data, data.length);
  tm.fs_close(fd);
}


function renameSync (oldname, newname)
{
  var err = tm.fs_rename(oldname, newname);
  if (err) {
    throw new Error('ENOENT: Could not rename file ' + oldname);
  }
}


function unlinkSync (pathname)
{
  var err = tm.fs_destroy(pathname);
  if (err) {
    throw 'ENOENT: Could not unlink file ' + pathname;
  }
}


function existsSync (pathname, data)
{
  if (!Buffer.isBuffer(data)) {
    data = new Buffer(String(data));
  }

  var _ = tm.fs_open(pathname, tm.RDONLY)
    , fd = _[0]
    , err = _[1];

  if (fd) {
    tm.fs_close(fd);
  }
  return !err && fd != undefined;
}


exports.readFile = readFile;
exports.readFileSync = readFileSync;
exports.readdir = readdir;
exports.readdirSync = readdirSync;
exports.writeFileSync = writeFileSync;
exports.appendFileSync = appendFileSync;
exports.renameSync = renameSync;
exports.unlinkSync = unlinkSync;
exports.existsSync = existsSync;
