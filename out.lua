-- The Great Computer Language Shootout
-- http:--shootout.alioth.debian.org/
--
-- contributed by Ian Osgood

local _JS = require('colony-js');
local string, math, print = nil, nil, nil;
local this, global, Object, Array, String, Math, require, console = _JS.this, _JS.global, _JS.Object, _JS.Array, _JS.String, _JS.Math, _JS.require, _JS.console;
local _module = {exports={}}; local exports = _module.exports;

local A, Au, Atu, AtAu, spectralnorm;
A = _JS._func(function (this, i, j)
if true then return ((1)/(((((((i+j))*(((i+j)+(1))))/(2))+i)+(1)))); end;
end);
Au = _JS._func(function (this, u, v)
local i, t, j;
i = (0);
while (i<u.length) do

t = (0);
j = (0);
while (j<u.length) do

t = t + (A(global, i, j) * u[j]);

(function () j = j + 1; return j; end)()
end
v[i] = t;

(function () i = i + 1; return i; end)()
end
end);
Atu = _JS._func(function (this, u, v)
local i, t, j;
i = (0);
while (i<u.length) do

t = (0);
j = (0);
while (j<u.length) do

t = t + (A(global, j, i) * u[j]);

(function () j = j + 1; return j; end)()
end
v[i] = t;

(function () i = i + 1; return i; end)()
end
end);
AtAu = _JS._func(function (this, u, v, w)
Au(global, u, w);
Atu(global, w, v);
end);
spectralnorm = _JS._func(function (this, n)
local i, u, v, w, vv, vBv;
i, u, v, w, vv, vBv = nil, _JS._arr({}), _JS._arr({}), _JS._arr({}), (0), (0);
(function () local _r = (0); i = _r; return _r; end)()
while (i<n) do

u[i] = (1);
v[i] = (function () local _r = (0); w[i] = _r; return _r; end)();

(function () i = i + 1; return i; end)()
end
(function () local _r = (0); i = _r; return _r; end)()
while (i<(10)) do

AtAu(global, u, v, w);
AtAu(global, v, u, w);

(function () i = i + 1; return i; end)()
end
(function () local _r = (0); i = _r; return _r; end)()
while (i<n) do

vBv = vBv + (u[i]*v[i]);
vv = vv + (v[i]*v[i]);

(function () i = i + 1; return i; end)()
end
if true then return Math:sqrt((vBv/vv)); end;
end);
console:log(spectralnorm(global, (500)):toFixed((9)));

return _module.exports;

