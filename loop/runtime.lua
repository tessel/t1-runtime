function readfile (name)
  local prefix = ''
  local fp = assert(io.open(prefix..name))
  local s = fp:read("*a")
  assert(fp:close())
  return s
end

function colonize (name)
  local f = assert(io.popen('colony -c ' .. name, 'r'))
  local s = assert(f:read('*a'))
  f:close()
  return assert(loadstring('return ' .. s, "@"..name))()
end

local colony = require('colony')

-----------

local ffi = require('ffi')
ffi.cdef[[
  typedef int tm_socket_t;
  static int const TM_SOCKET_INVALID = 0;

  tm_socket_t tm_udp_open ();
  tm_socket_t tm_tcp_open ();
  int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
  int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen);
  int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
  int tm_tcp_readable (tm_socket_t sock);
  uint32_t tm_hostname_lookup (uint8_t *hostname);

  size_t strlen(const char * str);
  int printf(const char *fmt, ...);
]]

local luafunctor = function (f)
  return (function (this, ...) return f(...) end)
end

colony.global.tm__hostname__lookup = function (ths, host)
  return ffi.C.tm_hostname_lookup(ffi.cast('uint8_t *', host))
end
colony.global.tm__tcp__open = function (ths)
  return ffi.C.tm_tcp_open()
end
colony.global.tm__tcp__connect = function (ths, sock, ip0, ip1, ip2, ip3, port)
  return ffi.C.tm_tcp_connect(sock, ip0, ip1, ip2, ip3, port)
end
colony.global.tm__tcp__write = function (ths, sock, buf, buflen)
  return ffi.C.tm_tcp_write(sock, ffi.cast('uint8_t *', buf), buflen)
end
colony.global.tm__tcp__read = function (ths, socket)
  local server_reply = ffi.new("char[2000]");
  if ffi.C.tm_tcp_read(socket, server_reply, 2000) < 0 then
    print("recv failed");
    return nil
  end
  return ffi.string(server_reply)
end
colony.global.tm__tcp__readable = function (ths, sock)
  return ffi.C.tm_tcp_readable(sock)
end

--------------------

-- Returns directory name component of path
-- Copied and adapted from http://dev.alpinelinux.org/alpine/acf/core/acf-core-0.4.20.tar.bz2/acf-core-0.4.20/lib/fs.lua

local LUA_DIRSEP = '/'
 
-- https://github.com/leafo/lapis/blob/master/lapis/cmd/path.lua
local function path_normalize (path)
  return string.gsub(path, "^%./", "")
end

local function fs_exists (path)
  local file = io.open(path)
  if file then
    return file:close() and true
  end
end

-- Returns string with any leading directory components removed. If specified, also remove a trailing suffix. 
-- Copied and adapted from http://dev.alpinelinux.org/alpine/acf/core/acf-core-0.4.20.tar.bz2/acf-core-0.4.20/lib/fs.lua
local function path_basename (string_, suffix)
  string_ = string_ or ''
  local basename = string.gsub (string_, '[^'.. LUA_DIRSEP ..']*'.. LUA_DIRSEP ..'', '')
  if suffix then
    basename = string.gsub (basename, suffix, '')
  end
  return basename
end

local function path_dirname (string_)
  string_ = string_ or ''
  -- strip trailing / first
  string_ = string.gsub (string_, LUA_DIRSEP ..'$', '')
  local basename = path_basename(string_)
  string_ = string.sub(string_, 1, #string_ - #basename - 1)
  return(string_)  
end



------------------

-- Run that runtime

function colony_run (name, root)
  root = root or './'
  local res = colonize(path_normalize(root .. name .. '.js'))
  setfenv(res, colony.global)
  colony.global.require = function (ths, value)
    if string.sub(value, 1, 1) == '.' then
      return colony_run(value, path_dirname(name) .. '/')
    else
      return colony_run(value, './builtin/')
    end
  end
  return res()
end

colony_run('./examples/google-http')