# tessel runtime

This is the runtime and JavaScript engine that runs on Tessel, built on Lua's VM. It can be run independently on PC or embedded.

```
git clone --recursive https://github.com/tessel/runtime.git
```

Building the firmware requires [gcc-arm-embedded](https://launchpad.net/gcc-arm-embedded), [gyp](https://code.google.com/p/gyp/), and [ninja](http://martine.github.io/ninja/).

#### OS X

To install quickly on a Mac with [Brew](http://brew.sh):

```
brew tap tessel/tools
brew install gcc-arm gyp ninja
```

If you get an error that looks like this:

```
==> Checking out http://gyp.googlecode.com/svn/trunk/
==> python setup.py install

  http://peak.telecommunity.com/EasyInstall.html

Please make the appropriate changes for your system and try again.


READ THIS: https://github.com/Homebrew/homebrew/wiki/troubleshooting
If reporting this issue please do so at (not Homebrew/homebrew):
  https://github.com/tessel/homebrew-tools/issues
```

Then try running this:

```
brew uninstall gyp
brew install python gyp ninja
```

And if that doesn't work, you could try `brew install -vd gyp` to get more information.

#### Ubuntu 14.04

All dependencies are in the Ubuntu 14.04 repositories:

```
sudo apt-get install git nodejs npm nodejs-legacy gcc-arm-none-eabi gyp ninja-build
```

## Building

```
npm install
npm install -g colony-compiler
make colony
npm link --local
npm test
```

You can now run code on your PC using `colony` from your command line (e.g. `colony hello-world.js`). For building firmware, please see the [firmware building instructions](https://github.com/tessel/firmware).

## Documentation

### Colony
Colony has support for interacting with the Lua API for handling basic JavaScript primitives. These are included via `colony.h`.

&#x20;<a href="#api-void-colony_createarray-lua_State-L-int-size-" name="api-void-colony_createarray-lua_State-L-int-size-">#</a> <i>void</i>&nbsp; <b>colony_createarray</b> ( <i>lua\_State\*</i>&nbsp; L, <i>int</i>&nbsp; size )  
Creates a new JavaScript array of length `size`. This sets the object prototype as well as the initial length of the array.

&#x20;<a href="#api-void-colony_createobj-lua_State-L-int-size-int-proto-" name="api-void-colony_createobj-lua_State-L-int-size-int-proto-">#</a> <i>void</i>&nbsp; <b>colony_createobj</b> ( <i>lua\_State\*</i>&nbsp; L, <i>int</i>&nbsp; size, <i>int</i>&nbsp; proto )  
Creates a new JavaScript object with an expected (but not required) allocation of `size` keys. This sets the object prototype as well. If `proto` is not zero (an invalid stack pointer), it points to an object on the stack to be used as the prototype for the newly created object.

### Net
Networking

&#x20;<a href="#api-typedef-tm_socket_t" name="api-typedef-tm_socket_t">#</a> <i>typedef</i>&nbsp; <b>tm_socket_t</b>  
socket type

&#x20;<a href="#api-tm_socket_t-tm_udp_open-" name="api-tm_socket_t-tm_udp_open-">#</a> <i>tm_socket_t</i>&nbsp; <b>tm_udp_open</b> ()  
open a udp socket

&#x20;<a href="#api-int-tm_udp_close-int-sock-" name="api-int-tm_udp_close-int-sock-">#</a> <i>int</i>&nbsp; <b>tm_udp_close</b> ( <i>int</i>&nbsp; sock )  
close a udp socket

&#x20;<a href="#api-int-tm_udp_listen-int-ulSocket-int-port-" name="api-int-tm_udp_listen-int-ulSocket-int-port-">#</a> <i>int</i>&nbsp; <b>tm_udp_listen</b> ( <i>int</i>&nbsp; ulSocket, <i>int</i>&nbsp; port )  
listen to udp

&#x20;<a href="#api-int-tm_udp_receive-int-ulSocket-uint8_t-buf-unsigned-long-buf_len-uint32_t-ip-" name="api-int-tm_udp_receive-int-ulSocket-uint8_t-buf-unsigned-long-buf_len-uint32_t-ip-">#</a> <i>int</i>&nbsp; <b>tm_udp_receive</b> ( <i>int</i>&nbsp; ulSocket, <i>uint8\_t</i>&nbsp; \*buf, <i>unsigned</i>&nbsp; long buf\_len, <i>uint32\_t</i>&nbsp; \*ip );  
receive on udp

&#x20;<a href="#api-int-tm_udp_readable-tm_socket_t-sock-" name="api-int-tm_udp_readable-tm_socket_t-sock-">#</a> <i>int</i>&nbsp; <b>tm_udp_readable</b> ( <i>tm\_socket\_t</i>&nbsp; sock )  
is socket readable?

&#x20;<a href="#api-int-tm_udp_send-int-ulSocket-uint8_t-ip0-uint8_t-ip1-uint8_t-ip2-uint8_t-ip3-int-port-uint8_t-buf-unsigned-long-buf_len-" name="api-int-tm_udp_send-int-ulSocket-uint8_t-ip0-uint8_t-ip1-uint8_t-ip2-uint8_t-ip3-int-port-uint8_t-buf-unsigned-long-buf_len-">#</a> <i>int</i>&nbsp; <b>tm_udp_send</b> ( <i>int</i>&nbsp; ulSocket, <i>uint8\_t</i>&nbsp; ip0, <i>uint8\_t</i>&nbsp; ip1, <i>uint8\_t</i>&nbsp; ip2, <i>uint8\_t</i>&nbsp; ip3, <i>int</i>&nbsp; port, <i>uint8\_t</i>&nbsp; \*buf, <i>unsigned</i>&nbsp; long buf\_len )  
send on socket

&#x20;<a href="#api-tm_socket_t-tm_tcp_open-" name="api-tm_socket_t-tm_tcp_open-">#</a> <i>tm_socket_t</i>&nbsp; <b>tm_tcp_open</b> ()  
open tcp

&#x20;<a href="#api-int-tm_tcp_close-" name="api-int-tm_tcp_close-">#</a> <i>int</i>&nbsp; <b>tm_tcp_close</b> ()  
close tcp

&#x20;<a href="#api-int-tm_tcp_connect-tm_socket_t-sock-uint8_t-ip0-uint8_t-ip1-uint8_t-ip2-uint8_t-ip3-uint16_t-port-" name="api-int-tm_tcp_connect-tm_socket_t-sock-uint8_t-ip0-uint8_t-ip1-uint8_t-ip2-uint8_t-ip3-uint16_t-port-">#</a> <i>int</i>&nbsp; <b>tm_tcp_connect</b> ( <i>tm\_socket\_t</i>&nbsp; sock, <i>uint8\_t</i>&nbsp; ip0, <i>uint8\_t</i>&nbsp; ip1, <i>uint8\_t</i>&nbsp; ip2, <i>uint8\_t</i>&nbsp; ip3, <i>uint16\_t</i>&nbsp; port )  
connect on tcp

&#x20;<a href="#api-int-tm_tcp_write-tm_socket_t-sock-uint8_t-buf-size_t-buflen-" name="api-int-tm_tcp_write-tm_socket_t-sock-uint8_t-buf-size_t-buflen-">#</a> <i>int</i>&nbsp; <b>tm_tcp_write</b> ( <i>tm\_socket\_t</i>&nbsp; sock, <i>uint8\_t</i>&nbsp; \*buf, <i>size\_t</i>&nbsp; buflen )  
write on tcp

&#x20;<a href="#api-int-tm_tcp_read-tm_socket_t-sock-uint8_t-buf-size_t-buflen-" name="api-int-tm_tcp_read-tm_socket_t-sock-uint8_t-buf-size_t-buflen-">#</a> <i>int</i>&nbsp; <b>tm_tcp_read</b> ( <i>tm\_socket\_t</i>&nbsp; sock, <i>uint8\_t</i>&nbsp; \*buf, <i>size\_t</i>&nbsp; buflen )  
read on tcp

&#x20;<a href="#api-int-tm_tcp_readable-tm_socket_t-sock-" name="api-int-tm_tcp_readable-tm_socket_t-sock-">#</a> <i>int</i>&nbsp; <b>tm_tcp_readable</b> ( <i>tm\_socket\_t</i>&nbsp; sock )  
is socket readable?

&#x20;<a href="#api-int-tm_tcp_listen-tm_socket_t-sock-uint16_t-port-" name="api-int-tm_tcp_listen-tm_socket_t-sock-uint16_t-port-">#</a> <i>int</i>&nbsp; <b>tm_tcp_listen</b> ( <i>tm\_socket\_t</i>&nbsp; sock, <i>uint16\_t</i>&nbsp; port )  
listen on port

&#x20;<a href="#api-tm_socket_t-tm_tcp_accept-tm_socket_t-sock-uint32_t-ip-" name="api-tm_socket_t-tm_tcp_accept-tm_socket_t-sock-uint32_t-ip-">#</a> <i>tm_socket_t</i>&nbsp; <b>tm_tcp_accept</b> ( <i>tm\_socket\_t</i>&nbsp; sock, <i>uint32\_t</i>&nbsp; \*ip )  
accept new incoming connection

&#x20;<a href="#api-uint32_t-tm_hostname_lookup-const-uint8_t-hostname-" name="api-uint32_t-tm_hostname_lookup-const-uint8_t-hostname-">#</a> <i>uint32_t</i>&nbsp; <b>tm_hostname_lookup</b> ( <i>const</i>&nbsp; uint8\_t \*hostname )  
lookup host

### Regular Expressions
Regexes

&#x20;<a href="#api-typedef-struct-" name="api-typedef-struct-">#</a> <i>typedef</i>&nbsp; <b>struct</b> {  
&nbsp; &nbsp;&nbsp;`size_t re_nsub;`  
&nbsp; &nbsp;&nbsp;`long re_info;`  
&nbsp; &nbsp;&nbsp;`int re_csize;`  
&nbsp; } regex_t;  
Regex created by `re_comp`. `re_nsub` is the number of subcapture groups. `re_info` is a bitmask of information about the regex. `re_csize` is the length of a character in the regex.

&#x20;<a href="#api-typedef-struct-" name="api-typedef-struct-">#</a> <i>typedef</i>&nbsp; <b>struct</b> {  
&nbsp; &nbsp;&nbsp;`long rm_so;`  
&nbsp; &nbsp;&nbsp;`long rm_eo;`  
&nbsp; } regmatch_t;  
A matched subgroup. `rm_so` is the start offset in the string, `rm_eo` is the ending offset.

&#x20;<a href="#api-int-re_comp-regex_t-regex-const-wchar_t-pattern-size_t-pattern_len-int-flags-" name="api-int-re_comp-regex_t-regex-const-wchar_t-pattern-size_t-pattern_len-int-flags-">#</a> <i>int</i>&nbsp; <b>re_comp</b>( <i>regex\_t\*</i>&nbsp; regex, <i>const</i>&nbsp; wchar\_t\* pattern, <i>size\_t</i>&nbsp; pattern\_len, <i>int</i>&nbsp; flags );  
Compiles a regex `pattern` with `flags` in the memory allocated at `regex`. Use `regfree` to close this object.

&#x20;<a href="#api-void-regfree-regex_t-regex-" name="api-void-regfree-regex_t-regex-">#</a> <i>void</i>&nbsp; <b>regfree</b>( <i>regex\_t\*</i>&nbsp; regex );  
Frees the internals of a `regex_t` object.

&#x20;<a href="#api-int-re_exec-regex_t-regex-const-wchar_t-input-size_t-input_len-rm_detail_t-details-size_t-matches_len-regmatch_t-matches-int-flags-" name="api-int-re_exec-regex_t-regex-const-wchar_t-input-size_t-input_len-rm_detail_t-details-size_t-matches_len-regmatch_t-matches-int-flags-">#</a> <i>int</i>&nbsp; <b>re_exec</b>( <i>regex\_t\*</i>&nbsp; regex, <i>const</i>&nbsp; wchar\_t\* input, <i>size\_t</i>&nbsp; input\_len, <i>rm\_detail\_t\*</i>&nbsp; details, <i>size\_t</i>&nbsp; matches\_len, <i>regmatch\_t</i>&nbsp; matches[], <i>int</i>&nbsp; flags );  
Executes a `regex` on the given string `input`. Can match up to `matches_len` subgroups in the array `matches`.

&#x20;<a href="#api-size_t-regerror-int-error-const-regex_t-regex-char-buf-size_t-buf_len-" name="api-size_t-regerror-int-error-const-regex_t-regex-char-buf-size_t-buf_len-">#</a> <i>size_t</i>&nbsp; <b>regerror</b>( <i>int</i>&nbsp; error, <i>const</i>&nbsp; regex\_t\* regex, <i>char\*</i>&nbsp; buf, <i>size\_t</i>&nbsp; buf\_len );  
Returns the meaning of a given regex error.

## License

MIT or Apache 2.0, at your option.
