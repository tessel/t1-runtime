function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local inherits = inherits;
inherits = (function (this, A, B)
local inherits = _debug.getinfo(1, 'f').func;
local f = f;
f = (function (this)

end);
(f).prototype = (B).prototype;
(A).prototype = _new(f);
end);
(exports).inherits = inherits;

return _module.exports;
end