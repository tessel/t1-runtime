-- Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
-- file at the top-level directory of this distribution.
--
-- Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
-- http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
-- <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
-- option. This file may not be copied, modified, or distributed
-- except according to those terms.

--
-- cli.lua
-- A colony script to act as a command-line invocation tool.
--

local colony = require('colony')

-- This is temporary until we can add files to builtin array easily.
if _tessel_lib then
	colony.precache['tessel'] = _tessel_lib
	colony.run('tessel')
end

-- also temporary.
if _wifi_cc3000_lib then
	colony.precache['wifi-cc3000'] = _wifi_cc3000_lib
	colony.run('wifi-cc3000')
end

-- also also temporary.
if _neopixels_lib then
	colony.precache['neopixels'] = _neopixels_lib
	colony.run('neopixels')
end

-- Command line invocation
if #arg < 2 then
  print('Usage: colony script.js')
  return 1
end
local p = arg[2]
if string.sub(p, 1, 1) ~= '.' then
  p = './' .. p
end

colony.global:setImmediate(function ()
	colony.run(p)
	colony.global.process:emit('_script_running');
end)
