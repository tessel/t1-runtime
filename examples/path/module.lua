-- Copyright Joyent, Inc. and other Node contributors.
--
-- Permission is hereby granted, free of charge, to any person obtaining a
-- copy of this software and associated documentation files (the
-- "Software"), to deal in the Software without restriction, including
-- without limitation the rights to use, copy, modify, merge, publish,
-- distribute, sublicense, and/or sell copies of the Software, and to permit
-- persons to whom the Software is furnished to do so, subject to the
-- following conditions:
--
-- The above copyright notice and this permission notice shall be included
-- in all copies or substantial portions of the Software.
--
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
-- OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
-- MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
-- NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
-- DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
-- OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
-- USE OR OTHER DEALINGS IN THE SOFTWARE.


function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;

local isWindows, util, normalizeArray, splitDeviceRe, splitTailRe, splitPath, normalizeUNCRoot, splitPathRe = isWindows, util, normalizeArray, splitDeviceRe, splitTailRe, splitPath, normalizeUNCRoot, splitPathRe;
normalizeArray = (function (this, parts, allowAboveRoot)
local normalizeArray = _debug.getinfo(1, 'f').func;
local up, i, last = up, i, last;
up = (0);
i = ((parts).length - (1));
while (i >= (0)) do

last = (parts)[i];
if (last == (".")) then
if parts:splice(i, (1)) then end;
else
if (last == ("..")) then
if parts:splice(i, (1)) then end;
(function () local _r = up; up = _r + 1; return _r end)();
else
if _truthy(up) then
if parts:splice(i, (1)) then end;
(function () local _r = up; up = _r - 1; return _r end)();
end
end
end

if (function () local _r = i; i = _r - 1; return _r end)() then end;
end
if _truthy(allowAboveRoot) then

while _truthy((function () local _r = up; up = _r - 1; return _r end)()) do

if parts:unshift(("..")) then end;

if up then end;
end
end
if true then return parts; end;
end);
isWindows = ((process).platform == ("win32"));
util = require(global, ("util"));
(util).isString = (function (this, str)
if true then return (_typeof(str) == ("string")); end;
end)


-- resolves . and .. elements in a path array with directory names there
-- must be no slashes, empty elements, or device names (c:\) in the array
-- (so also no leading and trailing slashes - it does not distinguish
-- relative and absolute paths)
;
if _truthy(isWindows) then
splitDeviceRe = _regexp("^([a-zA-Z]:|[\\\\\\/]{2}[^\\\\\\/]+[\\\\\\/]+[^\\\\\\/]+)?([\\\\\\/])?([\\s\\S]*?)$", "");
splitTailRe = _regexp("^([\\s\\S]*?)((?:\\.{1,2}|[^\\\\\\/]+?|)(\\.[^.\\/\\\\]*|))(?:[\\\\\\/]*)$", "");
splitPath = (function (this, filename)
local result, device, tail, result2, dir, basename, ext = result, device, tail, result2, dir, basename, ext;
result = splitDeviceRe:exec(filename);
device = (((result)[(1)] or ("")) + ((result)[(2)] or ("")));
tail = (result)[(3)] or ("");
result2 = splitTailRe:exec(tail);
dir = (result2)[(1)];
basename = (result2)[(2)];
ext = (result2)[(3)];
if true then return _arr({[0]=device, dir, basename, ext}); end;
end);
normalizeUNCRoot = (function (this, device)
if true then return (("\\\\") + device:replace(_regexp("^[\\\\\\/]+", ""), ("")):replace(_regexp("[\\\\\\/]+", "g"), ("\\"))); end;
end);
(exports).resolve = (function (this, ...)
local arguments = _arguments(...);
local resolvedDevice, resolvedTail, resolvedAbsolute, i, path, result, device, isUnc, isAbsolute, tail, f = resolvedDevice, resolvedTail, resolvedAbsolute, i, path, result, device, isUnc, isAbsolute, tail, f;
f = (function (this, p)
local f = _debug.getinfo(1, 'f').func;
if true then return (not _truthy((not _truthy(p)))); end;
end);
resolvedDevice = ("");
resolvedTail = ("");
resolvedAbsolute = (false);
i = ((arguments).length - (1));
while (i >= (-(1))) do
local _c = nil; repeat
path = nil;
if (i >= (0)) then
path = (arguments)[i];
else
if (not _truthy(resolvedDevice)) then
path = process:cwd();
else
path = ((process).env)[(("=") + resolvedDevice)];
if _truthy((not _truthy(path)) or (path:substr((0), (3)):toLowerCase() ~= (resolvedDevice:toLowerCase() + ("\\")))) then
path = (resolvedDevice + ("\\"));
end
end
end
if (not _truthy(util:isString(path))) then
_error(_new(TypeError, ("Arguments to path.resolve must be strings")))
else
if (not _truthy(path)) then
_c = _cont; break;
end
end
result = splitDeviceRe:exec(path);
device = (result)[(1)] or ("");
isUnc = device and (device:charAt((1)) ~= (":"));
isAbsolute = exports:isAbsolute(path);
tail = (result)[(3)];
if _truthy(device and resolvedDevice and (device:toLowerCase() ~= resolvedDevice:toLowerCase())) then
_c = _cont; break;
end
if (not _truthy(resolvedDevice)) then
resolvedDevice = device;
end
if (not _truthy(resolvedAbsolute)) then
resolvedTail = ((tail + ("\\")) + resolvedTail);
resolvedAbsolute = isAbsolute;
end
if _truthy(resolvedDevice and resolvedAbsolute) then
_c = _break; break;
end
until true;
if _c == _break then break end
if (function () local _r = i; i = _r - 1; return _r end)() then end;
end
if _truthy(isUnc) then
resolvedDevice = normalizeUNCRoot(global, resolvedDevice);
end
resolvedTail = normalizeArray(global, resolvedTail:split(_regexp("[\\\\\\/]+", "")):filter(f), (not _truthy(resolvedAbsolute))):join(("\\"));
if true then return ((resolvedDevice + ((_truthy(resolvedAbsolute) and {("\\")} or {("")})[1])) + resolvedTail) or ("."); end;
end);
(exports).normalize = (function (this, path)
local result, device, isUnc, isAbsolute, tail, trailingSlash = result, device, isUnc, isAbsolute, tail, trailingSlash;
result = splitDeviceRe:exec(path);
device = (result)[(1)] or ("");
isUnc = device and (device:charAt((1)) ~= (":"));
isAbsolute = exports:isAbsolute(path);
tail = (result)[(3)];
trailingSlash = _regexp("[\\\\\\/]$", ""):test(tail);
if _truthy(device and (device:charAt((1)) == (":"))) then
device = ((device)[(0)]:toLowerCase() + device:substr((1)));
end
tail = normalizeArray(global, tail:split(_regexp("[\\\\\\/]+", "")):filter((function (this, p)
if true then return (not _truthy((not _truthy(p)))); end;
end)), (not _truthy(isAbsolute))):join(("\\"));
if _truthy((not _truthy(tail)) and (not _truthy(isAbsolute))) then
tail = (".");
end
if _truthy(tail and trailingSlash) then
tail = tail + ("\\");
end
if _truthy(isUnc) then
device = normalizeUNCRoot(global, device);
end
if true then return ((device + ((_truthy(isAbsolute) and {("\\")} or {("")})[1])) + tail); end;
end);
(exports).isAbsolute = (function (this, path)
local result, device, isUnc = result, device, isUnc;
result = splitDeviceRe:exec(path);
device = (result)[(1)] or ("");
isUnc = device and (device:charAt((1)) ~= (":"));
if true then return (not _truthy((not _truthy((result)[(2)])))) or isUnc; end;
end);
(exports).join = (function (this, ...)
local arguments = _arguments(...);
local f, paths, joined = f, paths, joined;
f = (function (this, p)
local f = _debug.getinfo(1, 'f').func;
if (not _truthy(util:isString(p))) then
_error(_new(TypeError, ("Arguments to path.join must be strings")))
end
if true then return p; end;
end);
paths = ((Array).prototype).filter:call(arguments, f);
joined = paths:join(("\\"));
if (not _truthy(_regexp("^[\\\\\\/]{2}[^\\\\\\/]", ""):test(paths[(0)]))) then
joined = joined:replace(_regexp("^[\\\\\\/]{2,}", ""), ("\\"));
end
if true then return exports:normalize(joined); end;
end);
(exports).relative = (function (this, from, to)
local lowerFrom, lowerTo, trim, toParts, lowerFromParts, lowerToParts, length, samePartsLength, i, outputParts = lowerFrom, lowerTo, trim, toParts, lowerFromParts, lowerToParts, length, samePartsLength, i, outputParts;
trim = (function (this, arr)
local trim = _debug.getinfo(1, 'f').func;
local start, __K__end = start, __K__end;
start = (0);

while (start < (arr).length) do

if ((arr)[start] ~= ("")) then
_c = _break; break;
end

if (function () local _r = start; start = _r + 1; return _r end)() then end;
end
_K_end = ((arr).length - (1));

while (_K_end >= (0)) do

if ((arr)[_K_end] ~= ("")) then
_c = _break; break;
end

if (function () local _r = _K_end; _K_end = _r - 1; return _r end)() then end;
end
if (start > _K_end) then
if true then return _arr({}); end;
end
if true then return arr:slice(start, ((_K_end - start) + (1))); end;
end);
from = exports:resolve(from);
to = exports:resolve(to);
lowerFrom = from:toLowerCase();
lowerTo = to:toLowerCase();
toParts = trim(global, to:split(("\\")));
lowerFromParts = trim(global, lowerFrom:split(("\\")));
lowerToParts = trim(global, lowerTo:split(("\\")));
length = Math:min(lowerFromParts.length, lowerToParts.length);
samePartsLength = length;
i = (0);
while (i < length) do

if ((lowerFromParts)[i] ~= (lowerToParts)[i]) then
samePartsLength = i;
_c = _break; break;
end

if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
if _truthy((samePartsLength == (0))) then
if true then return to; end;
end
outputParts = _arr({});
i = samePartsLength;
while (i < (lowerFromParts).length) do

if outputParts:push(("..")) then end;

if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
outputParts = outputParts:concat(toParts:slice(samePartsLength));
if true then return outputParts:join(("\\")); end;
end);
(exports).sep = ("\\");
(exports).delimiter = (";");
else
splitPathRe = _regexp("^(\\/?|)([\\s\\S]*?)((?:\\.{1,2}|[^\\/]+?|)(\\.[^.\\/]*|))(?:[\\/]*)$", "");
splitPath = (function (this, filename)
if true then return splitPathRe:exec(filename):slice((1)); end;
end);
(exports).resolve = (function (this, ...)
local arguments = _arguments(...);
local resolvedPath, resolvedAbsolute, i, path = resolvedPath, resolvedAbsolute, i, path;
resolvedPath = ("");
resolvedAbsolute = (false);
i = ((arguments).length - (1));
while _truthy((i >= (-(1))) and (not _truthy(resolvedAbsolute))) do
local _c = nil; repeat
path = ((i >= (0)) and {(arguments)[i]} or {process:cwd()})[1];
if (not _truthy(util:isString(path))) then
_error(_new(TypeError, ("Arguments to path.resolve must be strings")))
else
if (not _truthy(path)) then
_c = _cont; break;
end
end
resolvedPath = ((path + ("/")) + resolvedPath);
resolvedAbsolute = (path:charAt((0)) == ("/"));
until true;
if _c == _break then break end
if (function () local _r = i; i = _r - 1; return _r end)() then end;
end
resolvedPath = normalizeArray(global, resolvedPath:split(("/")):filter((function (this, p)
if true then return (not _truthy((not _truthy(p)))); end;
end)), (not _truthy(resolvedAbsolute))):join(("/"));
if true then return (((_truthy(resolvedAbsolute) and {("/")} or {("")})[1]) + resolvedPath) or ("."); end;
end);
(exports).normalize = (function (this, path)
local isAbsolute, trailingSlash = isAbsolute, trailingSlash;
isAbsolute = exports:isAbsolute(path);
trailingSlash = (path:substr((-(1))) == ("/"));
path = normalizeArray(global, path:split(("/")):filter((function (this, p)
if true then return (not _truthy((not _truthy(p)))); end;
end)), (not _truthy(isAbsolute))):join(("/"));
if _truthy((not _truthy(path)) and (not _truthy(isAbsolute))) then
path = (".");
end
if _truthy(path and trailingSlash) then
path = path + ("/");
end
if true then return (((_truthy(isAbsolute) and {("/")} or {("")})[1]) + path); end;
end);
(exports).isAbsolute = (function (this, path)
if true then return (path:charAt((0)) == ("/")); end;
end);
(exports).join = (function (this, ...)
local arguments = _arguments(...);
local paths = paths;
paths = ((Array).prototype).slice:call(arguments, (0));
if true then return exports:normalize(paths:filter((function (this, p, index)
if (not _truthy(util:isString(p))) then
_error(_new(TypeError, ("Arguments to path.join must be strings")))
end
if true then return p; end;
end)):join(("/"))); end;
end);
(exports).relative = (function (this, from, to)
local trim, fromParts, toParts, length, samePartsLength, i, outputParts = trim, fromParts, toParts, length, samePartsLength, i, outputParts;
trim = (function (this, arr)
local trim = _debug.getinfo(1, 'f').func;
local start, __K__end = start, __K__end;
start = (0);

while (start < (arr).length) do

if ((arr)[start] ~= ("")) then
_c = _break; break;
end

if (function () local _r = start; start = _r + 1; return _r end)() then end;
end
_K_end = ((arr).length - (1));

while (_K_end >= (0)) do

if ((arr)[_K_end] ~= ("")) then
_c = _break; break;
end

if (function () local _r = _K_end; _K_end = _r - 1; return _r end)() then end;
end
if (start > _K_end) then
if true then return _arr({}); end;
end
if true then return arr:slice(start, ((_K_end - start) + (1))); end;
end);
from = exports:resolve(from):substr((1));
to = exports:resolve(to):substr((1));
fromParts = trim(global, from:split(("/")));
toParts = trim(global, to:split(("/")));
length = Math:min(fromParts.length, toParts.length);
samePartsLength = length;
i = (0);
while (i < length) do

if ((fromParts)[i] ~= (toParts)[i]) then
samePartsLength = i;
_c = _break; break;
end

if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
outputParts = _arr({});
i = samePartsLength;
while (i < (fromParts).length) do

if outputParts:push(("..")) then end;

if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
outputParts = outputParts:concat(toParts:slice(samePartsLength));
if true then return outputParts:join(("/")); end;
end);
(exports).sep = ("/");
(exports).delimiter = (":");
end
(exports).dirname = (function (this, path)
local result, root, dir = result, root, dir;
result = splitPath(global, path);
root = (result)[(0)];
dir = (result)[(1)];
if _truthy((not _truthy(root)) and (not _truthy(dir))) then
if true then return ("."); end;
end
if _truthy(dir) then
dir = dir:substr((0), ((dir).length - (1)));
end
if true then return (root + dir); end;
end);
(exports).basename = (function (this, path, ext)
local f = f;
f = (splitPath(global, path))[(2)];
if _truthy(ext and (f:substr(((-(1)) * (ext).length)) == ext)) then
f = f:substr((0), ((f).length - (ext).length));
end
if true then return f; end;
end);
(exports).extname = (function (this, path)
if console:log(path, ("extname"), splitPath(global, path))
   then end;
if true then return (splitPath(global, path))[(3)]; end;
end);
(exports).exists = util:deprecate((function (this, path, callback)
if require(global, ("fs")):exists(path, callback) then end;
end), ("path.exists is now called `fs.exists`."));
(exports).existsSync = util:deprecate((function (this, path)
if true then return require(global, ("fs")):existsSync(path); end;
end), ("path.existsSync is now called `fs.existsSync`."));
if _truthy(isWindows) then
(exports)._makeLong = (function (this, path)
local resolvedPath = resolvedPath;
if (not _truthy(util:isString(path))) then
if true then return path; end;
end
if (not _truthy(path)) then
if true then return (""); end;
end
resolvedPath = exports:resolve(path);
if _truthy(_regexp("^[a-zA-Z]\\:\\\\", ""):test(resolvedPath)) then
if true then return (("\\\\?\\") + resolvedPath); end;
else
if _truthy(_regexp("^\\\\\\\\[^?.]", ""):test(resolvedPath)) then
if true then return (("\\\\?\\UNC\\") + resolvedPath:substring((2))); end;
end
end
if true then return path; end;
end);
else
(exports)._makeLong = (function (this, path)
if true then return path; end;
end);
end

return _module.exports;
end