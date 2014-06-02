// Copyright 2014 Technical Machine, Inc. See the COPYRIGHT
// file at the top-level directory of this distribution.
//
// Licensed under the Apache License, Version 2.0 <LICENSE-APACHE or
// http://www.apache.org/licenses/LICENSE-2.0> or the MIT license
// <LICENSE-MIT or http://opensource.org/licenses/MIT>, at your
// option. This file may not be copied, modified, or distributed
// except according to those terms.

#include <tm.h>

// https://groups.google.com/forum/#!topic/comp.lang.c/IyWWejPrgts

#define itoa_numorchar(A) ((A) > 9 ? 'a' + ((A) - 10) : '0' + (A))

char* tm_itoa (long long i, char *s, unsigned int radix)
{
  char *p = s;
  char *q = s;

  if (i >= 0) {
    do {
      *q++ = itoa_numorchar(i % radix);
    }
    while (i /= radix);
  } else if (-1 % 2 < 0) {
    *q++ = '-';
    p++;

    do {
      *q++ = itoa_numorchar(i % radix);
    } while (i /= radix);
  } else {
    *q++ = '-';
    p++;

    do {
      int d = i % radix;
      i = i / radix;
      if (d) { i++; d = radix - d; }
      *q++ = itoa_numorchar(d);
    } while (i);
  }

  for (*q = 0; p < --q; p++) {
    char c = *p;
    *p = *q;
    *q = c;
  }

  return s;
}