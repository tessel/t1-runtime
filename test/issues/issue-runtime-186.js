var tap = require('../tap')

tap.count(8)

tap.eq("Blue Whale".indexOf("Blue"), 0);
tap.eq("Blue Whale".indexOf("Whale"), 5);
tap.eq("Blue Whale".indexOf("Blute"), -1);
tap.eq("Blue Whale".indexOf("Whale", 0), 5);
tap.eq("Blue Whale".indexOf("Whale", 5), 5);
tap.eq("Blue Whale".indexOf("", 9), 9);
tap.eq("Blue Whale".indexOf("", 10), 10);
tap.eq("Blue Whale".indexOf("", 11), 10);
