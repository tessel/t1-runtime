{
  "includes": [
    "common.gypi",
  ],
  
  "targets":  [
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
      'target_name': 'dir_builtin',
      'type': 'none',
      'sources': [
        '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c'
      ],
      'actions': [
        {
          'action_name': '<(_target_name)_compile',
          'inputs': [
            'src/colony/modules/_stream_duplex.js',
            'src/colony/modules/_stream_passthrough.js',
            'src/colony/modules/_stream_readable.js',
            'src/colony/modules/_stream_transform.js',
            'src/colony/modules/_stream_writable.js',
            'src/colony/modules/_structured_clone.js',
            'src/colony/modules/assert.js',
            'src/colony/modules/buffer.js',
            'src/colony/modules/child_process.js',
            'src/colony/modules/crypto.js',
            'src/colony/modules/dgram.js',
            'src/colony/modules/dns.js',
            'src/colony/modules/events.js',
            'src/colony/modules/fs.js',
            'src/colony/modules/http.js',
            'src/colony/modules/https.js',
            'src/colony/modules/net.js',
            'src/colony/modules/os.js',
            'src/colony/modules/path.js',
            'src/colony/modules/punycode.js',
            'src/colony/modules/querystring.js',
            'src/colony/modules/repl.js',
            'src/colony/modules/stream.js',
            'src/colony/modules/string_decoder.js',
            'src/colony/modules/tls.js',
            'src/colony/modules/tty.js',
            'src/colony/modules/url.js',
            'src/colony/modules/util.js',
            'src/colony/modules/zlib.js',
          ],
          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c',
          ],
          'action': [ 'tools/compile_folder.sh', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<@(_inputs)' ],
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
            'src/colony/lua/cli.lua',
            'src/colony/lua/colony-init.lua',
            'src/colony/lua/colony-js.lua',
            'src/colony/lua/colony-node.lua',
            'src/colony/lua/colony.lua',
            'src/colony/lua/preload.lua',
          ],
          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c',
          ],
          'action': [ 'tools/compile_folder.sh', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<@(_inputs)' ],
        },
      ]
    },

    {
      "target_name": "libcolony",
      "product_name": "libcolony",
      "type": "static_library",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      "sources": [
        'src/tm_event.c',
        'src/tm_timer.c',
        'src/colony/lua_cares.c',
        'src/colony/lua_hsregex.c',
        'src/colony/lua_http_parser.c',
        'src/colony/lua_tm.c',
        'src/colony/lua_yajl.c',
        'src/colony/colony.c',
        'src/colony/colony_runtime.c',
        '<(SHARED_INTERMEDIATE_DIR)/dir_builtin.c',
        '<(SHARED_INTERMEDIATE_DIR)/dir_runtime_lib.c',
      ],
      'conditions': [
        ['OS!="arm"', {
          "sources": [
            'src/posix/tm_uptime.c',
            'src/posix/tm_timestamp.c',
          ]
        }],
        ['enable_ssl==1', {
          'dependencies': [
            "libtm.gyp:axtls",
            "libtm.gyp:tm-ssl",
          ],
        }],
      ],
      "include_dirs": [
        'src/',
        'src/colony/',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        'dir_builtin',
        'dir_runtime_lib',
        'colony-lua',
        'libtm.gyp:c-ares',
        'libtm.gyp:http_parser',
        'libtm.gyp:hsregex',
        'libtm.gyp:dlmalloc',
        'libtm.gyp:yajl',
        'libtm.gyp:libtm'
      ],
      "direct_dependent_settings": {
        "include_dirs": [
          'src/colony/'
        ]
      }
    }
  ]
}