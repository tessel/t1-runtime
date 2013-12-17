{
  'variables': { 'target_arch%': 'x64' },
  'target_defaults': {
    'default_configuration': 'Debug',
    'configurations': {
      'Debug': {
        'defines': [ 'DEBUG', '_DEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 1, # static debug
          },
        },
      },
      'Release': {
        'defines': [ 'NDEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 0, # static release
          },
        },
      }
    },
    'msvs_settings': {
      'VCLinkerTool': {
        'GenerateDebugInformation': 'true',
      },
    },
    'include_dirs': [
       'src'
     ],

      'conditions' : [
          ['OS=="linux"', {
          }],
          ['OS=="mac"', {
          }],
          ['OS=="win"', {
            'defines':[
              'WIN32_LEAN_AND_MEAN'
            ],
            'msvs_settings': {
              'VCCLCompilerTool': {
                'AdditionalOptions': [ '/EHsc /MD' ],
              },
            }
          }]
      ]
   },

  'targets': [
    {
      'target_name': 'liblua',
      'type': 'static_library',
      'sources': [
        'src/lapi.c',
        'src/lauxlib.c',
        'src/lbaselib.c',
        'src/lcode.c',
        'src/ldblib.c',
        'src/ldebug.c',
        'src/ldo.c',
        'src/ldump.c',
        'src/lfunc.c',
        'src/lgc.c',
        'src/linit.c',
        'src/liolib.c',
        'src/llex.c',
        'src/lmathlib.c',
        'src/lmem.c',
        'src/loadlib.c',
        'src/lobject.c',
        'src/lopcodes.c',
        'src/loslib.c',
        'src/lparser.c',
        'src/lstate.c',
        'src/lstring.c',
        'src/lstrlib.c',
        'src/ltable.c',
        'src/ltablib.c',
        'src/ltm.c',
        'src/lundump.c',
        'src/lvm.c',
        'src/lzio.c'
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'src',
        ],
      }
    },
    {
      'target_name': 'lua',
      'type': 'executable',
      'dependencies': [
        'liblua',
      ],
      'sources': [
        'src/lua.c'
      ]
    },
    {
      'target_name': 'luac',
      'type': 'executable',
      'dependencies': [
        'liblua',
      ],
      'sources': [
        'src/luac.c'
      ]
    }
  ]
}