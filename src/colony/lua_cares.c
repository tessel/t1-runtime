// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>
#include <string.h>
#include <ctype.h>
#include <sys/time.h>
#include <unistd.h>
#include <ares.h>
#include <tm.h>
#ifndef COLONY_EMBED
#include <arpa/inet.h>
#include <netinet/in.h>
#include <netdb.h>
#else
#include <cc3000.h>
#endif

#define INET6_ADDRSTRLEN 46

uint8_t ipaddr[4] = { 0 };
uint32_t ip_dns = 0;
 
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
        fd_set read_fds, write_fds, err_fds;
        int nfds;
 
        FD_ZERO(&read_fds);
        FD_ZERO(&write_fds);
        FD_ZERO(&err_fds);
        nfds = ares_fds(channel, &read_fds, &write_fds);
        if (nfds == 0){
            return;
        }
        memcpy(&err_fds, &read_fds, sizeof(read_fds));
        tvp = ares_timeout(channel, NULL, &tv);
        select(nfds, &read_fds, &write_fds, &err_fds, tvp);
        for (int i = 0; i < nfds; i++) {
            if (FD_ISSET(i, &err_fds)) {
                return;
            }
        }
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

    // check cache of old dns server
    // if it isn't there, get the new dns server
    if (ip_dns == 0) {
        ip_dns = tm_net_dnsserver();
    }

    if (ip_dns == 0) {
        // error not connected
        return 1;
    }
    char str_dns[16] = {0}; // length of 255.255.255.255 + 1
    sprintf(str_dns, "%d.%d.%d.%d", (uint8_t)TM_BYTE(ip_dns, 3), (uint8_t)TM_BYTE(ip_dns, 2), (uint8_t)TM_BYTE(ip_dns, 1), (uint8_t)TM_BYTE(ip_dns, 0));
    
    inet_aton(str_dns, &ns1);
 
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
