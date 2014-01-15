{
  "targets": [
    {
      "target_name": "bindings"
    },
    {
      'target_name': 'compile_lua',
      'type': 'executable',
      'sources': [
        'bin/compile_lua.c'
      ],
      'dependencies': [
        'bin/colony-lua/lua.gyp:liblua',
        'bin/colony-lua/lua.gyp:lua'
      ]
    }
  ]
}