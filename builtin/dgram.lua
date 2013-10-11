function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local UDP = UDP;
UDP = (function (this, socket)
local UDP = _debug.getinfo(1, 'f').func;
(this).socket = socket;
end);
(UDP).prototype = _new(EventEmitter);
((UDP).prototype).bind = (function (this, port)
local client = client;
if (function () local base, prop = tm, "net_udp_listen"; return base[prop](base, this.socket, port); end)() then end;
client = this;
if setInterval(global, (function (this)
local r, buf = r, buf;
r = (function () local base, prop = tm, "net_is_readable"; return base[prop](base, client.socket); end)();
while _truthy(r) do

buf = (function () local base, prop = tm, "net_udp_receive"; return base[prop](base, client.socket); end)();
if client:emit(("data"), buf) then end;

end
end), (100)) then end;
if cb and cb(global) then end;
end)

;
((UDP).prototype).send = (function (this, ip, port, text)
local ips = ips;
ips = ip:split(("."));
if (function () local base, prop = tm, "net_udp_send"; return base[prop](base, this.socket, ips[(0)], ips[(1)], ips[(2)], ips[(3)], port, text); end)() then end;
end)

;
((UDP).prototype).close = (function (this)
(this).socket = (function () local base, prop = tm, "net_udp_close_socket"; return base[prop](base, this.socket); end)();
end)

;
((require).cache)[("!dgram")] = _obj({
  ["createSocket"]=(function (this)
if true then return _new(UDP, (function () local base, prop = tm, "net_udp_open_socket"; return base[prop](base); end)()); end;
end)});

return _module.exports;
end