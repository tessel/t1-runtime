var tap = require('../tap')

tap.count(3)
console.log('#', JSON.stringify("/".slice(0, -1)))
tap.eq("/".slice(0, -1), '');
tap.eq("12345".slice(0, -3), '12');
tap.eq("12345".slice(0, -100), '');
