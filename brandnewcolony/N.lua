return function (_ENV, _module)
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local exports, module = _module.exports, _module;

local PI, SOLAR_MASS, DAYS_PER_YEAR, Body, Jupiter, Saturn, Uranus, Neptune, Sun, NBodySystem, n, bodies, i;
PI = 3.141592653589793; 
SOLAR_MASS = ((((4)*(PI)))*(PI)); 
DAYS_PER_YEAR = 365.24; 
Body = function (this, x, y, z, vx, vy, vz, mass)
this.x = x;
this.y = y;
this.z = z;
this.vx = vx;
this.vy = vy;
this.vz = vz;
this.mass = mass;
end

Body.prototype.offsetMomentum = (function (this, px, py, pz)
this.vx = (((-(px)))/(SOLAR_MASS));
this.vy = (((-(py)))/(SOLAR_MASS));
this.vz = (((-(pz)))/(SOLAR_MASS));
if true then return this; end
end);
Jupiter = function (this)
if true then return _new(Body, 4.84143144246472090e+00, (-(1.16032004402742839e+00)), (-(1.03622044471123109e-01)), ((1.66007664274403694e-03)*(DAYS_PER_YEAR)), ((7.69901118419740425e-03)*(DAYS_PER_YEAR)), (((-(6.90460016972063023e-05)))*(DAYS_PER_YEAR)), ((9.54791938424326609e-04)*(SOLAR_MASS))); end
end

Saturn = function (this)
if true then return _new(Body, 8.34336671824457987e+00, 4.12479856412430479e+00, (-(4.03523417114321381e-01)), (((-(2.76742510726862411e-03)))*(DAYS_PER_YEAR)), ((4.99852801234917238e-03)*(DAYS_PER_YEAR)), ((2.30417297573763929e-05)*(DAYS_PER_YEAR)), ((2.85885980666130812e-04)*(SOLAR_MASS))); end
end

Uranus = function (this)
if true then return _new(Body, 1.28943695621391310e+01, (-(1.51111514016986312e+01)), (-(2.23307578892655734e-01)), ((2.96460137564761618e-03)*(DAYS_PER_YEAR)), ((2.37847173959480950e-03)*(DAYS_PER_YEAR)), (((-(2.96589568540237556e-05)))*(DAYS_PER_YEAR)), ((4.36624404335156298e-05)*(SOLAR_MASS))); end
end

Neptune = function (this)
if true then return _new(Body, 1.53796971148509165e+01, (-(2.59193146099879641e+01)), 1.79258772950371181e-01, ((2.68067772490389322e-03)*(DAYS_PER_YEAR)), ((1.62824170038242295e-03)*(DAYS_PER_YEAR)), (((-(9.51592254519715870e-05)))*(DAYS_PER_YEAR)), ((5.15138902046611451e-05)*(SOLAR_MASS))); end
end

Sun = function (this)
if true then return _new(Body, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, SOLAR_MASS); end
end

NBodySystem = function (this, bodies)
local px, py, pz, size, i, b, m;
this.bodies = bodies;
px = 0.0; 
py = 0.0; 
pz = 0.0; 
size = this.bodies.length; 
i = 0; 
while ((i)<(size))do 
b = this.bodies[i]; 
m = b.mass; 
px = px+((b.vx)*(m));
py = py+((b.vy)*(m));
pz = pz+((b.vz)*(m));
local _r = i; i = _r + 1;
end;
if this.bodies[0]:offsetMomentum(px, py, pz) then end;
end

NBodySystem.prototype.advance = (function (this, dt)
local dx, dy, dz, distance, mag, size, i, bodyi, j, bodyj, i, body;
dx = null;  dy = null;  dz = null;  distance = null;  mag = null; 
size = this.bodies.length; 
i = 0; 
while ((i)<(size))do 
bodyi = this.bodies[i]; 
j = ((i)+(1)); 
while ((j)<(size))do 
bodyj = this.bodies[j]; 
dx = ((bodyi.x)-(bodyj.x));
dy = ((bodyi.y)-(bodyj.y));
dz = ((bodyi.z)-(bodyj.z));
distance = Math:sqrt(((((((dx)*(dx)))+(((dy)*(dy)))))+(((dz)*(dz)))));
mag = ((dt)/(((((distance)*(distance)))*(distance))));
bodyi.vx = bodyi.vx-((((dx)*(bodyj.mass)))*(mag));
bodyi.vy = bodyi.vy-((((dy)*(bodyj.mass)))*(mag));
bodyi.vz = bodyi.vz-((((dz)*(bodyj.mass)))*(mag));
bodyj.vx = bodyj.vx+((((dx)*(bodyi.mass)))*(mag));
bodyj.vy = bodyj.vy+((((dy)*(bodyi.mass)))*(mag));
bodyj.vz = bodyj.vz+((((dz)*(bodyi.mass)))*(mag));
local _r = j; j = _r + 1;
end;
local _r = i; i = _r + 1;
end;
i = 0; 
while ((i)<(size))do 
body = this.bodies[i]; 
body.x = body.x+((dt)*(body.vx));
body.y = body.y+((dt)*(body.vy));
body.z = body.z+((dt)*(body.vz));
local _r = i; i = _r + 1;
end;
end);
NBodySystem.prototype.energy = (function (this)
local dx, dy, dz, distance, e, size, i, bodyi, j, bodyj;
dx = null;  dy = null;  dz = null;  distance = null; 
e = 0.0; 
size = this.bodies.length; 
i = 0; 
while ((i)<(size))do 
bodyi = this.bodies[i]; 
e = e+((((0.5)*(bodyi.mass)))*(((((((bodyi.vx)*(bodyi.vx)))+(((bodyi.vy)*(bodyi.vy)))))+(((bodyi.vz)*(bodyi.vz))))));
j = ((i)+(1)); 
while ((j)<(size))do 
bodyj = this.bodies[j]; 
dx = ((bodyi.x)-(bodyj.x));
dy = ((bodyi.y)-(bodyj.y));
dz = ((bodyi.z)-(bodyj.z));
distance = Math:sqrt(((((((dx)*(dx)))+(((dy)*(dy)))))+(((dz)*(dz)))));
e = e-((((bodyi.mass)*(bodyj.mass)))/(distance));
local _r = j; j = _r + 1;
end;
local _r = i; i = _r + 1;
end;
if true then return e; end
end);
n = 1000000; 
bodies = _new(NBodySystem, Array(this, Sun(this), Jupiter(this), Saturn(this), Uranus(this), Neptune(this))); 
if console:log(bodies:energy():toFixed(9)) then end;
i = 0; 
while ((i)<(n))do 
if bodies:advance(0.01) then end;
local _r = i; i = _r + 1;
end;
if console:log(bodies:energy():toFixed(9)) then end;

return _module.exports;
end 