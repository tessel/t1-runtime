#include "greatest.h"

#define GREATEST_ASSERT_BUF_EQ(EXP, GOT) GREATEST_ASSERT_BUF_EQm(#EXP " != " #GOT, EXP, GOT)
#define GREATEST_ASSERT_BUF_N_EQ(EXP, GOT, LEN) GREATEST_ASSERT_BUF_N_EQm(#EXP " != " #GOT, EXP, GOT, LEN)

#define GREATEST_ASSERT_BUF_EQm(MSG, EXP, GOT) GREATEST_ASSERT_BUF_N_EQm(MSG, EXP, GOT, sizeof(EXP))

#define GREATEST_ASSERT_BUF_N_EQm(MSG, EXP, GOT, LEN)                   \
    do {                                                                \
        const char *exp_s = (const char*) (EXP);                        \
        const char *got_s = (const char*) (GOT);                        \
        int i = 0;                                                      \
        greatest_info.msg = MSG;                                        \
        greatest_info.fail_file = __FILE__;                             \
        greatest_info.fail_line = __LINE__;                             \
        for (i = 0; i < LEN; i++) {                                     \
            if (exp_s[i] != got_s[i]) {                                 \
                fprintf(GREATEST_STDOUT,                                \
                    "Expected:\tbuf[%d] == 0x%02X\n", i, EXP[i]);       \
                fprintf(GREATEST_STDOUT,                                \
                    "Got:     \tbuf[%d] == 0x%02X\n", i, GOT[i]);       \
                return -1;                                              \
            }                                                           \
        }                                                               \
        greatest_info.msg = NULL;                                       \
    } while (0)

#if GREATEST_USE_ABBREVS
#define ASSERT_BUF_EQ  GREATEST_ASSERT_BUF_EQ
#define ASSERT_BUF_EQm GREATEST_ASSERT_BUF_EQm
#define ASSERT_BUF_N_EQ  GREATEST_ASSERT_BUF_N_EQ
#define ASSERT_BUF_N_EQm GREATEST_ASSERT_BUF_N_EQm
#endif
