function (_ENV)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local _module = {exports={}}; local exports, module = _module.exports, _module;

local PI, SOLAR____MASS, DAYS____PER____YEAR, Body, Jupiter, Saturn, Uranus, Neptune, Sun, NBodySystem, n, bodies, i = PI, SOLAR____MASS, DAYS____PER____YEAR, Body, Jupiter, Saturn, Uranus, Neptune, Sun, NBodySystem, n, bodies, i;
Body = (function (this, x, y, z, vx, vy, vz, mass)
(this).x = x;
(this).y = y;
(this).z = z;
(this).vx = vx;
(this).vy = vy;
(this).vz = vz;
(this).mass = mass;
end);
Jupiter = (function (this)
if true then return _new(Body, (4.841431442464721), (-(1.1603200440274284)), (-(0.10362204447112311)), ((0.001660076642744037) * DAYS__PER__YEAR), ((0.007699011184197404) * DAYS__PER__YEAR), ((-(0.0000690460016972063)) * DAYS__PER__YEAR), ((0.0009547919384243266) * SOLAR__MASS)); end;
end);
Saturn = (function (this)
if true then return _new(Body, (8.34336671824458), (4.124798564124305), (-(0.4035234171143214)), ((-(0.002767425107268624)) * DAYS__PER__YEAR), ((0.004998528012349172) * DAYS__PER__YEAR), ((0.000023041729757376393) * DAYS__PER__YEAR), ((0.0002858859806661308) * SOLAR__MASS)); end;
end);
Uranus = (function (this)
if true then return _new(Body, (12.894369562139131), (-(15.111151401698631)), (-(0.22330757889265573)), ((0.002964601375647616) * DAYS__PER__YEAR), ((0.0023784717395948095) * DAYS__PER__YEAR), ((-(0.000029658956854023756)) * DAYS__PER__YEAR), ((0.00004366244043351563) * SOLAR__MASS)); end;
end);
Neptune = (function (this)
if true then return _new(Body, (15.379697114850917), (-(25.919314609987964)), (0.17925877295037118), ((0.0026806777249038932) * DAYS__PER__YEAR), ((0.001628241700382423) * DAYS__PER__YEAR), ((-(0.00009515922545197159)) * DAYS__PER__YEAR), ((0.000051513890204661145) * SOLAR__MASS)); end;
end);
Sun = (function (this)
if true then return _new(Body, (0), (0), (0), (0), (0), (0), SOLAR__MASS); end;
end);
NBodySystem = (function (this, bodies)
local px, py, pz, size, i, b, m = px, py, pz, size, i, b, m;
(this).bodies = bodies;
px = (0);
py = (0);
pz = (0);
size = ((this).bodies).length;
i = (0);
while (i<size) do

b = ((this).bodies)[i];
m = (b).mass;
px = px + ((b).vx * m);
py = py + ((b).vy * m);
pz = pz + ((b).vz * m);

local _r = i; i = _r + 1;
end
if ((this).bodies)[(0)]:offsetMomentum(px, py, pz) then end;
end);
PI = (3.141592653589793);
SOLAR__MASS = (((4) * PI) * PI);
DAYS__PER__YEAR = (365.24);
((Body).prototype).offsetMomentum = (function (this, px, py, pz)
(this).vx = ((-px) / SOLAR__MASS);
(this).vy = ((-py) / SOLAR__MASS);
(this).vz = ((-pz) / SOLAR__MASS);
if true then return this; end;
end)

;
((NBodySystem).prototype).advance = (function (this, dt)
local dx, dy, dz, distance, mag, size, i, bodyi, j, bodyj, body = dx, dy, dz, distance, mag, size, i, bodyi, j, bodyj, body;
dx = nil;
dy = nil;
dz = nil;
distance = nil;
mag = nil;
size = ((this).bodies).length;
i = (0);
while (i<size) do

bodyi = ((this).bodies)[i];
j = (i+(1));
while (j<size) do

bodyj = ((this).bodies)[j];
dx = ((bodyi).x - (bodyj).x);
dy = ((bodyi).y - (bodyj).y);
dz = ((bodyi).z - (bodyj).z);
distance = Math:sqrt((((dx*dx) + (dy*dy)) + (dz*dz)));
mag = (dt / (((distance * distance) * distance)));
(bodyi).vx = (bodyi).vx - ((dx * (bodyj).mass) * mag);
(bodyi).vy = (bodyi).vy - ((dy * (bodyj).mass) * mag);
(bodyi).vz = (bodyi).vz - ((dz * (bodyj).mass) * mag);
(bodyj).vx = (bodyj).vx + ((dx * (bodyi).mass) * mag);
(bodyj).vy = (bodyj).vy + ((dy * (bodyi).mass) * mag);
(bodyj).vz = (bodyj).vz + ((dz * (bodyi).mass) * mag);

local _r = j; j = _r + 1;
end

local _r = i; i = _r + 1;
end
i = (0);
while (i<size) do

body = ((this).bodies)[i];
(body).x = (body).x + (dt * (body).vx);
(body).y = (body).y + (dt * (body).vy);
(body).z = (body).z + (dt * (body).vz);

local _r = i; i = _r + 1;
end
end)

;
((NBodySystem).prototype).energy = (function (this)
local dx, dy, dz, distance, e, size, i, bodyi, j, bodyj = dx, dy, dz, distance, e, size, i, bodyi, j, bodyj;
dx = nil;
dy = nil;
dz = nil;
distance = nil;
e = (0);
size = ((this).bodies).length;
i = (0);
while (i<size) do

bodyi = ((this).bodies)[i];
e = e + (((0.5) * (bodyi).mass) *
         ( ((((bodyi).vx * (bodyi).vx)
         + ((bodyi).vy * (bodyi).vy))
         + ((bodyi).vz * (bodyi).vz)) ));
j = (i+(1));
while (j<size) do

bodyj = ((this).bodies)[j];
dx = ((bodyi).x - (bodyj).x);
dy = ((bodyi).y - (bodyj).y);
dz = ((bodyi).z - (bodyj).z);
distance = Math:sqrt((((dx*dx) + (dy*dy)) + (dz*dz)));
e = e - ((((bodyi).mass * (bodyj).mass)) / distance);

local _r = j; j = _r + 1;
end

local _r = i; i = _r + 1;
end
if true then return e; end;
end)


;
n = (1000000);
bodies = _new(NBodySystem, Array(global, Sun(global), Jupiter(global), Saturn(global), Uranus(global), Neptune(global)));
if console:log(bodies:energy():toFixed((9))) then end;
i = (0);
while (i<n) do

if bodies:advance((0.01)) then end;

local _r = i; i = _r + 1;
end
if console:log(bodies:energy():toFixed((9))) then end;

return _module.exports;
end
