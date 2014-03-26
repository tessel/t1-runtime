#include "time.h"

#include <stdlib.h>
#include <stdio.h>
#include <string.h>    //strlen
#include <sys/socket.h>
#include <arpa/inet.h> //inet_addr
#include <stdint.h>
#include <sys/time.h>
#include  <netdb.h>
#include <sys/types.h>
#include <sys/socket.h>

typedef int tm_socket_t;
// static int const TM_SOCKET_INVALID = 0;
#define TM_SOCKET_INVALID NULL

tm_socket_t tm_udp_open ();
tm_socket_t tm_tcp_open ();
int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port);
int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen);
int tm_tcp_readable (tm_socket_t sock);
int tm_tcp_listen (tm_socket_t sock, int port);
int tm_tcp_accept (tm_socket_t sock, uint32_t *ip);

tm_socket_t tm_udp_open ()
{
    return socket(AF_INET, SOCK_STREAM, 0);
}

tm_socket_t tm_tcp_open ()
{
    return socket(AF_INET, SOCK_STREAM, 0);
}

int tm_tcp_close (tm_socket_t sock)
{
    return shutdown(sock, SHUT_WR);
    // return close(sock);
}

uint32_t tm_hostname_lookup (const uint8_t *hostname)
{
  struct hostent *h;

  /* get the host info */
  if ((h = gethostbyname((const char *) hostname)) == NULL) {
    herror("gethostbyname(): ");
    return 0;
  }
  return ((struct in_addr *)h->h_addr)->s_addr;
}

int tm_tcp_connect (tm_socket_t sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, uint16_t port)
{
    struct sockaddr_in server;
    server.sin_addr.s_addr = htonl(ip0 << 24 | ip1 << 16 | ip2 << 8 | ip3); // inet_addr("74.125.235.20");
    server.sin_family = AF_INET;
    server.sin_port = htons(port);
    // printf("server: %p, %d, %d\n", server.sin_addr.s_addr, server.sin_family, server.sin_port);
    return connect(sock, (struct sockaddr *) &server, sizeof(server));
}

// http://publib.boulder.ibm.com/infocenter/iseries/v5r3/index.jsp?topic=%2Frzab6%2Frzab6xnonblock.htm

int tm_tcp_write (tm_socket_t sock, uint8_t *buf, size_t buflen)
{
    return send(sock, buf, buflen, 0);
}

int tm_tcp_read (tm_socket_t sock, uint8_t *buf, size_t buflen)
{
    return recv(sock, buf, buflen, 0);
}

int tm_tcp_readable (tm_socket_t sock)
{
    struct timeval tv;
    tv.tv_sec = 0;
    tv.tv_usec = 0;

    fd_set readset;
    FD_ZERO(&readset);
    FD_SET(sock, &readset);
    if (select(sock+1, &readset, NULL, NULL, &tv) <= 0) {
        return 0;
    }
    return FD_ISSET(sock, &readset);
}

int tm_tcp_listen (tm_socket_t sock, int port)
{
  // CC3000_START;

  struct sockaddr localSocketAddr;
  localSocketAddr.sa_family = AF_INET;
  localSocketAddr.sa_data[0] = (port & 0xFF00) >> 8; //ascii_to_char(0x01, 0x01);
  localSocketAddr.sa_data[1] = (port & 0x00FF); //ascii_to_char(0x05, 0x0c);
  localSocketAddr.sa_data[2] = 0;
  localSocketAddr.sa_data[3] = 0;
  localSocketAddr.sa_data[4] = 0;
  localSocketAddr.sa_data[5] = 0;

  // Bind socket
  // TM_COMMAND('w', "Binding local socket...");
  int sockStatus;
  if ((sockStatus = bind(sock, &localSocketAddr, sizeof(struct sockaddr))) != 0) {
    // TM_COMMAND('w', "binding failed: %d", sockStatus);
    // CC3000_END;
    return -1;
  }

  // TM_DEBUG("Listening on local socket...");
  int listenStatus = listen(sock, 1);
  if (listenStatus != 0) {
    // TM_COMMAND('w', "cannot listen to socket: %d", listenStatus);
    // CC3000_END;
    return -1;
  }

  // CC3000_END;
  return 0;
}

// Returns -1 on error or no socket.
// Returns -2 on pending connection.
// Returns >= 0 for socket descriptor.
int tm_tcp_accept (tm_socket_t sock, uint32_t *ip)
{
  struct sockaddr addrClient;
  socklen_t addrlen;
  int res = accept(sock, &addrClient, &addrlen);
  *ip = ((struct sockaddr_in *) &addrClient)->sin_addr.s_addr;
  return res;
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

    while (1) {
        while (!tm_tcp_readable(socket_desc)) {
            continue;
        }

        memset(server_reply, 0, 2000);
        int nread = 0;
        if ((nread = tm_tcp_read(socket_desc, server_reply, 2000)) <= 0) {
            puts("recv failed");
        } else {
            puts(server_reply);
        }
    }

    puts("DONE");
    return 0;
}