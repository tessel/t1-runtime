function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local net, client = net, client;
net = require(global, ("net"));
client = net:connect((80), ("74.125.235.20"), (function (this)
if console:log(("client connected")) then end;
if client:write(("GET / HTTP/1.1\r\n\r\n")) then end;
end));
if client:on(("data"), (function (this, data)
if console:log(String(global, data)) then end;
end)) then end;

return _module.exports;
end
-- client.on('end', function() {
--   console.log('client disconnected');
-- });