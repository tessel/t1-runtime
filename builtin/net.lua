function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local util, Stream, TCPSocket, TCPServer = util, Stream, TCPSocket, TCPServer;
TCPSocket = (function (this, socket)
local TCPSocket = _debug.getinfo(1, 'f').func;
(this).socket = socket;
end);
TCPServer = (function (this, socket)
local TCPServer = _debug.getinfo(1, 'f').func;
if TCPSocket:call(this, socket) then end;
end);
util = require(global, ("util"));
Stream = (require(global, ("stream"))).Stream;
if util:inherits(TCPSocket, Stream) then end;
((TCPSocket).prototype).connect = (function (this, port, ip, cb)
local ips, client = ips, client;
ips = ip:split(("."));
client = this;
if setImmediate(global, (function (this)
if tm__tcp__connect(global, client.socket, Number(global, ips[(0)]), Number(global, ips[(1)]), Number(global, ips[(2)]), Number(global, ips[(3)]), Number(global, port)) then end;
if (function () local base, prop = client, "__listen"; return base[prop](base); end)() then end;
if cb(global) then end;
end)) then end;
end);
((TCPSocket).prototype).__listen = (function (this)
local client = client;
client = this;
if setInterval(global, (function (this)
local buf = buf;
while _truthy((client).socket and (tm__tcp__readable(global, client.socket) > (0))) do

buf = tm__tcp__read(global, client.socket);
if _truthy((not (buf)) or ((buf).length == (0))) then
_c = _break; break;
end
if client:emit(("data"), buf) then end;

end
end), (100)) then end;
end);
((TCPSocket).prototype).write = (function (this, buf, cb)
local socket = socket;
socket = (this).socket;
if setImmediate(global, (function (this)
if tm__tcp__write(global, socket, buf, buf.length) then end;
if _truthy(cb) then
if cb(global) then end;
end
end))
 then end;
end);
((TCPSocket).prototype).close = (function (this)
local self = self;
self = this;
if setImmediate(global, (function (this)
if tm__tcp__close(global, self.socket) then end;
(self).socket = (null);
if self:emit(("close")) then end;
end)) then end;
end);
(exports).connect = (function (this, port, host, callback)
local client = client;
client = _new(TCPSocket, tm__tcp__open(global));
if client:connect(port, host, callback) then end;
if true then return client; end;
end);
if util:inherits(TCPServer, TCPSocket) then end;
((TCPServer).prototype).listen = (function (this, port, ip)
local self, res = self, res;
self = this;
res = tm__tcp__listen(global, this.socket, port);
if (res < (0)) then
_error(((((("Error listening on TCP socket (port ") + port) + (", ip ")) + ip) + (")")))
end
if setInterval(global, (function (this)
local client, clientsocket = client, clientsocket;
client = nil;
if _truthy((tm__tcp__readable(global, self.socket) > (0)) and (((function () local _r = tm__tcp__accept(global, self.socket); client = _r; return _r; end)()) >= (0))) then
clientsocket = _new(TCPSocket, client);
if (function () local base, prop = clientsocket, "__listen"; return base[prop](base); end)() then end;
if self:emit(("socket"), clientsocket) then end;
end
end)) then end;
end);
(exports).createServer = (function (this, onsocket)
local server = server;
server = _new(TCPServer, tm__tcp__open(global));
if onsocket and server:on(("socket"), onsocket) then end;
if true then return server; end;
end);

return _module.exports;
end