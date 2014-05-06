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
      "target_name": "c-ares",
      "product_name": "c-ares",
      "type": "static_library",
      "defines": [
        'HAVE_CONFIG_H'
      ],
      "sources": [
        '<(c_ares_path)/ares__close_sockets.c',
        '<(c_ares_path)/ares__get_hostent.c',
        '<(c_ares_path)/ares__read_line.c',
        '<(c_ares_path)/ares__timeval.c',
        '<(c_ares_path)/ares_cancel.c',
        '<(c_ares_path)/ares_data.c',
        '<(c_ares_path)/ares_destroy.c',
        '<(c_ares_path)/ares_expand_name.c',
        '<(c_ares_path)/ares_expand_string.c',
        '<(c_ares_path)/ares_fds.c',
        '<(c_ares_path)/ares_free_hostent.c',
        '<(c_ares_path)/ares_free_string.c',
        '<(c_ares_path)/ares_getenv.c',
        '<(c_ares_path)/ares_gethostbyaddr.c',
        '<(c_ares_path)/ares_gethostbyname.c',
        '<(c_ares_path)/ares_getnameinfo.c',
        '<(c_ares_path)/ares_getsock.c',
        '<(c_ares_path)/ares_init.c',
        '<(c_ares_path)/ares_library_init.c',
        '<(c_ares_path)/ares_llist.c',
        '<(c_ares_path)/ares_mkquery.c',
        '<(c_ares_path)/ares_create_query.c',
        '<(c_ares_path)/ares_nowarn.c',
        '<(c_ares_path)/ares_options.c',
        '<(c_ares_path)/ares_parse_a_reply.c',
        '<(c_ares_path)/ares_parse_aaaa_reply.c',
        '<(c_ares_path)/ares_parse_mx_reply.c',
        '<(c_ares_path)/ares_parse_naptr_reply.c',
        '<(c_ares_path)/ares_parse_ns_reply.c',
        '<(c_ares_path)/ares_parse_ptr_reply.c',
        '<(c_ares_path)/ares_parse_soa_reply.c',
        '<(c_ares_path)/ares_parse_srv_reply.c',
        '<(c_ares_path)/ares_parse_txt_reply.c',
        '<(c_ares_path)/ares_platform.c',
        '<(c_ares_path)/ares_process.c',
        '<(c_ares_path)/ares_query.c',
        '<(c_ares_path)/ares_search.c',
        '<(c_ares_path)/ares_send.c',
        '<(c_ares_path)/ares_strcasecmp.c',
        '<(c_ares_path)/ares_strdup.c',
        '<(c_ares_path)/ares_strerror.c',
        '<(c_ares_path)/ares_timeout.c',
        '<(c_ares_path)/ares_version.c',
        '<(c_ares_path)/ares_writev.c',
        '<(c_ares_path)/bitncmp.c',
        '<(c_ares_path)/inet_net_pton.c',
        '<(c_ares_path)/inet_ntop.c',
        '<(c_ares_path)/windows_port.c',
      ],
      "include_dirs": [
        "<(c_ares_path)/",
      ],

      # c-ares has some pedantic issues we can ignore
      'cflags': [
        '-Wno-unused-result',
        '-Wno-unused-value',
        '-Wno-unused-function',
        '-Wno-unused-variable',
        '-std=gnu99',
      ],
      'xcode_settings': {
        'OTHER_CFLAGS': [
          '-Wno-unused-result',
          '-Wno-unused-value',
          '-Wno-unused-function',
          '-Wno-unused-variable',
          '-std=gnu99',
        ],
      },

      'direct_dependent_settings': {
        'include_dirs': [
          "<(c_ares_path)/",
        ],
        'link_settings': {
          'conditions': [
            ['OS=="linux"', {
              'libraries': [
                '-lresolv'
              ]
            }]
          ]
        }
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
            '<(c_ares_path)/inet_addr.c',
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
          'defines': [
            "ENABLE_TLS",
          ],
        }],
      ],
      'sources': [
        'src/dlmallocfork.c',
        'src/tm_buffer.c',
        'src/tm_itoa.c',
        'src/tm_log.c',
      ],
      "include_dirs": [
        'src/',
        '<(yajl_inc_path)',
      ],
      'dependencies': [
        "http_parser",
        "hsregex",
        "yajl",
        "c-ares",
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
