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

TEST random_test()
{
	uint8_t buf[16] = { 0 };
	tm_random(buf, sizeof(buf));
	print_buffer(buf, sizeof(buf));

	PASS();
}


SUITE(tm_buf)
{
	RUN_TEST(floats);
	RUN_TEST(doubles);
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
 * strings
 */

const uint8_t* pileofpoo = (uint8_t*) "Iñtërnâtiônàlizætiøn☃💩";
const uint8_t* pileofuppercasepoo = (uint8_t*) "IÑTËRNÂTIÔNÀLIZÆTIØN☃💩";
const uint8_t* moreutf = (uint8_t*) "lets 𝌆 test!";

TEST unicode_ucs2 ()
{
	ASSERT_EQm("ucs2 length", tm_ucs2_str_length(pileofpoo, -1), 23);
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(pileofpoo, -1, 0), 'I');
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(pileofpoo, -1, 21), 0xd83d);
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(pileofpoo, -1, 22), 0xdca9);

	ASSERT_EQm("ucs2 length", tm_ucs2_str_length(moreutf, -1), 13);
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(moreutf, -1, 12), '!');
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(moreutf, -1, 5), 0xD834);
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(moreutf, -1, 6), 0xDF06);

	PASS();
}

TEST unicode_case ()
{	
	uint8_t utf8char[4] = {0};
	ssize_t utf8char_len = tm_utf8_char_encode(0x1F4A9, (uint8_t*) &utf8char);
	ASSERT_EQm("utf8 encode", utf8char[0], 0xf0);
	ASSERT_EQm("utf8 encode", utf8char[1], 0x9f);
	ASSERT_EQm("utf8 encode", utf8char[2], 0x92);
	ASSERT_EQm("utf8 encode", utf8char[3], 0xa9);

	uint8_t* pileofuppercasepoo_cmp = NULL;
	tm_utf8_str_toupper(pileofpoo, -1, &pileofuppercasepoo_cmp);
	ASSERT_EQm("ucs2 length", tm_ucs2_str_length(pileofuppercasepoo_cmp, -1), 23);
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(pileofuppercasepoo_cmp, -1, 2), 'T');
	for (int i = 0; i < strlen((char*) pileofuppercasepoo); i++) {
		ASSERT_EQm("ucs2 equal", pileofuppercasepoo[i], pileofuppercasepoo_cmp[i]);
	}
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(pileofuppercasepoo_cmp, -1, 21), 0xd83d);
	ASSERT_EQm("ucs2 charat", tm_ucs2_str_charat(pileofuppercasepoo_cmp, -1, 22), 0xdca9);

	PASS();
}


SUITE(unicode)
{
	RUN_TEST(unicode_ucs2);
	RUN_TEST(unicode_case);
}

/**
 * entry
 */

GREATEST_MAIN_DEFS();

int main(int argc, char **argv)
{
	GREATEST_MAIN_BEGIN();      /* command-line arguments, initialization. */
	// RUN_SUITE(tm_buf);
	// RUN_SUITE(runtime);
	RUN_SUITE(unicode);
	GREATEST_MAIN_END();        /* display results */
}
