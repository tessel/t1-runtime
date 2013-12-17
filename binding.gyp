{
  "targets": [
    {
      "target_name": "binding"
    },
  ],
  'conditions': [
    ['OS!="win"', {
  "targets": [
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
  ]]
}