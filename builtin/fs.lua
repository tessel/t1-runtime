function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

(exports).readFileSync = (function (this)
if true then return (""); end;
end);
(exports).readdirSync = (function (this, path)
local ptr, dir, dirs = ptr, dir, dirs;
ptr = tm__fs__dir__open(global, path);
dir = nil;
if _truthy((ptr == undefined)) then
_error((("ENOENT: Could not open ") + path))
end
dirs = _arr({});
while ((function () local _r = tm__fs__dir__next(global, ptr); dir = _r; return _r; end)() ~= undefined) do

if dirs:push(dir) then end;

end
if tm__fs__dir__close(global, ptr) then end;
if true then return dirs; end;
end);

return _module.exports;
end