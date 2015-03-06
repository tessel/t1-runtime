var tap = require('../tap');
tap.count(1);
tap.eq(Buffer("ffffffffffffffff", 'hex').toString('utf8').length, 8, 'bad UTF-8 conversion works');
