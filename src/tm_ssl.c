// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include <tm.h>

#include <os_port.h>
#include <ssl.h>

#ifdef TLS_VERBOSE
#define TLS_DEBUG(...) printf(__VA_ARGS__)
#else
#define TLS_DEBUG(...) if (0) { printf(__VA_ARGS__); }
#endif

static void display_cipher(tm_ssl_session_t ssl);
static void display_session_id(tm_ssl_session_t ssl);

ssize_t tm_ssl_write (tm_ssl_session_t ssl, uint8_t *buf, size_t buf_len)
{
    int ret = ssl_write(ssl, buf, buf_len);
    return ret;
}

// TODO less than 1024
ssize_t tm_ssl_read (tm_ssl_session_t ssl, uint8_t *buf, size_t buf_len)
{
    (void) buf_len;
	uint8_t *read_buf;
    ssize_t ret = ssl_read(ssl, &read_buf);
    if (ret >= 0) {
    	memcpy(buf, read_buf, ret);
    	buf_len = ret; 
    } else {
    	buf_len = 0;
    }
    return ret;
}

typedef struct dir_reg { const char *path; const unsigned char *src; unsigned int len; } dir_reg_t;
extern dir_reg_t cacert_bundle[];

int tm_ssl_context_create (tm_ssl_ctx_t* ctx)
{
#ifdef TLS_VERBOSE
    uint32_t options = SSL_DISPLAY_CERTS;
#else
    uint32_t options = 0;
#endif

    SSL_CTX *ssl_ctx;
    if ((ssl_ctx = ssl_ctx_new(options, SSL_DEFAULT_CLNT_SESS)) == NULL)
    {
        TLS_DEBUG("SSL client context is invalid.\n");
        return -1;
    }

    // Load lib/*.lua files into memory.
    for (int i = 0; cacert_bundle[i].path != NULL; i++) {
        if (add_cert_auth(ssl_ctx, cacert_bundle[i].src, 1)) {
            TLS_DEBUG("Invalid CA cert bundle at index %d, aborting.\n", i);
            return -1;
        }
    }

    // if (ssl_obj_load(ssl_ctx, SSL_OBJ_X509_CACERT, "./deps/cacert/ca-bundle.crt", NULL))
    // {
    //     TLS_DEBUG("Invalid CA cert bundle, aborting.\n");
    //     return -1;
    // }

    *ctx = ssl_ctx;

    return 0;
}


int tm_ssl_context_free (tm_ssl_ctx_t *ctx)
{
    ssl_ctx_free(*ctx);
    return 0;
}

int tm_ssl_session_create (tm_ssl_session_t* session, tm_ssl_ctx_t ctx, tm_socket_t client_fd)
{
    int res;
    int quiet = 0;

	tm_ssl_ctx_t ssl_ctx = ctx;
    tm_ssl_session_t ssl;
   // /* Try session resumption? */
   //  if (reconnect)
   //  {
   //      while (reconnect--)
   //      {
   //          ssl = ssl_client_new(ssl_ctx, client_fd, session_id,
   //                  sizeof(session_id));
   //          if ((res = ssl_handshake_status(ssl)) != SSL_OK)
   //          {
   //              if (!quiet)
   //              {
   //                  ssl_display_error(res);
   //              }

   //              ssl_free(ssl);
   //              exit(1);
   //          }

   //          display_session_id(ssl);
   //          memcpy(session_id, ssl_get_session_id(ssl), SSL_SESSION_ID_SIZE);

   //          if (reconnect)
   //          {
   //              ssl_free(ssl);
   //              SOCKET_CLOSE(client_fd);

   //              client_fd = socket(AF_INET, SOCK_STREAM, IPPROTO_TCP);
   //              connect(client_fd, (struct sockaddr *)&client_addr, 
   //                      sizeof(client_addr));
   //          }
   //      }
   //  }
   //  else
   //  {
        ssl = ssl_client_new(ssl_ctx, client_fd, NULL, 0);
    // }

    /* check the return status */
    if ((res = ssl_handshake_status(ssl)) != SSL_OK)
    {
        if (!quiet)
        {
            ssl_display_error(res);
        }

        return res;
    }

    if (!quiet)
    {
        const char *common_name = ssl_get_cert_dn(ssl,
                SSL_X509_CERT_COMMON_NAME);
        if (common_name)
        {
            TLS_DEBUG("Common Name:\t\t\t%s\n", common_name);
            int i = 0;
            while (1) {
                const char* altname = ssl_get_cert_subject_alt_dnsname(ssl, i);
                if (altname == NULL) {
                    break;
                }
                TLS_DEBUG("Altname %d:\t\t\t%s\n", i, altname);
                i += 1;
            }
        }

        display_session_id(ssl);
        display_cipher(ssl);
    }

    *session = ssl;

    return 0;
}

int tm_ssl_session_cn (tm_ssl_session_t* session, const char** cn)
{
    *cn = ssl_get_cert_dn(*session, SSL_X509_CERT_COMMON_NAME);
    if (*cn == NULL) {
        return 1;
    }
    return 0;
}

int tm_ssl_session_altname (tm_ssl_session_t* session, size_t index, const char** altname)
{
    *altname = ssl_get_cert_subject_alt_dnsname(*session, index);
    if (*altname == NULL) {
        return 1;
    }
    return 0;
}

int tm_ssl_session_free (tm_ssl_session_t *session)
{
    ssl_free(*session);
    return 0;
}


/**
 * Display what cipher we are using 
 */
static void display_cipher(tm_ssl_session_t ssl)
{
    TLS_DEBUG("CIPHER is ");
    switch (ssl_get_cipher_id(ssl))
    {
        case SSL_AES128_SHA:
            TLS_DEBUG("AES128-SHA");
            break;

        case SSL_AES256_SHA:
            TLS_DEBUG("AES256-SHA");
            break;

        case SSL_RC4_128_SHA:
            TLS_DEBUG("RC4-SHA");
            break;

        case SSL_RC4_128_MD5:
            TLS_DEBUG("RC4-MD5");
            break;

        default:
            TLS_DEBUG("Unknown - %d", ssl_get_cipher_id(ssl));
            break;
    }

    TLS_DEBUG("\n");
    TTY_FLUSH();
}

/**
 * Display what session id we have.
 */
static void display_session_id(tm_ssl_session_t ssl)
{    
    int i;
    const uint8_t *session_id = ssl_get_session_id(ssl);
    int sess_id_size = ssl_get_session_id_size(ssl);

    if (sess_id_size > 0)
    {
        TLS_DEBUG("-----BEGIN SSL SESSION PARAMETERS-----\n");
        for (i = 0; i < sess_id_size; i++)
        {
            TLS_DEBUG("%02x", session_id[i]);
        }

        TLS_DEBUG("\n-----END SSL SESSION PARAMETERS-----\n");
        TTY_FLUSH();
    }
}