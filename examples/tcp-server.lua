function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local net, server = net, server;
net = require(global, ("net"));
server = net:createServer((function (this, socket)
if socket:write(("Echo server\r\n")) then end;
if socket:pipe(socket) then end;
end));
if server:listen((1337), ("127.0.0.1")) then end;
if console:log(("Listening on localhost:1337")) then end;

return _module.exports;
end