#include <stddef.h>
 #include "assert.c"
#include "buffer.c"
#include "crypto.c"
#include "dgram.c"
#include "events.c"
#include "fs.c"
#include "http.c"
#include "net.c"
#include "os.c"
#include "path.c"
#include "punycode.c"
#include "querystring.c"
#include "stream.c"
#include "string_decoder.c"
#include "tty.c"
#include "url.c"
#include "util.c"
#include "zlib.c"
const dir_reg_t dir_index_builtin[] = { {"./builtin/assert.js",builtin__assert_colony,builtin__assert_colony_len},
{"./builtin/buffer.js",builtin__buffer_colony,builtin__buffer_colony_len},
{"./builtin/crypto.js",builtin__crypto_colony,builtin__crypto_colony_len},
{"./builtin/dgram.js",builtin__dgram_colony,builtin__dgram_colony_len},
{"./builtin/events.js",builtin__events_colony,builtin__events_colony_len},
{"./builtin/fs.js",builtin__fs_colony,builtin__fs_colony_len},
{"./builtin/http.js",builtin__http_colony,builtin__http_colony_len},
{"./builtin/net.js",builtin__net_colony,builtin__net_colony_len},
{"./builtin/os.js",builtin__os_colony,builtin__os_colony_len},
{"./builtin/path.js",builtin__path_colony,builtin__path_colony_len},
{"./builtin/punycode.js",builtin__punycode_colony,builtin__punycode_colony_len},
{"./builtin/querystring.js",builtin__querystring_colony,builtin__querystring_colony_len},
{"./builtin/stream.js",builtin__stream_colony,builtin__stream_colony_len},
{"./builtin/string_decoder.js",builtin__string_decoder_colony,builtin__string_decoder_colony_len},
{"./builtin/tty.js",builtin__tty_colony,builtin__tty_colony_len},
{"./builtin/url.js",builtin__url_colony,builtin__url_colony_len},
{"./builtin/util.js",builtin__util_colony,builtin__util_colony_len},
{"./builtin/zlib.js",builtin__zlib_colony,builtin__zlib_colony_len}, { 0, 0, 0} };
