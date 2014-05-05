--
-- colony.lua
-- In order: initialize metatables, load JS API, then Node API.
--

_G.colony = {}
require('colony-init')
require('colony-js')
require('colony-node')
return colony
