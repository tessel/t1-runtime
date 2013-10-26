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

-- Query String Utilitiesfunction (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;









local  QueryString,  util,  hasOwnProperty,  charCode,  stringifyPrimitive =  QueryString,  util,  hasOwnProperty,  charCode,  stringifyPrimitive;
 hasOwnProperty = (function (this, obj,  prop)  

  if true then return (( Object).prototype).hasOwnProperty:call(obj,  prop); end;end);


 charCode = (function (this, c)  

  if true then return  c:charCodeAt((0)); end;end);

 QueryString =  exports;
 util =  require(global, ("util"));(
QueryString).unescapeBuffer =  (function (this, s,  decodeSpaces)  


local  out,  state,  n,  m,  hexchar,  inIndex,  outIndex,  c =  out,  state,  n,  m,  hexchar,  inIndex,  outIndex,  c;
   out =  _new( Buffer, (s).length);
   state =  ("CHAR");
   n = nil; m = nil; hexchar = nil;

   inIndex =  (0); outIndex =  (0);while ( inIndex <=( s).length) do  

     c =  s:charCodeAt(inIndex);
    





repeatlocal _0 =  ("CHAR"); local _1 =  ("HEX0"); local _2 =  ("HEX1");local _r = state;if _r == _0 then
        




repeatlocal _0 =  charCode(global, ("%")); local _1 =  charCode(global, ("+")); local _2;local _r = c;if _r == _0 then
            n =  (0);
            m =  (0);
            state =  ("HEX0");
            _c = _break; break;endif _r == _1 then
            if _truthy(decodeSpaces) then c =  charCode(global, (" "));end_r = _2;end(
            out)[local __r = outIndex; outIndex = __r + 1;] =  c;
            _c = _break; break;until true
        _c = _break; break;endif _r == _1 then
        state =  ("HEX1");
        hexchar =  c;
        if _truthy((charCode(global, ("0")) <= c) and ( c <= charCode(global, ("9")))) then 

          n = ( c - charCode(global, ("0")));else  if _truthy((charCode(global, ("a")) <= c) and ( c <= charCode(global, ("f")))) then 

          n = (( c - charCode(global, ("a"))) + (10));else  if _truthy((charCode(global, ("A")) <= c) and ( c <= charCode(global, ("F")))) then 

          n = (( c - charCode(global, ("A"))) + (10));else  
(
          out)[local __r = outIndex; outIndex = __r + 1;] =  charCode(global, ("%"));(
          out)[local __r = outIndex; outIndex = __r + 1;] =  c;
          state =  ("CHAR");
          _c = _break; break;endendend
        _c = _break; break;endif _r == _2 then
        state =  ("CHAR");
        if _truthy((charCode(global, ("0")) <= c) and ( c <= charCode(global, ("9")))) then 

          m = ( c - charCode(global, ("0")));else  if _truthy((charCode(global, ("a")) <= c) and ( c <= charCode(global, ("f")))) then 

          m = (( c - charCode(global, ("a"))) + (10));else  if _truthy((charCode(global, ("A")) <= c) and ( c <= charCode(global, ("F")))) then 

          m = (( c - charCode(global, ("A"))) + (10));else  
(
          out)[local __r = outIndex; outIndex = __r + 1;] =  charCode(global, ("%"));(
          out)[local __r = outIndex; outIndex = __r + 1;] =  hexchar;(
          out)[local __r = outIndex; outIndex = __r + 1;] =  c;
          _c = _break; break;endendend(
        out)[local __r = outIndex; outIndex = __r + 1;] = (( (16) * n) + m);
        _c = _break; break;enduntil truelocal _r =  inIndex;  inIndex = _r + 1;end;

  if true then return  out:slice((0), ( outIndex - (1))); end;end);(


QueryString).unescape =  (function (this, s,  decodeSpaces)  

  if true then return  QueryString:unescapeBuffer(s,  decodeSpaces):toString(); end;end);(


QueryString).escape =  (function (this, str)  

  if true then return  encodeURIComponent(global, str); end;end);

 stringifyPrimitive =  (function (this, v)  

  if _truthy(util:isString(v)) then
    if true then return  v; end;end
  if _truthy(util:isBoolean(v)) then
    if true then return (_truthy( v) and { ("true")} or { ("false")})[1]; end;end
  if _truthy(util:isNumber(v)) then
    if true then return (_truthy( isFinite(global, v)) and { v} or { ("")})[1]; end;end
  if true then return  (""); end;end);(


QueryString).stringify = local _r =  (function (this, obj,  sep,  eq,  name)  

  sep =  sep or  ("&");
  eq =  eq or  ("=");
  if _truthy(util:isNull(obj)) then 

    obj =  undefined;end

  if _truthy(util:isObject(obj)) then 


    if true then return  Object:keys(obj):map((function (this, k)  
local  ks =  ks;
       ks = ( QueryString:escape(stringifyPrimitive(global, k)) + eq);
      if _truthy(util:isArray(obj[k])) then 

        if true then return ( obj)[k]:map((function (this, v)  

          if true then return ( ks + QueryString:escape(stringifyPrimitive(global, v))); end;end)):join(sep); end;else  

        if true then return ( ks + QueryString:escape(stringifyPrimitive(global, obj[k]))); end;endend)):join(sep); end;end

  if (not _truthy(name)) then if true then return  (""); end;end
  if true then return (( QueryString:escape(stringifyPrimitive(global, name)) + eq) +
         QueryString:escape(stringifyPrimitive(global, obj))); end;end); ( QueryString).encode = _r;(
QueryString).parse = local _r =  (function (this, qs,  sep,  eq,  options)  local  obj,  regexp,  maxKeys,  len,  i,  x, 
        idx, 
        kstr,  vstr,  k,  v =  obj,  regexp,  maxKeys,  len,  i,  x, 
        idx, 
        kstr,  vstr,  k,  v;
  sep =  sep or  ("&");
  eq =  eq or  ("=");
   obj =  _obj({  });

  if _truthy((not _truthy(util:isString(qs))) or (( qs).length ==  (0))) then 

    if true then return  obj; end;end

   regexp =  _regexp("\\+", "g");
  qs =  qs:split(sep);

   maxKeys =  (1000);
  if _truthy(options and  util:isNumber(options.maxKeys)) then 

    maxKeys = ( options).maxKeys;end

   len = ( qs).length;
  if _truthy((maxKeys > (0)) and ( len > maxKeys)) then 

    len =  maxKeys;end

   i =  (0);while ( i < len) do  

     x = ( qs)[i]:replace(regexp,  ("%20"));
        idx =  x:indexOf(eq);
        kstr = nil; vstr = nil; k = nil; v = nil;

    if (idx >= (0)) then 

      kstr =  x:substr((0),  idx);
      vstr =  x:substr((idx + (1)));else  

      kstr =  x;
      vstr =  ("");end

    local _e = nillocal _s, _r = _xpcall(function () 

      k =  decodeURIComponent(global, kstr);
      v =  decodeURIComponent(global, vstr);    end, function (err)        _e = err    end)if _s == false thene = _e; 

      k =  QueryString:unescape(kstr,  (true));
      v =  QueryString:unescape(vstr,  (true));endif _r == _break thenbreak;elseif _r == _cont thenbreak;end

    if (not _truthy(hasOwnProperty(global, obj,  k))) then 
(
      obj)[k] =  v;else  if _truthy(util:isArray(obj[k])) then 
if (
      obj)[k]:push(v) then end; else  
(
      obj)[k] =  _arr({[0]=(obj)[k],  v});endend (function () i = i + 1; return i; end)()end;

  if true then return  obj; end;end); ( QueryString).decode = _r;return _module.exports;end 