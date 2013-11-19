# doc/Makefile.  Generated from Makefile.in by configure.

### Path settings
srcdir		= .
top_srcdir	= ..
prefix		= /usr/local
exec_prefix	= ${prefix}
bindir		= ${exec_prefix}/bin
mandir		= ${datarootdir}/man
libdir		= ${exec_prefix}/lib
includedir	= ${prefix}/include
datarootdir	= ${prefix}/share

PACKAGE_NAME	= libtar
PACKAGE_VERSION	= 1.2.20



### Installation programs and flags
INSTALL		= /usr/bin/install -c
INSTALL_PROGRAM	= ${INSTALL} -s
INSTALL_DATA	= ${INSTALL} -m 644
LN_S		= ln -s
MKDIR		= mkdir -p -m 755



### Makefile rules - no user-servicable parts below

TAR_OPEN_SO		= tar_fdopen \
			  tar_fd \
			  tar_close
TAR_APPEND_FILE_SO	= tar_append_eof \
			  tar_append_regfile
TAR_BLOCK_READ_SO	= tar_block_write
TH_READ_SO		= th_write
TH_SET_FROM_STAT_SO	= th_finish \
			  th_set_device \
			  th_set_group \
			  th_set_link \
			  th_set_mode \
			  th_set_path \
			  th_set_type \
			  th_set_user
TAR_EXTRACT_FILE_SO	= tar_extract_blockdev \
			  tar_extract_chardev \
			  tar_extract_dir \
			  tar_extract_fifo \
			  tar_extract_hardlink \
			  tar_extract_regfile \
			  tar_extract_symlink \
			  tar_skip_regfile \
			  tar_set_file_perms
TH_GET_PATHNAME_SO	= TH_ISBLK \
			  TH_ISCHR \
			  TH_ISDIR \
			  TH_ISFIFO \
			  TH_ISLNK \
			  TH_ISLONGLINK \
			  TH_ISLONGNAME \
			  TH_ISREG \
			  TH_ISSYM \
			  th_get_crc \
			  th_get_devmajor \
			  th_get_devminor \
			  th_get_gid \
			  th_get_linkname \
			  th_get_mode \
			  th_get_mtime \
			  th_get_size \
			  th_get_uid
TH_PRINT_LONG_LS_SO	= th_print
TAR_EXTRACT_ALL_SO	= tar_extract_glob \
			  tar_append_tree
libtar_HASH_NEW_SO = \
			  libtar_hash_free \
			  libtar_hash_next \
			  libtar_hash_prev \
			  libtar_hash_search \
			  libtar_hash_add \
			  libtar_hash_getkey \
			  libtar_hash_del
libtar_LIST_NEW_SO = \
			  libtar_list_free \
			  libtar_list_next \
			  libtar_list_prev \
			  libtar_list_search \
			  libtar_list_add \
			  libtar_list_add_str \
			  libtar_list_del \
			  libtar_list_dup \
			  libtar_list_merge

DISTCLEANFILES		= ../listhash/libtar_hash_new.3 \
			  ../listhash/libtar_list_new.3


all:

.PHONY: clean distclean install

clean:

distclean: clean
	rm -f Makefile ${DISTCLEANFILES}

install: all
	${MKDIR} ${DESTDIR}${mandir}/man3
	${INSTALL_DATA} ${srcdir}/tar_open.3 ${DESTDIR}${mandir}/man3
	for i in ${TAR_OPEN_SO}; do \
		echo ".so man3/tar_open.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/tar_append_file.3 ${DESTDIR}${mandir}/man3
	for i in ${TAR_APPEND_FILE_SO}; do \
		echo ".so man3/tar_append_file.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/tar_block_read.3 ${DESTDIR}${mandir}/man3
	for i in ${TAR_BLOCK_READ_SO}; do \
		echo ".so man3/tar_block_read.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/th_read.3 ${DESTDIR}${mandir}/man3
	for i in ${TH_READ_SO}; do \
		echo ".so man3/th_read.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/th_set_from_stat.3 ${DESTDIR}${mandir}/man3
	for i in ${TH_SET_FROM_STAT_SO}; do \
		echo ".so man3/th_set_from_stat.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/tar_extract_file.3 ${DESTDIR}${mandir}/man3
	for i in ${TAR_EXTRACT_FILE_SO}; do \
		echo ".so man3/tar_extract_file.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/th_get_pathname.3 ${DESTDIR}${mandir}/man3
	for i in ${TH_GET_PATHNAME_SO}; do \
		echo ".so man3/th_get_pathname.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/th_print_long_ls.3 ${DESTDIR}${mandir}/man3
	for i in ${TH_PRINT_LONG_LS_SO}; do \
		echo ".so man3/th_print_long_ls.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ${srcdir}/tar_extract_all.3 ${DESTDIR}${mandir}/man3
	for i in ${TAR_EXTRACT_ALL_SO}; do \
		echo ".so man3/tar_extract_all.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ../listhash/libtar_hash_new.3 ${DESTDIR}${mandir}/man3
	for i in ${libtar_HASH_NEW_SO}; do \
		echo ".so man3/libtar_hash_new.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done
	${INSTALL_DATA} ../listhash/libtar_list_new.3 ${DESTDIR}${mandir}/man3
	for i in ${libtar_LIST_NEW_SO}; do \
		echo ".so man3/libtar_list_new.3" > ${DESTDIR}${mandir}/man3/$${i}.3; \
	done

