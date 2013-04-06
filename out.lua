local _JS = require('colony-js');
local string, math, print = nil, nil, nil;
local this, global, Object, Array, String, Math, require, console = _JS.this, _JS.global, _JS.Object, _JS.Array, _JS.String, _JS.Math, _JS.require, _JS.console;
local _module = {exports={}}; local exports = _module.exports;

local i, j;
i = (0);
while (i < (5)) do
local _capples = nil; repeat
console:log((("Level ") + i))
	;
(function () local _r = i; i = _r + 1; return _r end)()
	;
j = (0);
while (j < (5)) do
local _cpears = nil; repeat
console:log((("J: ") + j))
		;
if _JS._truthy((i == (3))) then
_capples = _JS._cont; break;
end
(function () local _r = j; j = _r + 1; return _r end)()
	;
until true;
if _cpears == _JS._break or _capples then break end
end
until true;
if _capples == _JS._break then break end
end
i = (0);
while (i < (5)) do
local _c = nil; repeat
if _JS._truthy((i % (2))) then
_c = _JS._cont; break;
end
console:log((("Even i: ") + i))
;
until true;
if _c == _JS._break then break end
(function () local _r = i; i = _r + 1; return _r end)()
end
i = (0);
while (i < (7)) do
local _ccandy = nil; repeat
(function () local _r = i; i = _r + 1; return _r end)()
	;
local _e = nil
local _s, _r = xpcall(function ()
if _JS._truthy((i == (3))) then
_ccandy = _JS._cont; return _JS._cont;
end
console:log((("i=")+i))
		;
if _JS._truthy((i == (5))) then
error(("Some error when i == 5"))
end
    end, function (err)
        _e = err
    end)
if _s == false then
e = _e;
console:log((("Error: ") + e))
	;
end

if _r == _JS._break then
break;
elseif _r == _JS._cont then
break;
end
console:log(("Incrementing..."))
;
until true;
if _ccandy == _JS._break then break end
end

return _module.exports;

