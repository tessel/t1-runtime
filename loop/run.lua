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

  size_t strlen(const char * str);
  int printf(const char *fmt, ...);
]]

local luafunctor = function (f)
  return (function (this, ...) return f(...) end)
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

-- local Socket = {}

-- function Socket:new (o)
--   o = o or {}   -- create object if user does not provide one
--   setmetatable(o, self)
--   self.__index = self

--   -- Create socket
--   self.socket = ffi.C.tm_tcp_open();
--   if self.socket == -1 then
--     print("Could not create socket")
--   end

--   return o
-- end



-- function Socket:connect (port, host)
--   -- Connect to remote server
--   local ret = ffi.C.tm_tcp_connect(self.socket, 74, 125, 235, 20, 80)
--   if ret < 0 then
--     print("connect error:", ret);
--   end
-- end

-- function Socket:write (message)
--   if ffi.C.tm_tcp_write(self.socket, ffi.cast("char *", message), ffi.C.strlen(message)) < 0 then
--     print("Send failed");
--   end
--   print("Data Send");
-- end

-- function Socket:readable ()
--   return ffi.C.tm_tcp_readable(self.socket) ~= 0
-- end

-- function Socket:read ()
--   local server_reply = ffi.new("char[2000]");
--   if ffi.C.tm_tcp_read(self.socket, server_reply, 2000) < 0 then
--     print("recv failed");
--     return nil
--   end
--   return ffi.string(server_reply)
-- end

--------------------

local res = colonize('run.js')
setfenv(res, colony.global)
res()