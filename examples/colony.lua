function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local colonize = colonize;
if (function () local base, prop = console, "error"; return base[prop](base, ((process:memoryUsage()).heapUsed/(1024))); end)() then end;
colonize = require(global, ("colony/src/colonize"));
if console:log(colonize(global, ("console.log(\"hello world!\")"))) then end;
if (function () local base, prop = console, "error"; return base[prop](base, ((process:memoryUsage()).heapUsed/(1024))); end)() then end;

return _module.exports;
end