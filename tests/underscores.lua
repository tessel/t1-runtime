function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local a____b, c____d, __K__end = a____b, c____d, __K__end;
a__b = ("hi");
if console:log((1), a__b) then end;
a__b = a__b + (" there");
if console:log((2), a__b) then end;
if console:log((3), a__b:toUpperCase()) then end;
c__d = _obj({
  });
(c__d).cool_beans = (5);
if console:log((4), c__d[("cool_beans")]) then end;
(c__d).func_tastic = (function (this)
if console:log((5), ("OK")) then end;
end)

;
if (function () local base, prop = c__d, "func_tastic"; return base[prop](base); end)() then end;
_K_end = ("this is the end");
if console:log((6), _K_end) then end;

return _module.exports;
end