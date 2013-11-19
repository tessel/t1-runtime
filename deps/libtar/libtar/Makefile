# libtar/Makefile.  Generated from Makefile.in by configure.

### Path settings
srcdir		= .
top_srcdir	= ..
top_builddir    = ..
prefix		= /usr/local
exec_prefix	= ${prefix}
bindir		= ${exec_prefix}/bin
libdir		= ${exec_prefix}/lib
includedir	= ${prefix}/include
datarootdir	= ${prefix}/share

PACKAGE_NAME	= libtar
PACKAGE_VERSION	= 1.2.20



SHELL           = /bin/sh

### Installation programs and flags
INSTALL		= /usr/bin/install -c
INSTALL_PROGRAM	= ${INSTALL} -s
INSTALL_DATA	= ${INSTALL} -m 644
LN_S		= ln -s
MKDIR		= mkdir -p -m 755

### Compiler and link options
CC		= gcc
LIBTOOL         = $(SHELL) $(top_builddir)/libtool
CPPFLAGS	= -I.. \
		  -I../lib \
		  -I../listhash \
		  -I${top_srcdir}/lib \
		  -I${top_srcdir}/compat \
		  
CFLAGS		= -g -O2
LDFLAGS		= 
LIBS		= -lz  -ltar
LIBOBJS		= 
RANLIB		= ranlib




### Makefile rules - no user-servicable parts below

LIBTAR_OBJS	= libtar.lo
LIBTAR_HDRS	= ../config.h \
		  ${top_srcdir}/compat/compat.h \
		  ${top_srcdir}/lib/libtar.h \
		  ../listhash/libtar_listhash.h
LIBTAR_LIBS	= $(top_builddir)/lib
ALL		= libtar


all: ${ALL}

.PHONY: clean distclean install

libtar: ${LIBTAR_OBJS} ${LIBTAR_LIBS} ${LIBTAR_HDRS}
	$(LIBTOOL) --mode=link ${CC} ${CFLAGS} ${LDFLAGS} -o libtar $(LIBTAR_OBJS) -L${LIBTAR_LIBS} ${LIBS}

${LIBTAR_OBJS}: ${LIBTAR_HDRS}

%.lo: %.c
	$(LIBTOOL) --mode=compile ${CC} ${CFLAGS} ${CPPFLAGS} -c -o $@ $<

clean:
	rm -rf *~ *.o ${ALL} $(LIBTAR_OBJS) core .libs

distclean: clean
	rm -f Makefile

install: ${ALL}
	${MKDIR} ${DESTDIR}${bindir}
	$(LIBTOOL) --mode=install ${INSTALL_PROGRAM} libtar ${DESTDIR}${bindir}

