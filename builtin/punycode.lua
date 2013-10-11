function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;
if ((function (this, root)
local freeExports, freeModule, freeGlobal, punycode, maxInt, base, tMin, tMax, skew, damp, initialBias, initialN, delimiter, regexPunycode, regexNonASCII, regexSeparators, errors, baseMinusTMin, floor, stringFromCharCode, key, __K__error, map, mapDomain, ucs2decode, ucs2encode, basicToDigit, digitToBasic, adapt, decode, encode, toUnicode, toASCII = freeExports, freeModule, freeGlobal, punycode, maxInt, base, tMin, tMax, skew, damp, initialBias, initialN, delimiter, regexPunycode, regexNonASCII, regexSeparators, errors, baseMinusTMin, floor, stringFromCharCode, key, __K__error, map, mapDomain, ucs2decode, ucs2encode, basicToDigit, digitToBasic, adapt, decode, encode, toUnicode, toASCII;
_K_error = (function (this, type)
local _K_error = _debug.getinfo(1, 'f').func;
_error(RangeError(global, errors[type]))
end);
map = (function (this, array, fn)
local map = _debug.getinfo(1, 'f').func;
local length = length;
length = (array).length;
while _truthy((function () local _r = length; length = _r - 1; return _r end)()) do

(array)[length] = fn(global, array[length]);

end
if true then return array; end;
end);
mapDomain = (function (this, string, fn)
local mapDomain = _debug.getinfo(1, 'f').func;
if true then return map(global, string:split(regexSeparators), fn):join((".")); end;
end);
ucs2decode = (function (this, string)
local ucs2decode = _debug.getinfo(1, 'f').func;
local output, counter, length, value, extra = output, counter, length, value, extra;
output = _arr({});
counter = (0);
length = (string).length;
value = nil;
extra = nil;
while (counter < length) do

value = string:charCodeAt((function () local _r = counter; counter = _r + 1; return _r end)());
if _truthy((value >= (55296)) and (value <= (56319)) and (counter < length)) then
extra = string:charCodeAt((function () local _r = counter; counter = _r + 1; return _r end)());
if _truthy(((_bit.band(extra, (64512))) == (56320))) then
if output:push((((_bit.lshift(_bit.band(value, (1023)), (10))) + (_bit.band(extra, (1023)))) + (65536))) then end;
else
if output:push(value) then end;
(function () local _r = counter; counter = _r - 1; return _r end)();
end
else
if output:push(value) then end;
end

end
if true then return output; end;
end);
ucs2encode = (function (this, array)
local ucs2encode = _debug.getinfo(1, 'f').func;
if true then return map(global, array, (function (this, value)
local output = output;
output = ("");
if (value > (65535)) then
value = value - (65536);
output = output + stringFromCharCode(global, _bit.bor(_bit.band(_bit.rrotate(value, (10)), (1023)), (55296)));
value = _bit.bor((56320), _bit.band(value, (1023)));
end
output = output + stringFromCharCode(global, value);
if true then return output; end;
end)):join(("")); end;
end);
basicToDigit = (function (this, codePoint)
local basicToDigit = _debug.getinfo(1, 'f').func;
if ((codePoint - (48)) < (10)) then
if true then return (codePoint - (22)); end;
end
if ((codePoint - (65)) < (26)) then
if true then return (codePoint - (65)); end;
end
if ((codePoint - (97)) < (26)) then
if true then return (codePoint - (97)); end;
end
if true then return base; end;
end);
digitToBasic = (function (this, digit, flag)
local digitToBasic = _debug.getinfo(1, 'f').func;
if true then return (((digit + (22)) + ((75) * ((digit < (26))))) - (_bit.lshift((flag ~= (0)), (5)))); end;
end);
adapt = (function (this, delta, numPoints, firstTime)
local adapt = _debug.getinfo(1, 'f').func;
local k = k;
k = (0);
delta = (_truthy(firstTime) and {floor(global, (delta / damp))} or {_bit.rshift(delta, (1))})[1];
delta = delta + floor(global, (delta / numPoints));

while (delta > _bit.rshift((baseMinusTMin * tMax), (1))) do

delta = floor(global, (delta / baseMinusTMin));

if (function () local _r = k + base; k = _r; return _r; end)() then end;
end
if true then return floor(global, (k + ((((baseMinusTMin + (1))) * delta) / ((delta + skew))))); end;
end);
decode = (function (this, input)
local decode = _debug.getinfo(1, 'f').func;
local output, inputLength, out, i, n, bias, basic, j, index, oldi, w, k, digit, t, baseMinusT = output, inputLength, out, i, n, bias, basic, j, index, oldi, w, k, digit, t, baseMinusT;
output = _arr({});
inputLength = (input).length;
out = nil;
i = (0);
n = initialN;
bias = initialBias;
basic = nil;
j = nil;
index = nil;
oldi = nil;
w = nil;
k = nil;
digit = nil;
t = nil;
baseMinusT = nil;
basic = input:lastIndexOf(delimiter);
if (basic < (0)) then
basic = (0);
end
(function () local _r = (0); j = _r; return _r; end)()
while (j < basic) do

if (input:charCodeAt(j) >= (128)) then
if _K_error(global, ("not-basic")) then end;
end
if output:push(input:charCodeAt(j)) then end;

if (function () j = j + 1; return j; end)() then end;
end
(function () local _r = ((basic > (0)) and {(basic + (1))} or {(0)})[1]; index = _r; return _r; end)()
while (index < inputLength) do

_seq({(function () local _r = i; oldi = _r; return _r; end)(), (function () local _r = (1); w = _r; return _r; end)(), (function () local _r = base; k = _r; return _r; end)()})
while true do

if (index >= inputLength) then
if _K_error(global, ("invalid-input")) then end;
end
digit = basicToDigit(global, input:charCodeAt((function () local _r = index; index = _r + 1; return _r end)()));
if _truthy((digit >= base) or (digit > floor(global, (((maxInt - i)) / w)))) then
if _K_error(global, ("overflow")) then end;
end
i = i + (digit * w);
t = ((k <= bias) and {tMin} or {((k >= (bias + tMax)) and {tMax} or {(k - bias)})[1]})[1];
if (digit < t) then
_c = _break; break;
end
baseMinusT = (base - t);
if (w > floor(global, (maxInt / baseMinusT))) then
if _K_error(global, ("overflow")) then end;
end
w = w * baseMinusT;

if (function () local _r = k + base; k = _r; return _r; end)() then end;
end
out = ((output).length + (1));
bias = adapt(global, (i - oldi), out, (oldi == (0)));
if (floor(global, (i / out)) > (maxInt - n)) then
if _K_error(global, ("overflow")) then end;
end
n = n + floor(global, (i / out));
i = i % out;
if output:splice((function () local _r = i; i = _r + 1; return _r end)(), (0), n) then end;


end
if true then return ucs2encode(global, output); end;
end);
encode = (function (this, input)
local encode = _debug.getinfo(1, 'f').func;
local n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output, inputLength, handledCPCountPlusOne, baseMinusT, qMinusT = n, delta, handledCPCount, basicLength, bias, j, m, q, k, t, currentValue, output, inputLength, handledCPCountPlusOne, baseMinusT, qMinusT;
n = nil;
delta = nil;
handledCPCount = nil;
basicLength = nil;
bias = nil;
j = nil;
m = nil;
q = nil;
k = nil;
t = nil;
currentValue = nil;
output = _arr({});
inputLength = nil;
handledCPCountPlusOne = nil;
baseMinusT = nil;
qMinusT = nil;
input = ucs2decode(global, input);
inputLength = (input).length;
n = initialN;
delta = (0);
bias = initialBias;
(function () local _r = (0); j = _r; return _r; end)()
while (j < inputLength) do

currentValue = (input)[j];
if (currentValue < (128)) then
if output:push(stringFromCharCode(global, currentValue)) then end;
end

if (function () j = j + 1; return j; end)() then end;
end
handledCPCount = (function () local _r = (output).length; basicLength = _r; return _r; end)();
if _truthy(basicLength) then
if output:push(delimiter) then end;
end
while (handledCPCount < inputLength) do

_seq({(function () local _r = maxInt; m = _r; return _r; end)(), (function () local _r = (0); j = _r; return _r; end)()})
while (j < inputLength) do

currentValue = (input)[j];
if _truthy((currentValue >= n) and (currentValue < m)) then
m = currentValue;
end

if (function () j = j + 1; return j; end)() then end;
end
handledCPCountPlusOne = (handledCPCount + (1));
if ((m - n) > floor(global, (((maxInt - delta)) / handledCPCountPlusOne))) then
if _K_error(global, ("overflow")) then end;
end
delta = delta + (((m - n)) * handledCPCountPlusOne);
n = m;
(function () local _r = (0); j = _r; return _r; end)()
while (j < inputLength) do

currentValue = (input)[j];
if _truthy((currentValue < n) and ((function () delta = delta + 1; return delta; end)() > maxInt)) then
if _K_error(global, ("overflow")) then end;
end
if _truthy((currentValue == n)) then
_seq({(function () local _r = delta; q = _r; return _r; end)(), (function () local _r = base; k = _r; return _r; end)()})
while true do

t = ((k <= bias) and {tMin} or {((k >= (bias + tMax)) and {tMax} or {(k - bias)})[1]})[1];
if (q < t) then
_c = _break; break;
end
qMinusT = (q - t);
baseMinusT = (base - t);
if output:push(stringFromCharCode(global, digitToBasic(global, (t + (qMinusT % baseMinusT)), (0)))) then end;
q = floor(global, (qMinusT / baseMinusT));

if (function () local _r = k + base; k = _r; return _r; end)() then end;
end
if output:push(stringFromCharCode(global, digitToBasic(global, q, (0)))) then end;
bias = adapt(global, delta, handledCPCountPlusOne, (handledCPCount == basicLength));
delta = (0);
(function () handledCPCount = handledCPCount + 1; return handledCPCount; end)();
end

if (function () j = j + 1; return j; end)() then end;
end
(function () delta = delta + 1; return delta; end)();
(function () n = n + 1; return n; end)();

end
if true then return output:join(("")); end;
end);
toUnicode = (function (this, domain)
local toUnicode = _debug.getinfo(1, 'f').func;
if true then return mapDomain(global, domain, (function (this, string)
if true then return (_truthy(regexPunycode:test(string)) and {decode(global, string:slice((4)):toLowerCase())} or {string})[1]; end;
end)); end;
end);
toASCII = (function (this, domain)
local toASCII = _debug.getinfo(1, 'f').func;
if true then return mapDomain(global, domain, (function (this, string)
if true then return (_truthy(regexNonASCII:test(string)) and {(("xn--") + encode(global, string))} or {string})[1]; end;
end)); end;
end);
freeExports = (_typeof(exports) == ("object")) and exports;
freeModule = (_typeof(module) == ("object")) and module and ((module).exports == freeExports) and module;
freeGlobal = (_typeof(global) == ("object")) and global;
if _truthy(((freeGlobal).global == freeGlobal) or ((freeGlobal).window == freeGlobal)) then
root = freeGlobal;
end
punycode = nil;
maxInt = (2147483647);
base = (36);
tMin = (1);
tMax = (26);
skew = (38);
damp = (700);
initialBias = (72);
initialN = (128);
delimiter = ("-");
regexPunycode = _regexp("^xn--", "");
regexNonASCII = _regexp("[^ -~]", "");
regexSeparators = _regexp("\\x2E|\\u3002|\\uFF0E|\\uFF61", "g");
errors = _obj({
  ["overflow"]=("Overflow: input needs wider integers to process"),
  ["not-basic"]=("Illegal input >= 0x80 (not a basic code point)"),
  ["invalid-input"]=("Invalid input")});
baseMinusTMin = (base - tMin);
floor = (Math).floor;
stringFromCharCode = (String).fromCharCode;
key = nil;
punycode = _obj({
  ["version"]=("1.2.3"),
  ["ucs2"]=_obj({
  ["decode"]=ucs2decode,
  ["encode"]=ucs2encode}),
  ["decode"]=decode,
  ["encode"]=encode,
  ["toASCII"]=toASCII,
  ["toUnicode"]=toUnicode});
if _truthy((_typeof(define) == ("function")) and (_typeof((define).amd) == ("object")) and (define).amd) then
if define(global, (function (this)
if true then return punycode; end;
end)) then end;
else
if _truthy(freeExports and (not ((freeExports).nodeType))) then
if _truthy(freeModule) then
(freeModule).exports = punycode;
else
for key in _pairs(punycode) do
if punycode:hasOwnProperty(key) and (function () local _r = (punycode)[key]; (freeExports)[key] = _r; return _r; end)() then end;
end
end
else
(root).punycode = punycode;
end
end
end)(global, this)) then end;

return _module.exports;
end