{
  "targets": [
    {
      "target_name": "binding"
    },
    {
      'target_name': 'compile_lua',
      'type': 'executable',
      'sources': [
        'compile_lua.c'
      ],
      'dependencies': [
        'colony-lua/lua.gyp:liblua',
        'colony-lua/lua.gyp:lua'
      ]
    }
  ]
}