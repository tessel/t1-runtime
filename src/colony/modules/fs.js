// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

var path = require('path');

var tm = process.binding('tm');

function asynchronize (fn)
{
  return function () {
    var args = Array.prototype.slice.apply(arguments);
    var callback = function () { };
    if (typeof args[args.length - 1] == 'function') {
      callback = args.pop();
    }
    setImmediate(function () {
      try {
        callback(null, fn.apply(this, args));
      } catch (err) {
        callback(err);
      }
    })
  }
}

function _isFile (pathname)
{
  return tm.fs_type(pathname) == tm.FS_TYPE_FILE;
}

function _isDirectory (pathname)
{
  return tm.fs_type(pathname) == tm.FS_TYPE_DIR;
}

function _isDirEmpty (pathname)
{
  var _ = tm.fs_dir_open(pathname)
    , dir = _[0]
    , err = _[1];
  if (err) {
    return 0;
  }

  while (true) {
    var _ = tm.fs_dir_read(dir)
      , ent = _[0]
      , err = _[1];

    if (err || !ent) {
      return true;
    }
    if (ent == '.' || ent == '..') {
      continue;
    }

    if (!err && ent != undefined) {
      return false;
    }
    return true;
  }
}

function _getAbsolute (pathname) {
  return pathname.match(/^\//) ? pathname : path.resolve(process.cwd(), pathname);
}


function readFileSync (pathname, options)
{
  pathname = _getAbsolute(pathname);

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


function readdirSync (pathname)
{
  pathname = _getAbsolute(pathname);

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


function writeFileSync (pathname, data)
{
  pathname = _getAbsolute(pathname);

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
  pathname = _getAbsolute(pathname);

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
  oldname = _getAbsolute(oldname);
  newname = _getAbsolute(newname);

  var err = tm.fs_rename(oldname, newname);
  if (err) {
    throw new Error('ENOENT: Could not rename file ' + oldname);
  }
}


function truncateSync (pathname)
{
  pathname = _getAbsolute(pathname);

  var _ = tm.fs_open(pathname, tm.OPEN_ALWAYS | tm.WRONLY, 0644)
    , fd = _[0]
    , err = _[1];
  if (err || fd == undefined) {
    throw new Error('ENOENT: Could not open file ' + pathname);
  }

  var ret = tm.fs_truncate(fd);
  tm.fs_close(fd);
}


function unlinkSync (pathname)
{
  pathname = _getAbsolute(pathname);

  if (!_isFile(pathname)) {
    throw new Error('EPERM: Cannot unlink non-file ' + pathname)
  }

  var err = tm.fs_destroy(pathname);
  if (err) {
    throw new Error('ENOENT: Could not unlink file ' + pathname);
  }
}


function mkdirSync (pathname)
{
  pathname = _getAbsolute(pathname);

  var err = tm.fs_dir_create(pathname);
  if (err) {
    throw new Error('ENOENT: Unsuccessful creation of file ' + pathname);
  }
}


function rmdirSync (pathname)
{
  pathname = _getAbsolute(pathname);

  if (!_isDirectory(pathname)) {
    throw new Error('EPERM: Cannot rmdir non-dir ' + pathname)
  }
  if (!_isDirEmpty(pathname)) {
    throw new Error('ENOENT: Cannot remove non-empty directory ' + pathname);
  }
  
  var err = tm.fs_destroy(pathname);
  if (err) {
    throw new Error('ENOENT: Could not rmdir ' + pathname);
  }
}


function existsSync (pathname, data)
{
  pathname = _getAbsolute(pathname);

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


function Stats () {
}

Stats.prototype.isFile = function () { return this._isFile; }
Stats.prototype.isDirectory = function () { return this._isDirectory; }
Stats.prototype.isBlockDevice = function () { return this._isBlockDevice; }
Stats.prototype.isCharacterDevice = function () { return this._isCharacterDevice; }
Stats.prototype.isSymbolicLink = function () { return this._isSymbolicLink; }
Stats.prototype.isFIFO = function () { return this._isFIFO; }
Stats.prototype.isSocket = function () { return this._isSocket; }

function statSync (pathname)
{
  pathname = _getAbsolute(pathname);

  var stats = new Stats;

  stats._isFile = _isFile(pathname);
  stats._isDirectory = _isDirectory(pathname);
  stats._isBlockDevice = 0;
  stats._isCharacterDevice = 0;
  stats._isSymbolicLink = 0;
  stats._isFIFO = 0;
  stats._isSocket = 0;

  // unix fakery
  stats.dev = 0;
  stats.ino = 0;
  stats.mode = 0;
  stats.nlink = 0;
  stats.uid = 0;
  stats.gid = 0;
  stats.rdev = 0;
  stats.size = 0;
  stats.blksize = 0;
  stats.blocks = 0;
  stats.atime = new Date();
  stats.mtime = new Date();
  stats.ctime = new Date();

  if (stats._isFile) {
    var _ = tm.fs_open(pathname, tm.OPEN_EXISTING), fd = _[0], err = _[1];
    if (!err) {
      stats.size = tm.fs_length(fd);
      tm.fs_close(fd);
    }
  }

  return stats;
}


function createReadStream (pathname, options)
{
  pathname = _getAbsolute(pathname);

  var stream = new (require('stream').Readable);
  stream._read = function (bytes) {
    // noop
  }

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

  stream._read = function (len) {
    function loop () {
      if (tm.fs_readable(fd) == 0) {
        return setTimeout(loop, 10);
      }
      var _ = tm.fs_read(fd, len)
        , buf = _[0]
        , err = _[1];
      if (!err && buf && buf.length > 0) {
        return stream.push(buf);
      }
      if (err) {
        stream.emit('error', err);
      }

      tm.fs_close(fd);
      fd = null;
      stream.push(null);
    }
    if (fd != null) {
      loop();
    }
  }

  return stream;
};


function createWriteStream (pathname)
{
  pathname = _getAbsolute(pathname);
  
  var _ = tm.fs_open(pathname, tm.CREATE_ALWAYS | tm.WRONLY, 0644)
    , fd = _[0]
    , err = _[1];
  if (err || fd == undefined) {
    throw 'ENOENT: Could not open file ' + pathname;
  }

  var stream = new (require('stream')).Writable;
  stream._write = function (chunk, encoding, callback) {
    if (fd == null) {
      return;
    }

    if (!Buffer.isBuffer(chunk)) {
      chunk = new Buffer(chunk || '', encoding);
    }
    tm.fs_write(fd, chunk, chunk.length);
    callback();
  }
  stream.on('pipe', function (pipe) {
    pipe.on('end', function () {
      stream.emit('end');
      tm.fs_close(fd);
      fd = null;
      stream.emit('close');
    })
  })
  return stream;
};


exports.readFileSync = readFileSync;
exports.readdirSync = readdirSync;
exports.writeFileSync = writeFileSync;
exports.appendFileSync = appendFileSync;
exports.renameSync = renameSync;
exports.truncateSync = truncateSync;
exports.unlinkSync = unlinkSync;
exports.mkdirSync = mkdirSync;
exports.rmdirSync = rmdirSync;
exports.existsSync = existsSync;
exports.statSync = statSync;
exports.lstatSync = lstatSync;

exports.readFile = asynchronize(readFileSync);
exports.readdir = asynchronize(readdirSync);
exports.writeFile = asynchronize(writeFileSync);
exports.appendFile = asynchronize(appendFileSync);
exports.rename = asynchronize(renameSync);
exports.truncate = asynchronize(truncateSync);
exports.unlink = asynchronize(unlinkSync);
exports.mkdir = asynchronize(mkdirSync);
exports.rmdir = asynchronize(rmdirSync);
exports.exists = asynchronize(existsSync);
exports.stat = asynchronize(statSync);
exports.lstat = asynchronize(lstatSync);

exports.Stats = Stats;

exports.createReadStream = createReadStream;
exports.createWriteStream = createWriteStream;
