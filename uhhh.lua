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

local punycode, util, Url, protocolPattern, portPattern, delims, unwise, autoEscape, nonHostChars, hostEndingChars, hostnameMaxLen, hostnamePartPattern, hostnamePartStart, unsafeProtocol, hostlessProtocol, slashedProtocol, querystring, urlParse, urlFormat, urlResolve, urlResolveObject = punycode, util, Url, protocolPattern, portPattern, delims, unwise, autoEscape, nonHostChars, hostEndingChars, hostnameMaxLen, hostnamePartPattern, hostnamePartStart, unsafeProtocol, hostlessProtocol, slashedProtocol, querystring, urlParse, urlFormat, urlResolve, urlResolveObject;
Url = (function (this)
local Url = _debug.getinfo(1, 'f').func;
(this).protocol = (null);
(this).slashes = (null);
(this).auth = (null);
(this).host = (null);
(this).port = (null);
(this).hostname = (null);
(this).hash = (null);
(this).search = (null);
(this).query = (null);
(this).pathname = (null);
(this).path = (null);
(this).href = (null);
end);
urlParse = (function (this, url, parseQueryString, slashesDenoteHost)
local urlParse = _debug.getinfo(1, 'f').func;
local u = u;
if _truthy(url and util:isObject(url) and _instanceof(url, Url)) then
if true then return url; end;
end
u = _new(Url);
if u:parse(url, parseQueryString, slashesDenoteHost) then end;
if true then return u; end;
end);
urlFormat = (function (this, obj)
local urlFormat = _debug.getinfo(1, 'f').func;
if _truthy(util:isString(obj)) then
obj = urlParse(global, obj);
end
if (not (_instanceof(obj, Url))) then
if true then return ((Url).prototype).format:call(obj); end;
end
if true then return obj:format(); end;
end);
urlResolve = (function (this, source, relative)
local urlResolve = _debug.getinfo(1, 'f').func;
if true then return urlParse(global, source, (false), (true)):resolve(relative); end;
end);
urlResolveObject = (function (this, source, relative)
local urlResolveObject = _debug.getinfo(1, 'f').func;
if (not (source)) then
if true then return relative; end;
end
if true then return urlParse(global, source, (false), (true)):resolveObject(relative); end;
end);
punycode = require(global, ("punycode"));
util = require(global, ("util"));
(exports).parse = urlParse;
(exports).resolve = urlResolve;
(exports).resolveObject = urlResolveObject;
(exports).format = urlFormat;
(exports).Url = Url;
protocolPattern = _regexp("^([a-z0-9.+-]+:)", "i");
portPattern = _regexp(":[0-9]*$", "");
delims = _arr({[0]=("<"), (">"), ("\""), ("`"), (" "), ("\r"), ("\n"), ("\t")});
unwise = _arr({[0]=("{"), ("}"), ("|"), ("\\"), ("^"), ("`")}):concat(delims);
autoEscape = _arr({[0]=("'")}):concat(unwise);
nonHostChars = _arr({[0]=("%"), ("/"), ("?"), (";"), ("#")}):concat(autoEscape);
hostEndingChars = _arr({[0]=("/"), ("?"), ("#")});
hostnameMaxLen = (255);
hostnamePartPattern = _regexp("^[a-z0-9A-Z_-]{0,63}$", "");
hostnamePartStart = _regexp("^([a-z0-9A-Z_-]{0,63})(.*)$", "");
unsafeProtocol = _obj({
  ["javascript"]=true,
  ["javascript:"]=true});
hostlessProtocol = _obj({
  ["javascript"]=true,
  ["javascript:"]=true});
slashedProtocol = _obj({
  ["http"]=true,
  ["https"]=true,
  ["ftp"]=true,
  ["gopher"]=true,
  ["file"]=true,
  ["http:"]=true,
  ["https:"]=true,
  ["ftp:"]=true,
  ["gopher:"]=true,
  ["file:"]=true});
querystring = require(global, ("querystring"));
((Url).prototype).parse = (function (this, url, parseQueryString, slashesDenoteHost)
local rest, proto, lowerProto, slashes, hostEnd, i, hec, auth, atSign, ipv6Hostname, hostparts, l, part, newpart, j, k, validParts, notHost, bit, domainArray, newOut, s, p, h, ae, esc, hash, qm = rest, proto, lowerProto, slashes, hostEnd, i, hec, auth, atSign, ipv6Hostname, hostparts, l, part, newpart, j, k, validParts, notHost, bit, domainArray, newOut, s, p, h, ae, esc, hash, qm;
if (not (util:isString(url))) then
_error(_new(TypeError, (("Parameter 'url' must be a string, not ") + _typeof(url))))
end
rest = url;
rest = rest:trim();
proto = protocolPattern:exec(rest);
if _truthy(proto) then
proto = (proto)[(0)];
lowerProto = proto:toLowerCase();
(this).protocol = lowerProto;
rest = rest:substr(proto.length);
end
if _truthy(slashesDenoteHost or proto or rest:match(_regexp("^\\/\\/[^@\\/]+@[^@\\/]+", ""))) then
slashes = (rest:substr((0), (2)) == ("--"));
if _truthy(slashes and (not (proto and (hostlessProtocol)[proto]))) then
rest = rest:substr((2));
(this).slashes = (true);
end
end
if _truthy((not ((hostlessProtocol)[proto])) and slashes or proto and (not ((slashedProtocol)[proto]))) then
hostEnd = (-(1));
i = (0);
while (i < (hostEndingChars).length) do

hec = rest:indexOf(hostEndingChars[i]);
if _truthy((hec ~= (-(1))) and (hostEnd == (-(1))) or (hec < hostEnd)) then
hostEnd = hec;
end

if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
auth = nil;
atSign = nil;
if (hostEnd == (-(1))) then
atSign = rest:lastIndexOf(("@"));
else
atSign = rest:lastIndexOf(("@"), hostEnd);
end
if (atSign ~= (-(1))) then
auth = rest:slice((0), atSign);
rest = rest:slice((atSign + (1)));
(this).auth = decodeURIComponent(global, auth);
end
hostEnd = (-(1));
i = (0);
while (i < (nonHostChars).length) do

hec = rest:indexOf(nonHostChars[i]);
if _truthy((hec ~= (-(1))) and (hostEnd == (-(1))) or (hec < hostEnd)) then
hostEnd = hec;
end

if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
if (hostEnd == (-(1))) then
hostEnd = (rest).length;
end
(this).host = rest:slice((0), hostEnd);
rest = rest:slice(hostEnd);
if this:parseHost() then end;
(this).hostname = (this).hostname or ("");
ipv6Hostname = (((this).hostname)[(0)] == ("[")) and (((this).hostname)[(((this).hostname).length - (1))] == ("]"));
if (not (ipv6Hostname)) then
hostparts = (this).hostname:split(_regexp("\\.", ""));
i = (0);
l = (hostparts).length;
while (i < l) do
local _c = nil; repeat
part = (hostparts)[i];
if (not (part)) then
_c = _cont; break;
end
if (not (part:match(hostnamePartPattern))) then
newpart = ("");
j = (0);
k = (part).length;
while (j < k) do

if (part:charCodeAt(j) > (127)) then
newpart = newpart + ("x");
else
newpart = newpart + (part)[j];
end

if (function () local _r = j; j = _r + 1; return _r end)() then end;
end
if (not (newpart:match(hostnamePartPattern))) then
validParts = hostparts:slice((0), i);
notHost = hostparts:slice((i + (1)));
bit = part:match(hostnamePartStart);
if _truthy(bit) then
if validParts:push(bit[(1)]) then end;
if notHost:unshift(bit[(2)]) then end;
end
if _truthy((notHost).length) then
rest = ((("/") + notHost:join(("."))) + rest);
end
(this).hostname = validParts:join(("."));
_c = _break; break;
end
end
until true;
if _c == _break then break end
if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
end
if (((this).hostname).length > hostnameMaxLen) then
(this).hostname = ("");
else
(this).hostname = (this).hostname:toLowerCase();
end
if (not (ipv6Hostname)) then
domainArray = (this).hostname:split(("."));
newOut = _arr({});
i = (0);
while (i < (domainArray).length) do

s = (domainArray)[i];
if newOut:push((_truthy(s:match(_regexp("[^A-Za-z0-9_-]", ""))) and {(("xn--") + punycode:encode(s))} or {s})[1]) then end;

if (function () i = i + 1; return i; end)() then end;
end
(this).hostname = newOut:join(("."));
end
p = (_truthy((this).port) and {((":") + (this).port)} or {("")})[1];
h = (this).hostname or ("");
(this).host = (h + p);
(this).href = (this).href + (this).host;
if _truthy(ipv6Hostname) then
(this).hostname = (this).hostname:substr((1), (((this).hostname).length - (2)));
if ((rest)[(0)] ~= ("/")) then
rest = (("/") + rest);
end
end
end
if (not ((unsafeProtocol)[lowerProto])) then
i = (0);
l = (autoEscape).length;
while (i < l) do

ae = (autoEscape)[i];
esc = encodeURIComponent(global, ae);
if (esc == ae) then
esc = escape(global, ae);
end
rest = rest:split(ae):join(esc);

if (function () local _r = i; i = _r + 1; return _r end)() then end;
end
end
hash = rest:indexOf(("#"));
if (hash ~= (-(1))) then
(this).hash = rest:substr(hash);
rest = rest:slice((0), hash);
end
qm = rest:indexOf(("?"));
if (qm ~= (-(1))) then
(this).search = rest:substr(qm);
(this).query = rest:substr((qm + (1)));
if _truthy(parseQueryString) then
(this).query = querystring:parse(this.query);
end
rest = rest:slice((0), qm);
else
if _truthy(parseQueryString) then
(this).search = ("");
(this).query = _obj({
  });
end
end
if _truthy(rest) then
(this).pathname = rest;
end
if _truthy((slashedProtocol)[lowerProto] and (this).hostname and (not ((this).pathname))) then
(this).pathname = ("/");
end
if _truthy((this).pathname or (this).search) then
p = (this).pathname or ("");
s = (this).search or ("");
(this).path = (p + s);
end
(this).href = this:format();
if true then return this; end;
end);
((Url).prototype).format = (function (this)
local auth, protocol, pathname, hash, host, query, search = auth, protocol, pathname, hash, host, query, search;
auth = (this).auth or ("");
if _truthy(auth) then
auth = encodeURIComponent(global, auth);
auth = auth:replace(_regexp("%3A", "i"), (":"));
auth = auth + ("@");
end
protocol = (this).protocol or ("");
pathname = (this).pathname or ("");
hash = (this).hash or ("");
host = (false);
query = ("");
if _truthy((this).host) then
host = (auth + (this).host);
else
if _truthy((this).hostname) then
host = (auth + ((((this).hostname:indexOf((":")) == (-(1))) and {(this).hostname} or {((("[") + (this).hostname) + ("]"))})[1]));
if _truthy((this).port) then
host = host + ((":") + (this).port);
end
end
end
if _truthy((this).query and util:isObject(this.query) and (Object:keys(this.query)).length) then
query = querystring:stringify(this.query);
end
search = (this).search or query and (("?") + query) or ("");
if _truthy(protocol and (protocol:substr((-(1))) ~= (":"))) then
protocol = protocol + (":");
end
if _truthy((this).slashes or (not (protocol)) or (slashedProtocol)[protocol] and (host ~= (false))) then
host = (("--") + (host or ("")));
if _truthy(pathname and (pathname:charAt((0)) ~= ("/"))) then
pathname = (("/") + pathname);
end
else
if (not (host)) then
host = ("");
end
end
if _truthy(hash and (hash:charAt((0)) ~= ("#"))) then
hash = (("#") + hash);
end
if _truthy(search and (search:charAt((0)) ~= ("?"))) then
search = (("?") + search);
end
pathname = pathname:replace(_regexp("[?#]", "g"), (function (this, match)
if true then return encodeURIComponent(global, match); end;
end));
search = search:replace(("#"), ("%23"));
if true then return ((((protocol + host) + pathname) + search) + hash); end;
end);
((Url).prototype).resolve = (function (this, relative)
if true then return this:resolveObject(urlParse(global, relative, (false), (true))):format(); end;
end);
((Url).prototype).resolveObject = (function (this, relative)
local rel, result, relPath, p, s, isSourceAbs, isRelAbs, mustEndAbs, removeAllDots, srcPath, psychotic, authInHost, last, hasTrailingSlash, up, i, isAbsolute = rel, result, relPath, p, s, isSourceAbs, isRelAbs, mustEndAbs, removeAllDots, srcPath, psychotic, authInHost, last, hasTrailingSlash, up, i, isAbsolute;
if _truthy(util:isString(relative)) then
rel = _new(Url);
if rel:parse(relative, (false), (true)) then end;
relative = rel;
end
result = _new(Url);
if Object:keys(this):forEach((function (this, k)
(result)[k] = (this)[k];
end), this) then end;
(result).hash = (relative).hash;
if ((relative).href == ("")) then
(result).href = result:format();
if true then return result; end;
end
if _truthy((relative).slashes and (not ((relative).protocol))) then
if Object:keys(relative):forEach((function (this, k)
if (k ~= ("protocol")) then
(result)[k] = (relative)[k];
end
end)) then end;
if _truthy((slashedProtocol)[(result).protocol] and (result).hostname and (not ((result).pathname))) then
(result).path = (function () local _r = ("/"); (result).pathname = _r; return _r; end)();
end
(result).href = result:format();
if true then return result; end;
end
if _truthy((relative).protocol and ((relative).protocol ~= (result).protocol)) then
if (not ((slashedProtocol)[(relative).protocol])) then
if Object:keys(relative):forEach((function (this, k)
(result)[k] = (relative)[k];
end)) then end;
(result).href = result:format();
if true then return result; end;
end
(result).protocol = (relative).protocol;
if _truthy((not ((relative).host)) and (not ((hostlessProtocol)[(relative).protocol]))) then
relPath = (relative).pathname or (""):split(("/"));
while _truthy((relPath).length and (not ((function () local _r = relPath:shift(); (relative).host = _r; return _r; end)()))) do

end
if (not ((relative).host)) then
(relative).host = ("");
end
if (not ((relative).hostname)) then
(relative).hostname = ("");
end
if ((relPath)[(0)] ~= ("")) then
if relPath:unshift(("")) then end;
end
if ((relPath).length < (2)) then
if relPath:unshift(("")) then end;
end
(result).pathname = relPath:join(("/"));
else
(result).pathname = (relative).pathname;
end
(result).search = (relative).search;
(result).query = (relative).query;
(result).host = (relative).host or ("");
(result).auth = (relative).auth;
(result).hostname = (relative).hostname or (relative).host;
(result).port = (relative).port;
if _truthy((result).pathname or (result).search) then
p = (result).pathname or ("");
s = (result).search or ("");
(result).path = (p + s);
end
(result).slashes = (result).slashes or (relative).slashes;
(result).href = result:format();
if true then return result; end;
end
isSourceAbs = (result).pathname and ((result).pathname:charAt((0)) == ("/"));
isRelAbs = (relative).host or (relative).pathname and ((relative).pathname:charAt((0)) == ("/"));
mustEndAbs = isRelAbs or isSourceAbs or (result).host and (relative).pathname;
removeAllDots = mustEndAbs;
srcPath = (result).pathname and (result).pathname:split(("/")) or _arr({});
relPath = (relative).pathname and (relative).pathname:split(("/")) or _arr({});
psychotic = (result).protocol and (not ((slashedProtocol)[(result).protocol]));
if _truthy(psychotic) then
(result).hostname = ("");
(result).port = (null);
if _truthy((result).host) then
if ((srcPath)[(0)] == ("")) then
(srcPath)[(0)] = (result).host;
else
if srcPath:unshift(result.host) then end;
end
end
(result).host = ("");
if _truthy((relative).protocol) then
(relative).hostname = (null);
(relative).port = (null);
if _truthy((relative).host) then
if ((relPath)[(0)] == ("")) then
(relPath)[(0)] = (relative).host;
else
if relPath:unshift(relative.host) then end;
end
end
(relative).host = (null);
end
mustEndAbs = mustEndAbs and ((relPath)[(0)] == ("")) or ((srcPath)[(0)] == (""));
end
if _truthy(isRelAbs) then
(result).host = (_truthy((relative).host or ((relative).host == (""))) and {(relative).host} or {(result).host})[1];
(result).hostname = (_truthy((relative).hostname or ((relative).hostname == (""))) and {(relative).hostname} or {(result).hostname})[1];
(result).search = (relative).search;
(result).query = (relative).query;
srcPath = relPath;
else
if _truthy((relPath).length) then
if (not (srcPath)) then
srcPath = _arr({});
end
if srcPath:pop() then end;
srcPath = srcPath:concat(relPath);
(result).search = (relative).search;
(result).query = (relative).query;
else
if (not (util:isNullOrUndefined(relative.search))) then
if _truthy(psychotic) then
(result).hostname = (function () local _r = srcPath:shift(); (result).host = _r; return _r; end)();
authInHost = (_truthy((result).host and ((result).host:indexOf(("@")) > (0))) and {(result).host:split(("@"))} or {(false)})[1];
if _truthy(authInHost) then
(result).auth = authInHost:shift();
(result).host = (function () local _r = authInHost:shift(); (result).hostname = _r; return _r; end)();
end
end
(result).search = (relative).search;
(result).query = (relative).query;
if _truthy((not (util:isNull(result.pathname))) or (not (util:isNull(result.search)))) then
(result).path = (((_truthy((result).pathname) and {(result).pathname} or {("")})[1]) +
                    ((_truthy((result).search) and {(result).search} or {("")})[1]));
end
(result).href = result:format();
if true then return result; end;
end
end
end
if (not ((srcPath).length)) then
(result).pathname = (null);
if _truthy((result).search) then
(result).path = (("/") + (result).search);
else
(result).path = (null);
end
(result).href = result:format();
if true then return result; end;
end
last = (srcPath:slice((-(1))))[(0)];
hasTrailingSlash = (result).host or (relative).host and (last == (".")) or (last == ("..")) or (last == (""));
up = (0);
i = (srcPath).length;
while (i >= (0)) do

last = (srcPath)[i];
if _truthy((last == ("."))) then
if srcPath:splice(i, (1)) then end;
else
if (last == ("..")) then
if srcPath:splice(i, (1)) then end;
(function () local _r = up; up = _r + 1; return _r end)();
else
if _truthy(up) then
if srcPath:splice(i, (1)) then end;
(function () local _r = up; up = _r - 1; return _r end)();
end
end
end

if (function () local _r = i; i = _r - 1; return _r end)() then end;
end
if _truthy((not (mustEndAbs)) and (not (removeAllDots))) then

while _truthy((function () local _r = up; up = _r - 1; return _r end)()) do

if srcPath:unshift(("..")) then end;

if up then end;
end
end
if _truthy(mustEndAbs and ((srcPath)[(0)] ~= ("")) and (not ((srcPath)[(0)])) or ((srcPath)[(0)]:charAt((0)) ~= ("/"))) then
if srcPath:unshift(("")) then end;
end
if _truthy(hasTrailingSlash and (srcPath:join(("/")):substr((-(1))) ~= ("/"))) then
if srcPath:push(("")) then end;
end
isAbsolute = ((srcPath)[(0)] == ("")) or (srcPath)[(0)] and ((srcPath)[(0)]:charAt((0)) == ("/"));
if _truthy(psychotic) then
(result).hostname = (function () local _r = (_truthy(isAbsolute) and {("")} or {(_truthy((srcPath).length) and {srcPath:shift()} or {("")})[1]})[1]; (result).host = _r; return _r; end)();
authInHost = (_truthy((result).host and ((result).host:indexOf(("@")) > (0))) and {(result).host:split(("@"))} or {(false)})[1];
if _truthy(authInHost) then
(result).auth = authInHost:shift();
(result).host = (function () local _r = authInHost:shift(); (result).hostname = _r; return _r; end)();
end
end
mustEndAbs = mustEndAbs or (result).host and (srcPath).length;
if _truthy(mustEndAbs and (not (isAbsolute))) then
if srcPath:unshift(("")) then end;
end
if (not ((srcPath).length)) then
(result).pathname = (null);
(result).path = (null);
else
(result).pathname = srcPath:join(("/"));
end
if _truthy((not (util:isNull(result.pathname))) or (not (util:isNull(result.search)))) then
(result).path = (((_truthy((result).pathname) and {(result).pathname} or {("")})[1]) +
                  ((_truthy((result).search) and {(result).search} or {("")})[1]));
end
(result).auth = (relative).auth or (result).auth;
(result).slashes = (result).slashes or (relative).slashes;
(result).href = result:format();
if true then return result; end;
end);
((Url).prototype).parseHost = (function (this)
local host, port = host, port;
host = (this).host;
port = portPattern:exec(host);
if _truthy(port) then
port = (port)[(0)];
if (port ~= (":")) then
(this).port = port:substr((1));
end
host = host:substr((0), ((host).length - (port).length));
end
if _truthy(host) then
(this).hostname = host;
end
end);

return _module.exports;
end
