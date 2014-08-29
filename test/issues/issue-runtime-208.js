var tap = require('../tap');

tap.count(2);

var a = {
    a: 5,
    get apple() {
        return this.a;
    },
    set apple(value) {
      this.a = value + 1;
    },
    c: 5
}

tap.eq(a.apple, a.a, "Getting works properly");
a.apple = 3;
tap.eq(a.apple, 4, "Setting works properly");