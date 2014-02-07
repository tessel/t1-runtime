#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "tm.h"


/**
 * Net
 */

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

/**
 * UDP
 */

tm_socket_t tm_udp_open ()
{
    return socket(AF_INET, SOCK_DGRAM, 0);
}

int tm_udp_close (int sock)
{
  return shutdown(sock, SHUT_WR) == 0 ? 0 : -errno;
}

int tm_udp_listen (int sock, int port)
{
  struct sockaddr_in localSocketAddr;
  localSocketAddr.sin_family = AF_INET;
  localSocketAddr.sin_addr.s_addr = htonl(INADDR_ANY);
  localSocketAddr.sin_port = htons(port);

  // Bind socket
  // TM_COMMAND('w', "Binding local socket...");
  int sockStatus;
  if ((sockStatus = bind(sock, (struct sockaddr *) &localSocketAddr, sizeof(localSocketAddr))) != 0) {
    // TM_DEBUG("binding failed: %d on port %d", sockStatus, port);
    // CC3000_END;
    return -1;
  }

  if (fcntl(sock, F_SETFL, O_NDELAY) < 0) {
    perror("Can't set socket to non-blocking");
    return -1;
  }
  
  return 0;
}

int tm_udp_receive (int sock, uint8_t *buf, unsigned long buf_len, uint32_t *ip)
{
  struct sockaddr from;
  socklen_t from_len;
  signed long ret = recvfrom(sock, buf, buf_len, 0, &from, &from_len);
  *ip = *((uint32_t *) &(from.sa_data[2]));
  return ret;
}

int tm_udp_readable (tm_socket_t sock)
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

int tm_udp_send (int sock, uint8_t ip0, uint8_t ip1, uint8_t ip2, uint8_t ip3, int port, uint8_t *buf, unsigned long buf_len)
{
  struct sockaddr_in tSocketAddr;
  tSocketAddr.sin_family = AF_INET;
  tSocketAddr.sin_addr.s_addr = htonl(ip0 << 24 | ip1 << 16 | ip2 << 8 | ip3);
  tSocketAddr.sin_port = htons(port);

  // CC3000_START
  int sent = sendto(sock, buf, buf_len, 0, (struct sockaddr *) &tSocketAddr, sizeof(tSocketAddr));
  // TM_DEBUG("sent %d with sock %d, %p len %d, to %d.%d.%d.%d:%d", sent, sock, buf, buf_len, ip0, ip1, ip2, ip3, port);
  // perror("WHAT: ");
  // CC3000_END;
  return sent;
}

/**
 * TCP
 */

tm_socket_t tm_tcp_open ()
{
    return socket(AF_INET, SOCK_STREAM, 0);
}

int tm_tcp_close (tm_socket_t sock)
{
    return shutdown(sock, SHUT_WR) == 0 ? 0 : -errno;
    // return close(sock);
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

int tm_tcp_listen (tm_socket_t sock, uint16_t port)
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

  if (fcntl(sock, F_SETFL, O_NDELAY) < 0) {
    perror("Can't set socket to non-blocking");
    return -1;
  }

  // CC3000_END;
  return 0;
}

// Returns -1 on error or no socket.
// Returns -2 on pending connection.
// Returns >= 0 for socket descriptor.
tm_socket_t tm_tcp_accept (tm_socket_t sock, uint32_t *ip)
{
  struct sockaddr addrClient;
  socklen_t addrlen;
  int res = accept(sock, &addrClient, &addrlen);
  *ip = ((struct sockaddr_in *) &addrClient)->sin_addr.s_addr;
  return res;
}