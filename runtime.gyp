{
  "variables": {
    "http_parser_path": "./deps/http-parser",
    "hsregex_path": "./deps/hsregex",
    "libtar_path": "./deps/libtar",
    "yajl_path": "./deps/yajl",
    "axtls_path": "./deps/axtls",
    "c_ares_path": "./deps/c-ares",
    "colony_lua_path": "./deps/colony-lua",
    "lua_bitop_path": "./deps/luabitop-1.0",
    "fatfs_path": "./deps/fatfs",
    'builtin_section%': '',
  },

  'target_defaults': {
    'default_configuration': 'Debug',
    'configurations': {
      'Debug': {
        'conditions': [
          [ 'OS=="arm"', {
            'defines': [
              'COLONY_EMBED',
              'CONFIG_PLATFORM_EMBED',
              'TM_FS_fat',
            ],
            'include_dirs': [
              '<(fatfs_path)/src',
              '<(axtls_path)/config/'
            ],
            'cflags': [
              '-mcpu=cortex-m3',
              '-mthumb',
              '-gdwarf-2',
              '-mtune=cortex-m3',
              '-march=armv7-m',
              '-mlong-calls',
              '-mfix-cortex-m3-ldrd',
              '-Ofast',
              '-Wall',
              '-mapcs-frame',
              '-msoft-float',
              '-mno-sched-prolog',
              # '-fno-hosted',
              '-ffunction-sections',
              '-fdata-sections',
              # '-fpermissive',
              '-std=c99'
            ]
          }],
          [ 'OS!="arm"', {
            'defines': [
              'COLONY_PC'
            ],
            'cflags': [ '-Wall', '-Wextra', '-O0', '-g', '-ftrapv' ],
            'msvs_settings': {
              'VCCLCompilerTool': {
                'RuntimeLibrary': 1, # static debug
              },
            }
          }]
        ],
      },
      'Release': {
        'cflags': [ '-Wall', '-Wextra', '-O3' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 0, # static release
          },
        },
      }
    },
    'msvs_settings': {
      'VCCLCompilerTool': {
      },
      'VCLibrarianTool': {
      },
      'VCLinkerTool': {
        'GenerateDebugInformation': 'true',
      },
    },
    'conditions': [
      ['OS == "win"', {
        'defines': [
          'WIN32'
        ],
      }]
    ],
  },

  "targets": [

    {
      "target_name": "http_parser",
      "product_name": "http_parser",
      "type": "static_library",
      "sources": [
        "<(http_parser_path)/http_parser.c"
      ],
      "include_dirs": [
        "<(http_parser_path)"
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          '<(http_parser_path)'
        ]
      }
    },

    {
      "target_name": "hsregex",
      "product_name": "hsregex",
      "type": "static_library",
      "defines": [
        'REGEX_WCHAR',
        'REGEX_STANDALONE',
        '_NDEBUG'
      ],
      "sources": [
        "<(hsregex_path)/src/regcomp.c",
        "<(hsregex_path)/src/regexec.c",
        "<(hsregex_path)/src/regerror.c",
        "<(hsregex_path)/src/regfree.c",
        "<(hsregex_path)/src/regalone.c"
      ],
      "include_dirs": [
        "<(hsregex_path)/src"
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          '<(hsregex_path)/src'
        ],
        'defines': [
          'REGEX_WCHAR'
        ]
      }
    },

    {
      "target_name": "libtar",
      "product_name": "libtar",
      "type": "static_library",
      "defines": [
        'MAXPATHLEN=256'
      ],
      "sources": [
        "<(libtar_path)/lib/append.c",
        "<(libtar_path)/lib/block.c",
        "<(libtar_path)/lib/decode.c",
        "<(libtar_path)/lib/encode.c",
        "<(libtar_path)/lib/handle.c",
        "<(libtar_path)/lib/output.c",
        "<(libtar_path)/lib/util.c",
        "<(libtar_path)/listhash/libtar_hash.c",
        "<(libtar_path)/listhash/libtar_list.c"
      ],
      "include_dirs": [
        "<(libtar_path)",
        "<(libtar_path)/lib",
        "<(libtar_path)/compat",
        "<(libtar_path)/listhash"
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          "<(libtar_path)/",
          "<(libtar_path)/lib",
          "<(libtar_path)/compat",
          "<(libtar_path)/listhash",
        ]
      }
    },

    {
      "target_name": "yajl",
      "product_name": "yajl",
      "type": "static_library",
      "defines": [
      ],
      "sources": [
        "<(yajl_path)/src/yajl.c",
        "<(yajl_path)/src/yajl_alloc.c",
        "<(yajl_path)/src/yajl_buf.c",
        "<(yajl_path)/src/yajl_encode.c",
        "<(yajl_path)/src/yajl_gen.c",
        "<(yajl_path)/src/yajl_lex.c",
        "<(yajl_path)/src/yajl_parser.c",
        "<(yajl_path)/src/yajl_tree.c",
        "<(yajl_path)/src/yajl_version.c",
      ],
      "include_dirs": [
        "<(yajl_path)/src",
        "./src"
      ],
      'direct_dependent_settings': {
        'include_dirs': [
        ]
      }
    },

    {
      "target_name": "axtls",
      "product_name": "axtls",
      "type": "static_library",
      "defines": [
      ],
      "sources": [
        "<(axtls_path)/crypto/aes.c",
        "<(axtls_path)/crypto/bigint.c",
        "<(axtls_path)/crypto/crypto_misc.c",
        "<(axtls_path)/crypto/hmac.c",
        "<(axtls_path)/crypto/md2.c",
        "<(axtls_path)/crypto/md5.c",
        "<(axtls_path)/crypto/rc4.c",
        "<(axtls_path)/crypto/rsa.c",
        "<(axtls_path)/crypto/sha1.c",
        "<(axtls_path)/ssl/asn1.c",
        "<(axtls_path)/ssl/gen_cert.c",
        "<(axtls_path)/ssl/loader.c",
        "<(axtls_path)/ssl/openssl.c",
        "<(axtls_path)/ssl/os_port.c",
        "<(axtls_path)/ssl/p12.c",
        "<(axtls_path)/ssl/tls1.c",
        "<(axtls_path)/ssl/tls1_svr.c",
        "<(axtls_path)/ssl/tls1_clnt.c",
        "<(axtls_path)/ssl/x509.c",
      ],
      "include_dirs": [
        "<(axtls_path)/crypto",
        "<(axtls_path)/ssl",
        "<(axtls_path)/config",
        "<(axtls_path)/config/pc",
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          "<(axtls_path)/crypto",
          "<(axtls_path)/config",
          "<(axtls_path)/config/pc",
          "<(axtls_path)/ssl"
        ]
      }
    },

    {
      "target_name": "c-ares",
      "product_name": "c-ares",
      "type": "static_library",
      "defines": [
        'HAVE_CONFIG_H'
      ],
      "sources": [
        '<(c_ares_path)/ares__close_sockets.c',
        '<(c_ares_path)/ares__get_hostent.c',
        '<(c_ares_path)/ares__read_line.c',
        '<(c_ares_path)/ares__timeval.c',
        '<(c_ares_path)/ares_cancel.c',
        '<(c_ares_path)/ares_data.c',
        '<(c_ares_path)/ares_destroy.c',
        '<(c_ares_path)/ares_expand_name.c',
        '<(c_ares_path)/ares_expand_string.c',
        '<(c_ares_path)/ares_fds.c',
        '<(c_ares_path)/ares_free_hostent.c',
        '<(c_ares_path)/ares_free_string.c',
        '<(c_ares_path)/ares_getenv.c',
        '<(c_ares_path)/ares_gethostbyaddr.c',
        '<(c_ares_path)/ares_gethostbyname.c',
        '<(c_ares_path)/ares_getnameinfo.c',
        '<(c_ares_path)/ares_getsock.c',
        '<(c_ares_path)/ares_init.c',
        '<(c_ares_path)/ares_library_init.c',
        '<(c_ares_path)/ares_llist.c',
        '<(c_ares_path)/ares_mkquery.c',
        '<(c_ares_path)/ares_create_query.c',
        '<(c_ares_path)/ares_nowarn.c',
        '<(c_ares_path)/ares_options.c',
        '<(c_ares_path)/ares_parse_a_reply.c',
        '<(c_ares_path)/ares_parse_aaaa_reply.c',
        '<(c_ares_path)/ares_parse_mx_reply.c',
        '<(c_ares_path)/ares_parse_naptr_reply.c',
        '<(c_ares_path)/ares_parse_ns_reply.c',
        '<(c_ares_path)/ares_parse_ptr_reply.c',
        '<(c_ares_path)/ares_parse_soa_reply.c',
        '<(c_ares_path)/ares_parse_srv_reply.c',
        '<(c_ares_path)/ares_parse_txt_reply.c',
        '<(c_ares_path)/ares_platform.c',
        '<(c_ares_path)/ares_process.c',
        '<(c_ares_path)/ares_query.c',
        '<(c_ares_path)/ares_search.c',
        '<(c_ares_path)/ares_send.c',
        '<(c_ares_path)/ares_strcasecmp.c',
        '<(c_ares_path)/ares_strdup.c',
        '<(c_ares_path)/ares_strerror.c',
        '<(c_ares_path)/ares_timeout.c',
        '<(c_ares_path)/ares_version.c',
        '<(c_ares_path)/ares_writev.c',
        '<(c_ares_path)/bitncmp.c',
        '<(c_ares_path)/inet_net_pton.c',
        '<(c_ares_path)/inet_ntop.c',
        '<(c_ares_path)/windows_port.c',
      ],
      "include_dirs": [
        "<(c_ares_path)/",
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          "<(c_ares_path)/",
        ]
      }
    },

    {
      "target_name": "colony-lua",
      "product_name": "colony-lua",
      "type": "static_library",
      "defines": [
      ],
      "sources": [
        '<(colony_lua_path)/src/lapi.c',
        '<(colony_lua_path)/src/lauxlib.c',
        '<(colony_lua_path)/src/lbaselib.c',
        '<(colony_lua_path)/src/lcode.c',
        '<(colony_lua_path)/src/ldblib.c',
        '<(colony_lua_path)/src/ldebug.c',
        '<(colony_lua_path)/src/ldo.c',
        '<(colony_lua_path)/src/ldump.c',
        '<(colony_lua_path)/src/lfunc.c',
        '<(colony_lua_path)/src/lgc.c',
        '<(colony_lua_path)/src/linit.c',
        '<(colony_lua_path)/src/liolib.c',
        '<(colony_lua_path)/src/llex.c',
        '<(colony_lua_path)/src/lmathlib.c',
        '<(colony_lua_path)/src/lmem.c',
        '<(colony_lua_path)/src/loadlib.c',
        '<(colony_lua_path)/src/lobject.c',
        '<(colony_lua_path)/src/lopcodes.c',
        '<(colony_lua_path)/src/loslib.c',
        '<(colony_lua_path)/src/lparser.c',
        '<(colony_lua_path)/src/lstate.c',
        '<(colony_lua_path)/src/lstring.c',
        '<(colony_lua_path)/src/lstrlib.c',
        '<(colony_lua_path)/src/ltable.c',
        '<(colony_lua_path)/src/ltablib.c',
        '<(colony_lua_path)/src/ltm.c',
        '<(colony_lua_path)/src/lundump.c',
        '<(colony_lua_path)/src/lvm.c',
        '<(colony_lua_path)/src/lzio.c',
        '<(colony_lua_path)/src/print.c',
        '<(lua_bitop_path)/bit.c'
      ],
      "include_dirs": [
        "<(colony_lua_path)/src",
        "<(lua_bitop_path)/",
      ],
      'direct_dependent_settings': {
        'defines': [
          'COLONY_LUA'
        ],
        'include_dirs': [
          "<(colony_lua_path)/src",
        ]
      }
    },

    {
      "target_name": "fatfs",
      "product_name": "fatfs",
      "type": "static_library",
      "defines": [
        'COLONY_FATFS',
        'TM_FS_fat',
      ],
      "sources": [
        '<(fatfs_path)/src/ff.c',
        '<(fatfs_path)/src/ff_convert.c',
      ],
      "include_dirs": [
        '<(fatfs_path)/src',
        '<(axtls_path)/config/'
      ],
      "direct_dependent_settings": {
        "defines": [
          'COLONY_FATFS',
          'TM_FS_fat',
        ],
        "include_dirs": [
          '<(fatfs_path)/src',
          '<(axtls_path)/config/'
        ],
      }
    },

    {
      "target_name": "tm-ssl",
      "type": "static_library",
      "sources": [
        'src/tm_ssl.c',
      ],
      "include_dirs": [
        'src/',
      ],
      "dependencies": [
        "axtls"
      ]
    },

    {
      "target_name": "tm-tar",
      "type": "static_library",
      "defines": [
        'MAXPATHLEN=256',
      ],
      "sources": [
        'src/tar_extract.c',
      ],
      "include_dirs": [
        'src/',
      ],
      "dependencies": [
        "libtar"
      ]
    },

    {
      "target_name": "tm",
      "product_name": "tm",
      "type": "static_library",
      "defines": [
      ],
      "sources": [
        'src/l_cares.c',
        'src/l_hsregex.c',
        'src/l_http_parser.c',
        'src/l_tm.c',
        'src/lua_yajl.c',
        'src/runtime.c',
      ],
      "include_dirs": [
        'src/',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        "tm-ssl",
        "tm-tar",
        "http_parser",
        "hsregex",
        "yajl",
        "c-ares",
        "colony-lua",
      ]
    },

    {
      'target_name': 'dir_builtin',
      'type': 'none',
      'sources': [
        '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c'
      ],
      'actions': [
        {
          'action_name': '<(_target_name)_compile',
          'inputs': [
            'builtin/assert.js',
            'builtin/buffer.js',
            'builtin/child_process.js',
            'builtin/crypto.js',
            'builtin/dgram.js',
            'builtin/dns.js',
            'builtin/events.js',
            'builtin/fs.js',
            'builtin/http.js',
            'builtin/https.js',
            'builtin/net.js',
            'builtin/os.js',
            'builtin/path.js',
            'builtin/punycode.js',
            'builtin/querystring.js',
            'builtin/stream.js',
            'builtin/string_decoder.js',
            'builtin/tty.js',
            'builtin/url.js',
            'builtin/util.js',
            'builtin/zlib.js',
          ],
          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c',
          ],
          'action': [ 'tools/compile_folder', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<(builtin_section)', '<@(_inputs)' ],
        },
      ]
    },

    {
      'target_name': 'dir_runtime_lib',
      'type': 'none',
      'sources': [
        '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c'
      ],
      'actions': [
        {
          'action_name': '<(_target_name)_compile',
          'inputs': [
            'lib/cli.lua',
            'lib/colony.lua',
            'lib/node-tm.lua',
            'lib/std.lua'
          ],
          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c',
          ],
          'action': [ 'tools/compile_folder', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<(builtin_section)', '<@(_inputs)' ],
        },
      ]
    },

    {
      "target_name": "runtime-arm-deps",
      "type": "static_library",
      "sources": [
        'src/fs/fat/diskio.c',
        'src/fs/fat/fs.c',
        '<(c_ares_path)/inet_addr.c',
        
        '<(SHARED_INTERMEDIATE_DIR)/dir_builtin.c',
        '<(SHARED_INTERMEDIATE_DIR)/dir_runtime_lib.c',
      ],
      "include_dirs": [
        'src/',
        "<(colony_lua_path)/src",
      ],
      'dependencies': [
        'dir_builtin',
        'dir_runtime_lib',
        'tm',
        "fatfs",
      ]
    },

    {
      'target_name': 'tm-arm',
      'type': 'none',
      'actions': [
        {
          'action_name': 'tm-arm-action',
          'inputs': [ 'runtime.gyp' ],
          'outputs': [ '<(PRODUCT_DIR)/lib<(_target_name).a' ],
          'action': [ 'tools/dist_static_lib.sh', 'lib<(_target_name).a', '<@(_dependencies)' ],
        }
      ],
      'dependencies': [
        # what i have to include
        "libtar",
        "fatfs",
        "axtls",
        "tm-ssl",
        "tm-tar",
        "http_parser",
        "hsregex",
        "yajl",
        "c-ares",
        "colony-lua",

        # what i want to include
        "tm",
        "runtime-arm-deps",
      ]
    },

    {
      "target_name": "tm-posix-net",
      "type": "static_library",
      "sources": [
        'src/net/posix/net.c',
      ],
      "include_dirs": [
        'src/',
        "<(colony_lua_path)/src",
      ],
    },

    {
      "target_name": "colony",
      "product_name": "colony",
      "type": "executable",
      "defines": [
      ],
      "sources": [
        'src/cli.c',
        'src/uptime/posix/uptime.c',
        
        'src/fs/posix/fs.c',
        
        '<(SHARED_INTERMEDIATE_DIR)/dir_builtin.c',
        '<(SHARED_INTERMEDIATE_DIR)/dir_runtime_lib.c',
      ],
      "include_dirs": [
        'src/',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        'dir_builtin',
        'dir_runtime_lib',
        "tm-posix-net",
        "tm"
      ]
    }
  ]
}
