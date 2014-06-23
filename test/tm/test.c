#include "tm.h"
#include "greatest-buf.h"

inline void print_buffer (uint8_t* buf, size_t len) {
	int i = 0;
	for (i = 0; i < len; i++) {
		printf("%02X ", buf[i]);
	}
	printf("\n");
}


/**
 * tm test
 */


TEST floats()
{
	uint8_t buf[16] = { 0 };

	uint8_t buf_le[16] = { 0, 0x00, 0x00, 0x80, 0x3f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
	tm_buffer_float_write (buf, 1, 1.0, LE);
	ASSERT_BUF_EQ(buf_le, buf);

	uint8_t buf_ge[16] = { 0, 0x3f, 0x80, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 };
	tm_buffer_float_write (buf, 1, 1.0, BE);
	ASSERT_BUF_EQ(buf_ge, buf);

	PASS();
}


TEST doubles()
{
	uint8_t buf[16] = { 0 };

	uint8_t buf_le[16] = { 0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xF0, 0x3F, 0, 0, 0, 0, 0, 0, 0 };
	tm_buffer_double_write (buf, 1, 1.0, LE);
	ASSERT_BUF_EQ(buf_le, buf);

	uint8_t buf_ge[16] = { 0, 0x3f, 0xF0, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0, 0, 0, 0, 0, 0, 0 };
	tm_buffer_double_write (buf, 1, 1.0, BE);
	ASSERT_BUF_EQ(buf_ge, buf);

	PASS();
}

SUITE(tm_buf)
{
	RUN_TEST(floats);
	RUN_TEST(doubles);
}


TEST random_test()
{
	size_t read = 0;
	uint8_t buf[16] = { 0 };
	tm_entropy_seed();
	tm_random_bytes(buf, sizeof(buf), &read);
	// print_buffer(buf, sizeof(buf));

	PASS();
}

SUITE(tm_random)
{
	RUN_TEST(random_test);
}


/**
 * runtime test
 */

// #include "colony.h"


// TEST colony(lua_State *L)
// {
// 	int stacksize = 0;
// 	size_t buf_len = 0;
// 	const uint8_t* buf = NULL;

// 	// test string -> buffer
// 	const char* str = "this is a cool string";
// 	lua_pushstring(L, str);
// 	buf_len = 0;
// 	stacksize = lua_gettop(L);
// 	buf = colony_tobuffer(L, -1, &buf_len);
// 	ASSERT_EQ(buf_len, strlen(str));
// 	ASSERT_EQ(strncmp((const char*) buf, str, buf_len), 0);
// 	ASSERT_EQm("colony_tobuffer doesn't grow or shrink stack", stacksize, lua_gettop(L));

// 	// test buffer -> buffer
// 	const uint8_t* newbuf = colony_createbuffer(L, 256);
// 	buf_len = 0;
// 	stacksize = lua_gettop(L);
// 	buf = colony_tobuffer(L, -1, &buf_len);
// 	ASSERT_EQ(buf_len, 256);
// 	ASSERT_EQ(strncmp((const char*) buf, (const char*) newbuf, buf_len), 0);
// 	ASSERT_EQm("colony_tobuffer doesn't grow or shrink stack", stacksize, lua_gettop(L));

// 	PASS();
// }


// SUITE(runtime)
// {
// 	lua_State *L = NULL;
// 	colony_runtime_open(&L);
// 	RUN_TESTp(colony, L);
// 	colony_runtime_close(&L);
// }


/**
 * entry
 */

GREATEST_MAIN_DEFS();

int main(int argc, char **argv)
{
	GREATEST_MAIN_BEGIN();      /* command-line arguments, initialization. */
	RUN_SUITE(tm_buf);
	RUN_SUITE(tm_random);
	// RUN_SUITE(runtime);
	GREATEST_MAIN_END();        /* display results */
}
