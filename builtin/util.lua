function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local inherits, deprecate, isString = inherits, deprecate, isString;
inherits = (function (this, A, B)
local inherits = _debug.getinfo(1, 'f').func;
local f = f;
f = (function (this)

end);
(f).prototype = (B).prototype;
(A).prototype = _new(f);
end);
deprecate = (function (this, fn)
local deprecate = _debug.getinfo(1, 'f').func;
if true then return fn; end;
end);
isString = (function (this, str)
local isString = _debug.getinfo(1, 'f').func;
if true then return (_typeof(str) == ("string")); end;
end);
(exports).inherits = inherits;
(exports).deprecate = deprecate;
(exports).isString = isString;

return _module.exports;
end