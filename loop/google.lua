-- local prefix = ""
-- function require(name)
--   local fp = assert(io.open(prefix..name..".lua"))
--   local s = fp:read("*a")
--   assert(fp:close())
--   print(s)
--   -- return assert(loadstring(s, "@"..name..".lua"))()
-- end

print('STAT:', collectgarbage('count') + 2.3)

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


local Socket = {}

function Socket:new (o)
  o = o or {}   -- create object if user does not provide one
  setmetatable(o, self)
  self.__index = self

  -- Create socket
  self.socket = ffi.C.tm_tcp_open();
  if self.socket == -1 then
    print("Could not create socket")
  end

  return o
end

function Socket:connect (port, host)
  -- Connect to remote server
  local ret = ffi.C.tm_tcp_connect(self.socket, 74, 125, 235, 20, 80)
  if ret < 0 then
    print("connect error:", ret);
  end
end

function Socket:write (message)
  if ffi.C.tm_tcp_write(self.socket, ffi.cast("char *", message), ffi.C.strlen(message)) < 0 then
    print("Send failed");
  end
  print("Data Send");
end

function Socket:readable ()
  return ffi.C.tm_tcp_readable(self.socket) ~= 0
end

function Socket:read ()
  local server_reply = ffi.new("char[2000]");
  if ffi.C.tm_tcp_read(self.socket, server_reply, 2000) < 0 then
    print("recv failed");
    return nil
  end
  return ffi.string(server_reply)
end





-- go --

local s = Socket:new()
s:connect(80, "74.125.235.20")
s:write("GET / HTTP/1.1\r\n\r\n")

while true do
  if s:readable() then
    print('reading')
    -- print("Reply:", s:read())
    print(s:read())
    print(collectgarbage('count') + 2.3)
  else
    -- print('...')
  end
end