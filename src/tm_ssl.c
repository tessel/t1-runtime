#include <tm.h>

#include <os_port.h>
#include <ssl.h>

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

int tm_ssl_context_create (tm_ssl_ctx_t* ctx)
{
    int i = 0;
    // uint16_t port = 4433;
    uint32_t options = SSL_SERVER_VERIFY_LATER|SSL_DISPLAY_CERTS;
    // int client_fd;
    char *private_key_file = NULL;
    // sockaddr_in_t client_addr;
    // // struct hostent *hostent;
    // int reconnect = 0;
    // uint32_t sin_addr;
    SSL_CTX *ssl_ctx;
    // SSL *ssl = NULL;
    // int quiet = 0;
    int cert_index = 0, ca_cert_index = 0;
    int cert_size = 0, ca_cert_size = 0;
    char **ca_cert, **cert;
    // uint8_t session_id[SSL_SESSION_ID_SIZE];
    // fd_set read_set;
    const char *password = NULL;

    // FD_ZERO(&read_set);
    // sin_addr = htonl(127 << 24 | 0 << 16 | 0 << 8 | 1);
    // cert_size = ssl_get_config(SSL_MAX_CERT_CFG_OFFSET);
    ca_cert_size = ssl_get_config(SSL_MAX_CA_CERT_CFG_OFFSET);
    ca_cert = (char **)calloc(1, sizeof(char *)*ca_cert_size);
    cert = (char **)calloc(1, sizeof(char *)*cert_size);

    if ((ssl_ctx = ssl_ctx_new(options, SSL_DEFAULT_CLNT_SESS)) == NULL)
    {
        TM_DEBUG("Error: Client context is invalid\n");
        return 1;
    }

    if (private_key_file)
    {
        int obj_type = SSL_OBJ_RSA_KEY;
        
        /* auto-detect the key type from the file extension */
        if (strstr(private_key_file, ".p8"))
            obj_type = SSL_OBJ_PKCS8;
        else if (strstr(private_key_file, ".p12"))
            obj_type = SSL_OBJ_PKCS12;

        if (ssl_obj_load(ssl_ctx, obj_type, private_key_file, password))
        {
            TM_DEBUG("Error: Private key '%s' is undefined.\n", 
                                                        private_key_file);
            return 1;
        }
    }

    for (i = 0; i < cert_index; i++)
    {
        if (ssl_obj_load(ssl_ctx, SSL_OBJ_X509_CERT, cert[i], NULL))
        {
            TM_DEBUG("Certificate '%s' is undefined.\n", cert[i]);
            return 1;
        }
    }

    for (i = 0; i < ca_cert_index; i++)
    {
        if (ssl_obj_load(ssl_ctx, SSL_OBJ_X509_CACERT, ca_cert[i], NULL))
        {
            TM_DEBUG("Certificate '%s' is undefined.\n", ca_cert[i]);
            return 1;
        }
    }

    free(cert);
    free(ca_cert);

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

        return 1;
    }

    if (!quiet)
    {
        const char *common_name = ssl_get_cert_dn(ssl,
                SSL_X509_CERT_COMMON_NAME);
        if (common_name)
        {
            printf("Common Name:\t\t\t%s\n", common_name);
        }

        display_session_id(ssl);
        display_cipher(ssl);
    }

    *session = ssl;

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
    printf("CIPHER is ");
    switch (ssl_get_cipher_id(ssl))
    {
        case SSL_AES128_SHA:
            printf("AES128-SHA");
            break;

        case SSL_AES256_SHA:
            printf("AES256-SHA");
            break;

        case SSL_RC4_128_SHA:
            printf("RC4-SHA");
            break;

        case SSL_RC4_128_MD5:
            printf("RC4-MD5");
            break;

        default:
            printf("Unknown - %d", ssl_get_cipher_id(ssl));
            break;
    }

    printf("\n");
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
        printf("-----BEGIN SSL SESSION PARAMETERS-----\n");
        for (i = 0; i < sess_id_size; i++)
        {
            printf("%02x", session_id[i]);
        }

        printf("\n-----END SSL SESSION PARAMETERS-----\n");
        TTY_FLUSH();
    }
}