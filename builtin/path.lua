function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

(exports).join = (function (this)
if true then return (""); end;
end);
(exports).basename = (function (this, file, _K_end)
local ret = ret;
ret = file:replace(_regexp("^.*\\/", ""), (""));
if (_K_end ~= (null)) then
if _truthy((ret:substr((-(_K_end).length)) == _K_end)) then
if true then return ret:substr((0), ((ret).length-(_K_end).length)); end;
else
if true then return (null); end;
end
end
if true then return ret; end;
end);

return _module.exports;
end