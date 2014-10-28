{
  "includes": [
    "common.gypi",
  ],

  "targets":  [
    {
      "target_name": "colony",
      "product_name": "colony",
      "type": "executable",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      "sources": [
        'src/colony/cli.c',
      ],
      'xcode_settings': {
        'OTHER_LDFLAGS': [
          '-pagezero_size', '10000', '-image_base', '100000000'
        ],
      },
      "include_dirs": [
        'src/',
        'src/colony/',
        "<(colony_lua_path)/src",
      ],
      "dependencies": [
        'libcolony.gyp:libcolony',
        'libtm.gyp:libtm',
      ],
    }
  ]
}
