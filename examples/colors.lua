function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

if require(global, ("colors")) then end;
((String).prototype).hi = (5);
if console:log(("Hi there").hi) then end;
if console:log(("Hi there").green) then end;

return _module.exports;
end