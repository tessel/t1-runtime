

function (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;




local  inherits,  deprecate,  isString,  isNull,  isObject,  isArray =  inherits,  deprecate,  isString,  isNull,  isObject,  isArray;

 inherits = (function (this, A,  B)  
local  f =  f;
   f =  (function (this)  end);(
  f).prototype = ( B).prototype;(
  A).prototype =  _new( f);end);

 deprecate = (function (this, fn)  

  if true then return  fn; end;end);

 isString = (function (this, str)  

  if true then return ( _typeof( str) == ("string")); end;end);

 isNull = (function (this, arg)  

  if true then return ( arg == (null)); end;end);

 isObject = (function (this, arg)  

  if true then return ( _typeof( arg) == ("object")); end;end);

 isArray = (function (this, arg)  

  if true then return  Array:isArray(arg); end;end);(

exports).inherits =  inherits;(
exports).deprecate =  deprecate;(
exports).isString =  isString;(
exports).isNull =  isNull;(
exports).isObject =  isObject;(
exports).isArray =  isArray;return _module.exports;end 