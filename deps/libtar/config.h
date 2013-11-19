/* config.h.  Generated from config.h.in by configure.  */
/* config.h.in.  Generated from configure.ac by autoheader.  */

/* Define if your system has a working basename */
#define HAVE_BASENAME 1

/* Define to 1 if you have the <ctype.h> header file. */
/* #undef HAVE_CTYPE_H */

/* Define to 1 if the system has the type `dev_t'. */
#define HAVE_DEV_T 1

/* Define if your system has a working dirname */
#define HAVE_DIRNAME 1

/* Define to 1 if you have the <dlfcn.h> header file. */
#define HAVE_DLFCN_H 1

/* Define to 1 if your system has a working POSIX `fnmatch' function. */
#define HAVE_FNMATCH 1

/* Define to 1 if you have the <fnmatch.h> header file. */
#define HAVE_FNMATCH_H 1

/* Define to 1 if you have the <inttypes.h> header file. */
#define HAVE_INTTYPES_H 1

/* Define to 1 if you have the `lchown' function. */
#define HAVE_LCHOWN 1

/* Define to 1 if you have the <libgen.h> header file. */
#define HAVE_LIBGEN_H 1

/* Define to 1 if you have the `z' library (-lz). */
#define HAVE_LIBZ 1

/* Define to 1 if the system has the type `major_t'. */
/* #undef HAVE_MAJOR_T */

/* Define to 1 if you have the <memory.h> header file. */
#define HAVE_MEMORY_H 1

/* Define to 1 if the system has the type `minor_t'. */
/* #undef HAVE_MINOR_T */

/* Define to 1 if the system has the type `nlink_t'. */
#define HAVE_NLINK_T 1

/* Define if your system has a working snprintf */
#define HAVE_SNPRINTF 1

/* Define to 1 if the system has the type `socklen_t'. */
#define HAVE_SOCKLEN_T 1

/* Define to 1 if you have the <stdint.h> header file. */
#define HAVE_STDINT_H 1

/* Define to 1 if you have the <stdlib.h> header file. */
#define HAVE_STDLIB_H 1

/* Define if you have the strdup function */
#define HAVE_STRDUP 1

/* Define to 1 if you have the `strftime' function. */
#define HAVE_STRFTIME 1

/* Define to 1 if you have the <strings.h> header file. */
#define HAVE_STRINGS_H 1

/* Define to 1 if you have the <string.h> header file. */
#define HAVE_STRING_H 1

/* Define if you have the strlcpy function */
#define HAVE_STRLCPY 1

/* Define if you have the strmode function */
#define HAVE_STRMODE 1

/* Define if you have the strsep function */
#define HAVE_STRSEP 1

/* Define to 1 if you have the <sys/stat.h> header file. */
#define HAVE_SYS_STAT_H 1

/* Define to 1 if you have the <sys/types.h> header file. */
#define HAVE_SYS_TYPES_H 1

/* Define to 1 if the system has the type `uint64_t'. */
#define HAVE_UINT64_T 1

/* Define to 1 if you have the <unistd.h> header file. */
#define HAVE_UNISTD_H 1

/* Define to the sub-directory in which libtool stores uninstalled libraries.
   */
#define LT_OBJDIR ".libs/"

/* Define to 1 if `major', `minor', and `makedev' are declared in <mkdev.h>.
   */
/* #undef MAJOR_IN_MKDEV */

/* Define to 1 if `major', `minor', and `makedev' are declared in
   <sysmacros.h>. */
/* #undef MAJOR_IN_SYSMACROS */

/* Define as 1 if makedev expects three arguments */
/* #undef MAKEDEV_THREE_ARGS */

/* Define if you want to use the basename function */
#define NEED_BASENAME 1

/* Define if you want to use the dirname function */
#define NEED_DIRNAME 1

/* Define if you want to use the fnmatch function */
#define NEED_FNMATCH 1

/* Define if you want to use the makedev function */
#define NEED_MAKEDEV 1

/* Define if you want to use the snprintf function */
#define NEED_SNPRINTF 1

/* Define if you want to use the strdup function */
#define NEED_STRDUP 1

/* Define if you want to use the strlcpy function */
#define NEED_STRLCPY 1

/* Define if you want to use the strmode function */
#define NEED_STRMODE 1

/* Define if you want to use the strsep function */
#define NEED_STRSEP 1

/* Name of package */
#define PACKAGE "libtar"

/* Define to the address where bug reports for this package should be sent. */
#define PACKAGE_BUGREPORT ""

/* Define to the full name of this package. */
#define PACKAGE_NAME "libtar"

/* Define to the full name and version of this package. */
#define PACKAGE_STRING "libtar 1.2.20"

/* Define to the one symbol short name of this package. */
#define PACKAGE_TARNAME "libtar"

/* Define to the home page for this package. */
#define PACKAGE_URL ""

/* Define to the version of this package. */
#define PACKAGE_VERSION "1.2.20"

/* Define to 1 if you have the ANSI C header files. */
#define STDC_HEADERS 1

/* If the compiler supports a TLS storage class define it to that here */
#define TLS __thread

/* Enable extensions on AIX 3, Interix.  */
#ifndef _ALL_SOURCE
# define _ALL_SOURCE 1
#endif
/* Enable GNU extensions on systems that have them.  */
#ifndef _GNU_SOURCE
# define _GNU_SOURCE 1
#endif
/* Enable threading extensions on Solaris.  */
#ifndef _POSIX_PTHREAD_SEMANTICS
# define _POSIX_PTHREAD_SEMANTICS 1
#endif
/* Enable extensions on HP NonStop.  */
#ifndef _TANDEM_SOURCE
# define _TANDEM_SOURCE 1
#endif
/* Enable general extensions on Solaris.  */
#ifndef __EXTENSIONS__
# define __EXTENSIONS__ 1
#endif


/* Version number of package */
#define VERSION "1.2.20"

/* Define to 1 if on MINIX. */
/* #undef _MINIX */

/* Define to 2 if the system does not provide POSIX.1 features except with
   this defined. */
/* #undef _POSIX_1_SOURCE */

/* Define to 1 if you need to in order for `stat' and other things to work. */
/* #undef _POSIX_SOURCE */

/* Define to empty if `const' does not conform to ANSI C. */
/* #undef const */

/* Define to `unsigned long' if not defined in system header files. */
/* #undef dev_t */

/* Define to `int' if <sys/types.h> doesn't define. */
/* #undef gid_t */

/* Define to `unsigned int' if not defined in system header files. */
#define major_t unsigned int

/* Define to `unsigned int' if not defined in system header files. */
#define minor_t unsigned int

/* Define to `int' if <sys/types.h> does not define. */
/* #undef mode_t */

/* Define to `unsigned short' if not defined in system header files. */
/* #undef nlink_t */

/* Define to `long int' if <sys/types.h> does not define. */
/* #undef off_t */

/* Define to `unsigned int' if <sys/types.h> does not define. */
/* #undef size_t */

/* Define to `unsigned long' if not defined in system header files. */
/* #undef socklen_t */

/* Define to `int' if <sys/types.h> doesn't define. */
/* #undef uid_t */

/* Define to `long long' if not defined in system header files. */
/* #undef uint64_t */
