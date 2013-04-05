local _JS = require('colony-js');
local string, math = nil, nil;
local this, Object, Array, String, Math, require, console = _JS.this, _JS.Object, _JS.Array, _JS.String, _JS.Math, _JS.require, _JS.console;
local _exports = {}; local exports = _exports;

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

return _exports;

-- for (var i = 0; i < 5; i++) {
-- 	if (i % 2) continue;
-- 	console.log('Even i: ' + i)
-- }

-- var i = 0
-- candy: while (i < 7) {
-- 	i++
-- 	try {
-- 		if (i == 3) continue candy;
-- 		console.log("i="+i)
-- 		if (i == 5) throw "Some error when i == 5"
-- 	} catch (e) {
-- 		console.log("Error: " + e)
-- 	}
-- 	console.log("Incrementing...")
-- }

