function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

(exports).readFileSync = (function (this)
if true then return (""); end;
end);
(exports).readdirSync = (function (this, path)
local ptr, dir, dirs = ptr, dir, dirs;
ptr = (function () local base, prop = (ffi).C, "tm_fs_dir_open"; return base[prop](base, path); end)();
dir = nil;
if _truthy((ptr == undefined)) then
_error((("ENOENT: Could not open ") + path))
end
dirs = _arr({});
while ((function () local _r = (function () local base, prop = (ffi).C, "tm_fs_dir_next"; return base[prop](base, ptr); end)(); dir = _r; return _r; end)() ~= undefined) do

if dirs:push(ffi:string(dir)) then end;

end
if (function () local base, prop = (ffi).C, "tm_fs_dir_close"; return base[prop](base, ptr); end)() then end;
if true then return dirs; end;
end);

return _module.exports;
end