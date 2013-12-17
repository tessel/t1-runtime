{
  "targets": [
    {
      "target_name": "binding",
      'dependencies': [
        'compile_lua'
      ]
    },
    {
      'target_name': 'compile_lua',
      'type': 'executable',
      'sources': [
        'src/compile_lua.c'
      ],
      'dependencies': [
        'deps/colony-lua/lua.gyp:liblua',
        'deps/colony-lua/lua.gyp:lua'
      ]
    }
  ]
}