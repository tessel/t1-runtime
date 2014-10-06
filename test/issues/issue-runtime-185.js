var tap = require('../tap')

tap.count(7)

tap.eq("canal".lastIndexOf("a"), 3);
tap.eq("canal".lastIndexOf("a", 2), 1)
tap.eq("canal".lastIndexOf("l", 4), 4)
tap.eq("canal".lastIndexOf("a", 0), -1)
tap.eq("canal".lastIndexOf("a", 8), 3)
tap.eq("canal".lastIndexOf("a", -5), -1)
tap.eq("canal".lastIndexOf("x"), -1)

