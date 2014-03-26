function test(cb) {
    cb(0, 1, 2);
    cb(null, 1, 2);
    cb(1, null, 2);
}

test(function (e,d,m) {
    console.log("arguments:", arguments[0], arguments[1], arguments[2]);
    console.log("    e/d/m:", e, d, m);
});
