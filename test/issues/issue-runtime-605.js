var tap = require('../tap');

tap.count(16)

var value = -1;
tap.eq(value, -1)
tap.eq(!value, false)
tap.eq(!!value, true)
tap.eq(!!!value, false)

var value = -0.1;
tap.eq(value, -0.1)
tap.eq(!value, false)
tap.eq(!!value, true)
tap.eq(!!!value, false)

var value = 0;
tap.eq(value, 0)
tap.eq(!value, true)
tap.eq(!!value, false)
tap.eq(!!!value, true)

var value = -0;
tap.eq(value, -0)
tap.eq(!value, true)
tap.eq(!!value, false)
tap.eq(!!!value, true)
