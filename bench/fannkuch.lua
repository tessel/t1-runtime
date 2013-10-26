



function (_ENV)local string, math, print, type, pairs = nil, nil, nil, nil, nil;local _module = _obj({exports=_obj({})}); local exports, module = _module.exports, _module;local  fannkuch,  n,  pf =  fannkuch,  n,  pf;

 fannkuch = (function (this, n)  
local  p,  q,  s,  sign,  maxflips,  sum,  m,  i,  q0,  flips,  qq,  j,  t,  sx =  p,  q,  s,  sign,  maxflips,  sum,  m,  i,  q0,  flips,  qq,  j,  t,  sx;
    p =  Array(global, n); q =  Array(global, n); s =  Array(global, n);
    sign =  (1); maxflips =  (0); sum =  (0); m = ( n-(1));
    i = (0);while ( i<n) do ( p)[i] =  i;( q)[i] =  i;( s)[i] =  i;local _r =  i;  i = _r + 1;end;
   repeat 



       q0 = ( p)[(0)];
      if (q0 ~=  (0)) then

          i = (1);while ( i<n) do ( q)[i] = ( p)[i];local _r =  i;  i = _r + 1;end;
          flips =  (1);
         repeat 
 
             qq = ( q)[q0]; 
            if _truthy((qq == (0))) then

               sum = sum + ( sign*flips);
         if (flips > maxflips) then maxflips =  flips;end
               _c = _break; break;end( 
      q)[q0] =  q0; 
      if (q0 >= (3)) then

          i =  (1); j = ( q0 - (1)); t = nil;
               repeat  t = ( q)[i];( q)[i] = ( q)[j];( q)[j] =  t;local _r =  i;  i = _r + 1;local _r =  j;  j = _r - 1;until not (i < j);end
      q0 =  qq;local _r =  flips;  flips = _r + 1;until not _truthy((true));end
      if _truthy((sign == (1))) then

          t = ( p)[(1)];( p)[(1)] = ( p)[(0)];( p)[(0)] =  t; sign =  (-(1));else  
 
          t = ( p)[(1)];( p)[(1)] = ( p)[(2)];( p)[(2)] =  t; sign =  (1);
          i = (2);while ( i<n) do 

 
       sx = ( s)[i];
      if (sx ~=  (0)) then( s)[i] = ( sx-(1)); _c = _break; break;end
      if _truthy((i == m)) then if true then return  Array(global, sum, maxflips); end;end(
      s)[i] =  i;
      t = ( p)[(0)];  j = (0);while ( j<=i) do ( p)[j] = ( p)[(j+(1))];local _r =  j;  j = _r + 1;end;( p)[(i+(1))] =  t;local _r =  i;  i = _r + 1;end;enduntil not _truthy((true));end);

 n = (( (1)*(11))*(1));
 pf =  fannkuch(global, n);if 
console:log(((((((pf)[(0)] + ("\n")) + ("Pfannkuchen(")) + n) + (") = ")) +( pf)[(1)])) then end; return _module.exports;end 