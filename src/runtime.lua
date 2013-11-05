-- collectgarbage()
-- print('Start mem:', collectgarbage('count'))

local ffi = require('ffi')
ffi.cdef[[

  /**
   * tm 
   */

  typedef int tm_socket_t;
  static int const TM_SOCKET_INVALID = 0;

  tm_socket_t tm_udp_open ();
  tm_socket_t tm_tcp_open ();
  int tm_tcp_close (tm_socket_t sock);
  int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
  int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen);
  int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
  int tm_tcp_readable (tm_socket_t sock);
  uint32_t tm_hostname_lookup (uint8_t *hostname);
  int tm_tcp_listen (tm_socket_t sock, int port);
  int tm_tcp_accept (tm_socket_t sock, uint32_t *ip);

  /**
   * C stuff
   */

  size_t strlen(const char * str);
  int printf(const char *fmt, ...);
]]

--------------------

-- Returns directory name component of path
-- Copied and adapted from http://dev.alpinelinux.org/alpine/acf/core/acf-core-0.4.20.tar.bz2/acf-core-0.4.20/lib/fs.lua


function readfile (name)
  local prefix = ''
  local fp = assert(io.open(prefix..name))
  local s = fp:read("*a")
  assert(fp:close())
  return s
end

local LUA_DIRSEP = '/'
 
-- https://github.com/leafo/lapis/blob/master/lapis/cmd/path.lua
local function path_normalize (path)
  while string.find(path, "%w+/%.%./") or string.find(path, "/%./") do
    path = string.gsub(path, "%w+/%.%./", "/")
    path = string.gsub(path, "/%./", "/")
  end
  return path
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

-------------

function colonize (name)
  local f = assert(io.popen('colony -c ' .. name, 'r'))
  local s = assert(f:read('*a'))
  f:close()
  return assert(loadstring('return ' .. s, "@"..name))()
end

local colony = require('lib/colony')

-------------

-- Lua API for colony

local luafunctor = function (f)
  return (function (this, ...) return f(...) end)
end

colony.global.ffi = {
  C = {}
}
setmetatable(colony.global.ffi, {
  __index = function (this, key)
    local fn = function (this, ...)
      return ffi[key](...)
    end
    this[key] = fn
    return fn
  end
})
setmetatable(colony.global.ffi.C, {
  __index = function (this, key)
    local fn = function (this, ...)
      return ffi.C[key](...)
    end
    this[key] = fn
    return fn
  end
})

colony.global.tm__hostname__lookup = function (ths, host)
  return ffi.C.tm_hostname_lookup(ffi.cast('uint8_t *', host))
end
colony.global.tm__tcp__open = function (ths)
  return ffi.C.tm_tcp_open()
end
colony.global.tm__tcp__close = function (ths, sock)
  return ffi.C.tm_tcp_close(sock)
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
colony.global.tm__tcp__listen = function (this, sock, port)
  return ffi.C.tm_tcp_listen(sock, port)
end
colony.global.tm__tcp__accept = function (this, sock)
  local ip = ffi.new("uint32_t[1]");
  return ffi.C.tm_tcp_accept(sock, ip)
end


------------------

local http_parser = require('http_parser')

colony.global.tm__http__parser = function (this, type, cb)
  local parser
  parser = http_parser.new(type, {
    onMessageBegin = function ()
      if cb.on_message_begin then
        cb.on_message_begin(this)
      end
    end,
    onUrl = function (value)
      if cb.on_url then
        cb.on_url(this, value)
      end
    end,
    onHeaderField = function (field)
      if cb.on_header_field then
        cb.on_header_field(this, field)
      end
    end,
    onHeaderValue = function (value)
      if cb.on_header_value then
        cb.on_header_value(this, value)
      end
    end,
    onHeadersComplete = function (info)
      if cb.on_headers_complete then
        cb.on_headers_complete(this, parser.method)
      end
    end,
    onBody = function (chunk)
      if cb.on_body then
        cb.on_body(this, chunk)
      end
    end,
    onMessageComplete = function ()
      if cb.on_message_complete then
        cb.on_message_complete(this)
      end
    end
  })
  this.on_error = cb.on_error
  this.__parser = parser
end

colony.global.tm__http__parser.prototype.write = function (this, str)
  local nparsed = this.__parser:execute(str, 0, #str)
  if nparsed ~= string.len(str) and this.on_error then
    this:on_error('Could not parse tokens at character #' .. tostring(nparsed))
  end
  -- if (parser->upgrade) {
  --   /* handle new protocol */
  --     puts("UPGRADE");
  -- } else if (nparsed != nread) {
  --   /* Handle error. Usually just close the connection. */
  --     puts("ERROR");
  --     break;
  -- }
  return nparsed
end


------------------

-- Run that runtime

local colony_cache = {}

function colony_run (name, root)
  root = root or './'
  -- print('<-', root, name)
  if string.sub(name, -3) == '.js' then
    name = string.sub(name, 1, -4)
  end 

  if string.sub(name, 1, 1) ~= '.' then
    if fs_exists('./builtin/' .. name .. '.js') then
      root = './builtin/'
      name = name .. '.js'
    else
      -- TODO climb hierarchy for node_modules
      local fullname = name
      while string.find(name, '/') do
        name = path_dirname(name)
      end
      while not fs_exists(root .. 'node_modules/' .. name) and not fs_exists(root .. 'node_modules/' .. name .. '/package.json') and string.find(path_dirname(root), "/") do
        root = path_dirname(root) .. '/'
      end
      if not root then
        error('Could not find installed module "' .. p .. '"')
      end
      root = root .. 'node_modules/'
      if string.find(fullname, '/') then
        name = fullname
      else
        _, _, label = string.find(readfile(root .. name .. '/package.json'), '"main"%s-:%s-"([^"]+)"')
        name = name .. '/' .. (label or 'index.js')
      end
    end
  end
  if string.sub(name, -3) ~= '.js' then
    name = name .. '.js'
  end
  local p = path_normalize(root .. name)
  -- print('->', p)

  local res = colony_cache[p]
  if not res then
    res = assert(loadstring('return ' .. readfile(string.reverse(string.gsub(string.reverse(string.sub(p, 1, -4)), '/', '~/', 1)) .. '.colony'), "@"..p))()
  end
  -- local res = colony_cache[p] or colonize(p)
  colony_cache[p] = res
  if not res then
    error('Could not find module "' .. p .. '"')
  end

  setfenv(res, colony.global)
  colony.global.require = function (ths, value)
    local n = 2
    -- metamethods are tricky here
    while debug.getinfo(n).namewhat == 'metamethod' do
      n = n + 1
    end
    local scriptpath = string.sub(debug.getinfo(n).source, 2)
    return colony_run(value, path_dirname(scriptpath) .. '/')
  end
  return res()
end


-- Entry point

if #arg < 1 then
  print('Usage: colony script.js')
  return 1
end

os.execute("node preprocessor 2> /dev/null");

collectgarbage()
local p = arg[1]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end
-- print('Run mem:', collectgarbage('count'))

colony_run(p)
colony.runEventLoop();

-- print('End mem:', collectgarbage('count'))