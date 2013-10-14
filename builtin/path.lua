function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

(exports).join = (function (this)
if true then return (""); end;
end);
(exports).basename = (function (this, file)
if true then return file:replace(_regexp("^.*\\/", ""), ("")); end;
end);

return _module.exports;
end