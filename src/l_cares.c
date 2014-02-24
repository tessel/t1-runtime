
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <ctype.h>
#include <sys/time.h>
#include <unistd.h>
#include <ares.h>
#ifndef COLONY_EMBED
#include <arpa/inet.h>
#include <netinet/in.h>
#include <netdb.h>
#else
#include <cc3000.h>
#endif

#define INET6_ADDRSTRLEN 46

uint8_t ipaddr[4] = { 0 };
 
static void
state_cb(void *data, int s, int read, int write)
{
    (void) data;
    (void) s;
    (void) read;
    (void) write;
    // printf("Change state fd %d read:%d write:%d\n", s, read, write);
}
 
 
static void
callback(void *arg, int status, int timeouts, struct hostent *host)
{
    (void) arg;
    (void) timeouts;

    if(!host || status != ARES_SUCCESS){
        printf("Failed to lookup %s\n", ares_strerror(status));
        return;
    }
 
    // printf("Found address name %s\n", host->h_name);
    int i = 0;
 
    for (i = 0; host->h_addr_list[i]; ++i) {
        const uint8_t *ap = (const uint8_t *)&(*(struct in_addr *) host->h_addr_list[i]).s_addr;
        // printf("%d.%d.%d.%d\n", ap[0], ap[1], ap[2], ap[3]);
        ipaddr[0] = ap[0];
        ipaddr[1] = ap[1];
        ipaddr[2] = ap[2];
        ipaddr[3] = ap[3];
        break;
    }
}
 
static void
wait_ares(ares_channel channel)
{
    for(;;){
        struct timeval *tvp, tv;
        fd_set read_fds, write_fds;
        int nfds;
 
        FD_ZERO(&read_fds);
        FD_ZERO(&write_fds);
        nfds = ares_fds(channel, &read_fds, &write_fds);
        if(nfds == 0){
            break;
        }
        tvp = ares_timeout(channel, NULL, &tv);
        select(nfds, &read_fds, &write_fds, NULL, tvp);
        ares_process(channel, &read_fds, &write_fds);
    }
}
 
// Bad synchronous gethostbyname demo
uint32_t tm__sync_gethostbyname (const char *domain)
{
    ares_channel channel;
    int status;
    struct ares_options options;
    int optmask = 0;

    ipaddr[0] = ipaddr[1] = ipaddr[2] = ipaddr[3] = 0;

    struct in_addr ns1;

    inet_aton("8.8.8.8",&ns1);
 
    status = ares_library_init(ARES_LIB_INIT_ALL);
    if (status != ARES_SUCCESS){
        printf("ares_library_init: %s\n", ares_strerror(status));
        return 1;
    }
    options.servers = &ns1;
    options.nservers = 1;
    optmask |= ARES_OPT_SERVERS;
    options.sock_state_cb = state_cb;
    // options.sock_state_cb_data;
    optmask |= ARES_OPT_SOCK_STATE_CB;
 
    status = ares_init_options(&channel, &options, optmask);
    if(status != ARES_SUCCESS) {
        printf("ares_init_options: %s\n", ares_strerror(status));
        return 1;
    }
 
    ares_gethostbyname(channel, domain, AF_INET, callback, NULL);
    wait_ares(channel);
    ares_destroy(channel);
    ares_library_cleanup();
    // printf("fin\n");
    // printf("result => %d.%d.%d.%d\n", ipaddr[0], ipaddr[1], ipaddr[2], ipaddr[3]);

    return (ipaddr[0] << 24) | (ipaddr[1] << 16) | (ipaddr[2] << 8) | ipaddr[3];
}