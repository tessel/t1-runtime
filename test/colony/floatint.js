// Tests float v int implementation details of Lua engine.
// Compares 32-bit ints with floats when treated silently
// by underlying engine (as LuaJIT with DUAL_NUM does)

var tap = require('../tap');

tap.count(10);

var tm = process.binding('tm');

function float_0() {
	// Signed-fill right shift generates float
	// (as it preserves negative numbers)
	var v = 0;
	return v >> 0;
};

function float_1() {
	// Signed-fill right shift generates float
	// (as it preserves negative numbers)
	var v = 1;
	return v >> 0;
};

function int_0(){
	return 0;
}

function int_1(){
	return 1;
}

tap.eq(0, float_0(), 'float 0');
tap.eq(true, !float_0(), 'not float 0');

tap.eq(1, float_1(), 'float 1');
tap.eq(false, !float_1(), 'not float 1');

tap.eq(0, int_0(), 'int 0');
tap.eq(true, !int_0(), 'not int 0');

tap.eq(1, int_1(), 'int 1');
tap.eq(false, !int_1(), 'not int 1');

if (float_0()) {
	tap.ok(false, 'if float 0');
}

if (float_1()) {
	tap.ok(true, 'if float 1');
} v 

if (int_0()) {
	tap.ok(false, 'if int 0');
}

if (int_1()) {
	tap.ok(true, 'if int 1');
}
