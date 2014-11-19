{
  "includes": [
    "common.gypi",
  ],

  "targets": [
    {
      "target_name": "libtm-test",
      "product_name": "libtm-test",
      "type": "executable",
      "sources": [
        '../test/tm/test.c'
      ],
      "include_dirs": [
        '<(runtime_path)/src',
      ],
      "dependencies": [
        "libtm.gyp:libtm",
      ]
    }
  ]
}
