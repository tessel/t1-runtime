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
end)
