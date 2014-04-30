{
  "variables": {
    "colony_lua_path": "./deps/colony-lua",
    "lua_bitop_path": "./deps/luabitop-1.0",
    'builtin_section%': '',
  },

  'target_defaults': {
    'conditions': [
      [ 'OS=="arm"', {
        'defines': [
          'COLONY_EMBED',
          'CONFIG_PLATFORM_EMBED',
          'HAVE_CLOSESOCKET',
          'TM_FS_vfs',
        ],
        #'include_dirs': [
        #  '<(axtls_path)/config/'
        #],
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
          '-Wno-error=unused-parameter',
          '-ggdb',
        ]
      }],
      [ 'OS!="arm"', {
        'defines': [
          'COLONY_PC', '_GNU_SOURCE'
        ],
        'cflags': [
          '-std=c99',
          '-ggdb',

          '-Wall',
          #'-Wextra',
          '-Werror',
          '-Wno-unused-parameter'
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
            'colony/builtin/_structured_clone.js',
            'colony/builtin/assert.js',
            'colony/builtin/buffer.js',
            'colony/builtin/child_process.js',
            'colony/builtin/crypto.js',
            'colony/builtin/dgram.js',
            'colony/builtin/dns.js',
            'colony/builtin/events.js',
            'colony/builtin/fs.js',
            'colony/builtin/http.js',
            'colony/builtin/https.js',
            'colony/builtin/net.js',
            'colony/builtin/os.js',
            'colony/builtin/path.js',
            'colony/builtin/punycode.js',
            'colony/builtin/querystring.js',
            'colony/builtin/repl.js',
            'colony/builtin/stream.js',
            'colony/builtin/string_decoder.js',
            'colony/builtin/tty.js',
            'colony/builtin/url.js',
            'colony/builtin/util.js',
            'colony/builtin/zlib.js',
          ],
          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c',
          ],
          'action': [ 'colony/tools/compile_folder.sh', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<(builtin_section)', '<@(_inputs)' ],
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
            'colony/lib/cli.lua',
            'colony/lib/colony-init.lua',
            'colony/lib/colony-js.lua',
            'colony/lib/colony-node.lua',
            'colony/lib/colony.lua',
            'colony/lib/preload.lua',
          ],
          'outputs': [
            '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c',
          ],
          'action': [ 'colony/tools/compile_folder.sh', '<(SHARED_INTERMEDIATE_DIR)/<(_target_name).c', '<(_target_name)', '<(builtin_section)', '<@(_inputs)' ],
        },
      ]
    },

    {
      "target_name": "libcolony",
      "product_name": "colony",
      "type": "static_library",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      "sources": [
        '<(SHARED_INTERMEDIATE_DIR)/dir_builtin.c',
        '<(SHARED_INTERMEDIATE_DIR)/dir_runtime_lib.c',

        'colony/runtime/tm_event.c',
        'colony/runtime/tm_timer.c',
        'colony/runtime/lua_cares.c',
        'colony/runtime/lua_hsregex.c',
        'colony/runtime/lua_http_parser.c',
        'colony/runtime/lua_tm.c',
        'colony/runtime/lua_yajl.c',
        'colony/runtime/colony.c',
        'colony/runtime/colony_runtime.c',
      ],
      "include_dirs": [
        'colony/runtime/',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        'colony-lua',
        'dir_builtin',
        'dir_runtime_lib',
        'tm.gyp:c-ares',
        'tm.gyp:hsregex',
        'tm.gyp:http_parser',
        'tm.gyp:yajl',
        'tm.gyp:dlmalloc',
        'tm.gyp:libtm'
      ],
      'direct_dependent_settings': {
        'defines': [
          'COLONY_LUA',
          'LUA_USELONGLONG',
        ],
        'include_dirs': [
          "colony/runtime/",
          "<(colony_lua_path)/src",
        ],
      }
    },

    {
      "target_name": "colony",
      "product_name": "colony",
      "type": "executable",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      "sources": [
        'runtime/cli.c',
      ],
      "include_dirs": [
        'runtime/',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        'tm.gyp:libtm',
        'libcolony',
      ]
    }
  ]
}