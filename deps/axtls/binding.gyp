{
    'targets': [
	{
        'target_name': 'liblibaxtls',
        'type': 'static_library',
        'sources': [
			'crypto/aes.c',
			'crypto/bigint.c',
			'crypto/crypto_misc.c',
			'crypto/hmac.c',
			'crypto/md2.c',
			'crypto/md5.c',
			'crypto/rc4.c',
			'crypto/rsa.c',
			'crypto/sha1.c',

			'ssl/asn1.c',
			'ssl/gen_cert.c',
			'ssl/loader.c',
			'ssl/openssl.c',
			'ssl/os_port.c',
			'ssl/p12.c',
			'ssl/tls1.c',
			'ssl/tls1_svr.c',
			'ssl/tls1_clnt.c',
			'ssl/x509.c'
        ],
        'include_dirs': [
        	'ssl',
        	'crypto',
        	'config'
        ],
        'direct_dependent_settings': {
	        'include_dirs': [
	        	'ssl',
	        	'crypto',
	        	'config'
	        ]
	    }
    },
    {
    	'target_name': 'axssl',
    	'type': 'executable',
    	'dependencies': [
    		'liblibaxtls'
    	],
    	'sources': [
    		'samples/c/axssl.c'
    	]
    }
    ]
}
