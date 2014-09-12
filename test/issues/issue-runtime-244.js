var tap = require('../tap');

tap.count(3);

tap.eq("abc".slice(0,1), 'a', '"abc".slice(0,1)')
tap.eq("abc".slice(0,0), '', '"abc".slice(0,0)')
tap.eq("abc".substring(0,0), '', '"abc".substring(0,0)')
