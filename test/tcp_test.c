#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>
#include <stdlib.h>

#include "tm.h"
#include "tm_uptime.h"
#include "tm_debug.h"
#include "time.h"

#include <stdio.h>
#include <string.h>    //strlen
#include <sys/socket.h>
#include <arpa/inet.h> //inet_addr
#include <stdint.h>
#include <sys/time.h>
#include  <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>


#include "http_parser.h"


int my_dummy_callback  (http_parser* paser) {
    puts("DUMMY");
}

int my_message_begin  (http_parser* paser) {
    puts("BEGIN MESSAGE");
    return 0;
}

int my_message_end  (http_parser* paser) {
    puts("END");
}

int my_headers_complete  (http_parser* paser) {
    puts("HEADERS END");
    return 0;
}

int my_status_complete  (http_parser* paser) {
    puts("STATUS COMPLETE");
    return 0;
}

int my_url_callback  (http_parser* paser, const char *at, size_t length) {
    puts("URL");
}

int my_header_field_callback  (http_parser* parser, const char *at, size_t length) {
    printf("HEADER: %.*s\n", length, at);
    return 0;
}

int my_body_callback  (http_parser* parser, const char *at, size_t length) {
    printf("BODY .");
    return 0;
}
 
int main(int argc , char *argv[])
{
    tm_socket_t socket_desc;
    char *message , server_reply[2000];
     
    // Create socket
    socket_desc = tm_tcp_open();
    if (socket_desc == TM_SOCKET_INVALID) {
        printf("Could not create socket");
        return 1;
    }

    if (tm_tcp_connect(socket_desc, 74, 125, 235, 20, 80) < 0) {
        puts("connect error");
        return 1;
    }
     
    // Send some data
    message = "GET / HTTP/1.1\r\n\r\n";
    if (tm_tcp_write(socket_desc, message, strlen(message)) < 0) {
        puts("Send failed");
        return 1;
    }

    http_parser_settings settings;
    settings.on_url = my_url_callback;
    settings.on_message_begin = my_message_begin;
    settings.on_status_complete = my_status_complete;
    settings.on_header_field = my_header_field_callback;
    settings.on_header_value = my_header_field_callback;
    settings.on_headers_complete = my_headers_complete;
    settings.on_body = my_body_callback;
    settings.on_message_complete = my_message_end;
    /* ... */

    http_parser *parser = malloc(sizeof(http_parser));
    http_parser_init(parser, HTTP_RESPONSE);
    parser->data = &server_reply;

    while (1) {
        while (!tm_tcp_readable(socket_desc)) {
            continue;
        }

        memset(server_reply, 0, 2000);
        int nread = 0;
        if ((nread = tm_tcp_read(socket_desc, server_reply, 2000)) <= 0) {
            puts("recv failed");
        } else {
            int nparsed = http_parser_execute(parser, &settings, server_reply, nread);
            // puts(server_reply);
            // printf("Parsed: %d of %d\n", nparsed, nread);

            if (parser->upgrade) {
              /* handle new protocol */
                puts("UPGRADE");
            } else if (nparsed != nread) {
              /* Handle error. Usually just close the connection. */
                puts("ERROR");
                break;
            }
        }
    }

    puts("DONE");
    return 0;
}