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
	size_t read = 0;
	uint8_t buf[16] = { 0 };
	tm_entropy_seed();
	tm_random_bytes(buf, sizeof(buf), &read);
	// print_buffer(buf, sizeof(buf));

	PASS();
}


unsigned char hello_gz[] = {
  0x1f, 0x8b, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xff, 0x01, 0x0d,
  0x00, 0xf2, 0xff, 0x48, 0x45, 0x4c, 0x4c, 0x4f, 0x20, 0x57, 0x4f, 0x52,
  0x4c, 0x44, 0x0a, 0x00, 0x1a, 0xdf, 0xa2, 0xe6, 0x0d, 0x00, 0x00, 0x00
};
unsigned int hello_gz_len = 36;

unsigned char* helloworld = (unsigned char *) "HELLO WORLD\n";
size_t helloworld_len = sizeof("HELLO WORLD\n");

TEST tm_deflate_test()
{
	uint8_t out[1024*16] = { 0 };
	size_t out_total = 0;
	size_t out_len = sizeof(out), out_written = 0, in_read = 0;

	uint8_t in[1024*16] = { 0 };
	size_t in_total = 0;

	{
		tm_deflate_t deflator;
		tm_deflate_alloc(&deflator);

		ASSERT_EQ(tm_deflate_start(deflator, TM_GZIP, 1), 0);

		ASSERT_EQ(tm_deflate_write(deflator, helloworld, helloworld_len, &in_read, &out[out_total], out_len - out_total, &out_written), 0);
		out_total += out_written;
		ASSERT_EQ(out[0], 0x1F); // magic
		ASSERT_EQ(out[1], 0x8b); // magic
		ASSERT_EQ(in_read, helloworld_len);

		ASSERT_EQ(tm_deflate_end(deflator, &out[out_total], out_len - out_total, &out_written), 0);
		out_total += out_written;

		// Check compiled version.
		ASSERT_BUF_N_EQ(hello_gz, out, hello_gz_len);
	}

	{
		size_t in_len = sizeof(in), out_read = 0, in_written = 0;

		tm_inflate_t inflator;
		tm_inflate_alloc(&inflator);

		ASSERT_EQ(tm_inflate_start(inflator, TM_GZIP), 0);

		out_len = out_total;
		for (size_t offset = 0; offset < out_len; ) {
			size_t in_chunk_size = out_len - offset < 10 ? out_len - offset : 10;
			out_read = 0;
			int status = tm_inflate_write(inflator, &out[out_read + offset], in_chunk_size, &out_read, &in[in_total], in_len - in_total, &in_written);
			ASSERT_EQ(status, 0);
			ASSERT_FALSE(out_read == 0 && in_written == 0);

			offset += out_read;
			in_total += in_written;
		}

		ASSERT_EQ(tm_inflate_end(inflator, &in[in_total], in_len - in_total, &in_written), 0);
		in_total += in_written;

		// Compares result to "hello world"
		ASSERT_BUF_N_EQ(in, helloworld, in_total);
	}

	PASS();
}

SUITE(tm)
{
	RUN_TEST(floats);
	RUN_TEST(doubles);
	RUN_TEST(random_test);
	RUN_TEST(tm_deflate_test);
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
	RUN_SUITE(tm);
	// RUN_SUITE(runtime);
	GREATEST_MAIN_END();        /* display results */
}
