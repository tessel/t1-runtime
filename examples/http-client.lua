function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local http, options, req = http, options, req;
http = require(global, ("http"));
options = _obj({
  ["hostname"]=("google.com"),
  ["port"]=80,
  ["path"]=("/"),
  ["method"]=("GET")});
req = http:request(options, (function (this, res)
if res:setEncoding(("utf8")) then end;
if res:on(("data"), (function (this, chunk)
if console:log((("BODY: ") + (chunk).length)) then end;
end)) then end;
end));
if req:on(("error"), (function (this, e)
if console:log((("problem with request: ") + (e).message)) then end;
end)) then end;
if (function () local base, prop = req, "end"; return base[prop](base); end)() then end;

return _module.exports;
end

-- var net = require('net');
-- var client = net.connect(80, '74.125.235.20', function() { //'connect' listener
--   console.log('client connected');
--   client.write('GET / HTTP/1.1\r\n\r\n');
-- });
-- client.on('data', function(data) {
--   console.log(String(data));
--   // client.end();
-- });
-- // client.on('end', function() {
-- //   console.log('client disconnected');
-- // });