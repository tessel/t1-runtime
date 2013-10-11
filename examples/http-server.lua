function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local http = http;
http = require(global, ("http"));
if http:createServer((function (this, req, res)
if res:writeHead((200), _obj({
  ["Content-Type"]=("text/plain")})) then end;
if (function () local base, prop = res, "end"; return base[prop](base, ("Hello World\n")); end)() then end;
end)):listen((1337), ("127.0.0.1")) then end;
if console:log(("Server running at http:--127.0.0.1:1337/")) then end;

return _module.exports;
end