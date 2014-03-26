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
    "dlmalloc_path": "./deps/dlmalloc",
    "utf8proc_path": "./deps/utf8proc",
    'builtin_section%': '',
  },

  'target_defaults': {
    'conditions': [
      [ 'OS=="arm"', {
        'defines': [
          'COLONY_EMBED',
          'CONFIG_PLATFORM_EMBED',
          'TM_FS_vfs',
          'HAVE_CLOSESOCKET',
        ],
        'include_dirs': [
          '<(axtls_path)/config/'
        ],
        'cflags': [
          '-mcpu=cortex-m3',
          '-mthumb',
          '-mtune=cortex-m3',
          '-march=armv7-m',
          '-mlong-calls',
          '-mfix-cortex-m3-ldrd',
          '-mapcs-frame',
          '-msoft-float',
          '-mno-sched-prolog',
          # '-fno-hosted',
          '-ffunction-sections',
          '-fdata-sections',
          # '-fpermissive',
          '-std=c99',

          '-Wall',
          #'-Wextra',
          '-Werror',
        ]
      }],
      [ 'OS!="arm"', {
        'defines': [
          'COLONY_PC', '_GNU_SOURCE'
        ],
        'cflags': [
          '-std=c99',

          '-Wall',
          #'-Wextra',
          '-Werror',
        ]
      }]
    ],

    'default_configuration': 'Release',
    'configurations': {
      'Debug': {
        'conditions': [
          [ 'OS=="arm"', {
            'cflags': [
              '-gdwarf-2',
              '-Ofast',
            ]
          }],
          [ 'OS!="arm"', {
            'cflags': [
              '-O0',
              '-g',
              '-ftrapv'
            ],
            'xcode_settings': {
              'OTHER_CFLAGS': [
                '-O0',
                '-g',
                '-ftrapv'
              ]
            },
            'msvs_settings': {
              'VCCLCompilerTool': {
                'RuntimeLibrary': 1, # static debug
              },
            }
          }]
        ],
      },
      'Release': {
        'conditions': [
          [ 'OS=="arm"', {
            'cflags': [
              '-Ofast',
            ],
          }],
          [ 'OS!="arm"', {
            'cflags': [
              '-O3'
            ],
            'xcode_settings': {
              'OTHER_CFLAGS': [
                '-O3',
              ]
            },
            'msvs_settings': {
              'VCCLCompilerTool': {
                'RuntimeLibrary': 0, # static release
              },
            },
          }]
        ]
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

      # hsregex has some pedantic issues we can ignore
      'cflags': [
        '-Wno-unused-variable',
      ],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-Wno-unused-variable',
        ],
      },

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

      # yajl plays fast with enums
      'cflags': [
        '-Wno-enum-conversion',
      ],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-Wno-enum-conversion',
        ],
      },

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

      # axtls uses printf(const str) without a format (scary right?)
      # also warns on unused variables.
      'cflags': [
        '-Wno-format-security',
        '-Wno-unused-variable',
      ],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-Wno-format-security',
          '-Wno-unused-variable',
        ],
      },


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

      # c-ares has some pedantic issues we can ignore
      'cflags': [
        '-Wno-unused-value',
        '-Wno-unused-function',
        '-Wno-unused-variable',
        '-std=gnu99',
      ],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-Wno-unused-value',
          '-Wno-unused-function',
          '-Wno-unused-variable',
          '-std=gnu99',
        ],
      },

      'direct_dependent_settings': {
        'include_dirs': [
          "<(c_ares_path)/",
        ],
        'link_settings': {
          'conditions': [
            ['OS=="linux"', {
              'libraries': [
                '-lresolv'
              ]
            }]
          ]
        }
      }
    },

    {
      "target_name": "colony-lua",
      "product_name": "colony-lua",
      "type": "static_library",
      "defines": [
        'LUA_USELONGLONG',
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

      # Lua uses tmpname and has empty bodies and doesn't use some vars
      'cflags': [
        '-Wno-deprecated-declarations',
        '-Wno-empty-body',
        '-Wno-unused-but-set-variable',
        '-Wno-unused-value',
        '-Wno-unused-variable',
        '-Wno-unknown-warning-option',
      ],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-Wno-deprecated-declarations',
          '-Wno-empty-body',
          '-Wno-unused-but-set-variable',
          '-Wno-unused-value',
          '-Wno-unknown-warning-option',
        ],
      },

      "include_dirs": [
        "<(colony_lua_path)/src",
        "<(lua_bitop_path)/",
      ],
      'direct_dependent_settings': {
        'defines': [
          'COLONY_LUA',
          'LUA_USELONGLONG',
        ],
        'include_dirs': [
          "<(colony_lua_path)/src",
        ],
        'link_settings': {
          'libraries': [
            '-lm'
          ]
        }
      }
    },

    {
      "target_name": "dlmalloc",
      "product_name": "dlmalloc",
      "type": "static_library",
      "defines": [
        'MSPACES=1',
        'ONLY_MSPACES=1',
        'HAVE_MMAP=0',
        'HAVE_MORECORE=0',
      ],
      "sources": [
        '<(dlmalloc_path)/dlmalloc.c',
      ],
      "include_dirs": [
        '<(dlmalloc_path)/',
      ],

      'direct_dependent_settings': {
        'include_dirs': [
          '<(dlmalloc_path)/',
        ],
        "defines": [
          'MSPACES=1',
          'ONLY_MSPACES=1',
          'HAVE_MMAP=0',
          'HAVE_MORECORE=0',
        ],
      }
    },

    {
      "target_name": "utf8proc",
      "product_name": "utf8proc",
      "type": "static_library",
      "sources": [
        "<(utf8proc_path)/utf8proc.c",
        "<(utf8proc_path)/utf8proc_data.c",
      ],
      "include_dirs": [
        "<(utf8proc_path)/"
      ],

      "direct_dependent_settings": {
        "include_dirs": [
          "<(utf8proc_path)/"
        ],
      },
    },


    ###
    # TM WRAPPER LIBRARIES
    ###

    {
      "target_name": "tm-ssl",
      "type": "static_library",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
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
      "target_name": "tm",
      "product_name": "tm",
      "type": "static_library",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      "defines": [
        'LACKS_UNISTD_H',
      ],
      "sources": [
        'src/bindings/lua_cares.c',
        'src/bindings/lua_hsregex.c',
        'src/bindings/lua_http_parser.c',
        'src/bindings/lua_tm.c',
        'src/bindings/lua_yajl.c',
        'src/bindings/colony.c',
        'src/dlmallocfork.c',
        'src/tm_buffer.c',
        'src/tm_itoa.c',
        'src/runtime.c',
      ],
      "include_dirs": [
        'src/',
        'src/bindings',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        "tm-ssl",
        "http_parser",
        "hsregex",
        "yajl",
        "c-ares",
        "colony-lua",
        "dlmalloc",
        "utf8proc",
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'src/',
        ]
      }
    },

    {
      "target_name": "test-tm",
      "product_name": "test-tm",
      "type": "executable",
      "sources": [
        'test/tm/test.c'
      ],
      "include_dirs": [
        'src/',
      ],
      "dependencies": [
        "tessel-runtime",
      ]
    },


    ###
    # colony libs
    ###

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
            'builtin/repl.js',
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
          'action': [ 'tools/compile_folder.sh', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<(builtin_section)', '<@(_inputs)' ],
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
            'lib/colony-init.lua',
            'lib/colony-js.lua',
            'lib/colony-node.lua',
            'lib/colony.lua',
            'lib/preload.lua',
          ],
          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c',
          ],
          'action': [ 'tools/compile_folder.sh', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<(builtin_section)', '<@(_inputs)' ],
        },
      ]
    },


    ###
    # runtime
    ###

    {
      "target_name": "tessel-runtime",
      "type": "static_library",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      'conditions': [
        ['OS=="arm"', {
          "sources": [
            '<(c_ares_path)/inet_addr.c',
            'src/fs/vfs/vfs.c',
            'src/fs/vfs/vfs_tar.c',
          ],
        }],
        ['OS!="arm"', {
          "sources": [
            'src/net/posix/net.c',

            'src/uptime/posix/uptime.c',
            
            'src/fs/posix/fs.c',
          ]
        }]
      ],
      "sources": [
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
      ]
    },

    {
      "target_name": "colony",
      "product_name": "colony",
      "type": "executable",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      "sources": [
        'src/cli.c',
      ],
      "include_dirs": [
        'src/',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        'tessel-runtime'
      ]
    }
  ]
}
