{
  "includes": [
    "common.gypi",
  ],

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
        "<(yajl_inc_path)"
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
          "<(yajl_path)/src",
          "<(yajl_inc_path)"
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
      ],

      'conditions': [
        [ 'OS=="arm"', {
          'include_dirs': [
            "<(axtls_path)/config/embed",
          ],
          'direct_dependent_settings': {
            'include_dirs': [
            "<(axtls_path)/config/embed",
            ]
          }
        }],
        [ 'OS!="arm"', {
          'include_dirs': [
            "<(axtls_path)/config/pc",
          ],
          'direct_dependent_settings': {
            'include_dirs': [
            "<(axtls_path)/config/pc",
            ]
          }
        }]
      ],

      # axtls uses printf(const str) without a format (scary right?)
      # also warns on unused variables.
      'cflags': [
        '-Wno-format-security',
        '-Wno-unused-variable',
        '-Wno-unused-result',
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
          "<(axtls_path)/ssl"
        ]
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
      "target_name": "fortuna",
      "product_name": "fortuna",
      "type": "static_library",
      "defines": [
        "C_H", 
      ],
      "cflags": [
        "-fno-strict-aliasing",
        "--include", "c_alt.h", # custom c defines
        "--include", "strings.h", # strncasecmp implicit declaration
      ],
      "xcode_settings": {
        "OTHER_CFLAGS": [
          "--include", "c_alt.h", # custom c defines
        ]
      },
      "sources": [
        '<(fortuna_path)/src/fortuna.c',
        '<(fortuna_path)/src/rijndael.c',
        '<(fortuna_path)/src/sha2.c',
        '<(fortuna_path)/src/px.c',
        '<(fortuna_path)/src/random.c',
        '<(fortuna_path)/src/internal.c',
        '<(fortuna_path)/src/blf.c',
        '<(fortuna_path)/src/sha1.c',
        '<(fortuna_path)/src/md5.c',
      ],
      "include_dirs": [
        '<(fortuna_path)/src/',
        '<(fortuna_inc_path)/',
      ],

      'direct_dependent_settings': {
        'include_dirs': [
          '<(fortuna_path)/src/',
          '<(fortuna_inc_path)/',
        ],
        "cflags": [
          "--include", "stdint.h", # strncasecmp implicit declaration
        ]
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
      ],
    },

    {
      "target_name": "libtm",
      "product_name": "tm",
      "type": "static_library",
      'cflags': [ '-Wall', '-Wextra', '-Werror' ],
      "defines": [
        'LACKS_UNISTD_H',
      ],
      'conditions': [
        ['OS=="arm"', {
          "sources": [
            'src/vfs/vfs.c',
            'src/vfs/vfs_tar.c',
          ],
        }],
        ['OS!="arm"', {
          "sources": [
            'src/posix/tm_net.c',
            'src/posix/tm_uptime.c',
            'src/posix/tm_fs.c',
          ]
        }],
        ['enable_ssl==1', {
          'dependencies': [
            "tm-ssl",
          ],
        }],
      ],
      'sources': [
        'src/dlmallocfork.c',
        'src/tm_buffer.c',
        'src/tm_itoa.c',
        'src/tm_log.c',
        'src/tm_random.c',
      ],
      "include_dirs": [
        'src/',
        '<(yajl_inc_path)',
      ],
      'dependencies': [
        "http_parser",
        "hsregex",
        "yajl",
        "fortuna",
        "dlmalloc",
        "utf8proc",
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'src/',
        ]
      }
    },
  ]
}
