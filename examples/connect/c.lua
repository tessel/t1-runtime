function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local connect, http, app = connect, http, app;
connect = require(global, ("connect"));
http = require(global, ("http"));
app = connect(global):use(connect:favicon()):use((function (this, req, res)
if (function () local base, prop = res, "end"; return base[prop](base, ("Hello from Connect!\n")); end)() then end;
end));
if http:createServer(app):listen((3000)) then end;

return _module.exports;
end