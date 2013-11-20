#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

#include "regalone.h"
#include "regex.h"

#ifdef REGEX_WCHAR
# define chr  wchar_t
# define re_comp  re_wcomp
# define re_exec  re_wexec
#else
# define chr  char
#endif

static int l_regex_create (lua_State* L)
{
  regex_t* cre = (regex_t*) lua_newuserdata(L, sizeof(regex_t));
  memset(cre, 0, sizeof(regex_t));
  return 1;
}

static int l_regex_nsub (lua_State* L)
{
  regex_t* cre = (regex_t*) lua_touserdata(L, 1);

  lua_pushnumber(L, cre->re_nsub);
  return 1;
}

static int l_regmatch_create (lua_State* L)
{
  size_t n = (size_t) lua_tonumber(L, 1);

  regmatch_t* pmatch = (regmatch_t*) lua_newuserdata(L, sizeof(regmatch_t) * n);
  memset(pmatch, 0, sizeof(regmatch_t) * n);
  return 1;
}

static int l_regmatch_so (lua_State* L)
{
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, 1);
  size_t n = (size_t) lua_tonumber(L, 2);

  lua_pushnumber(L, pmatch[n].rm_so);
  return 1;
}

static int l_regmatch_eo (lua_State* L)
{
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, 1);
  size_t n = (size_t) lua_tonumber(L, 2);

  lua_pushnumber(L, pmatch[n].rm_eo);
  return 1;
}

static size_t hexescapes2bin(chr *t, char *src, size_t mxlen)
{
  char  *s, *xs;
  size_t  len;
  s = xs = src;
  len = 0;
  while ( (s = strstr(s, "\\x")) )
  {
    int cbin;
    sscanf(&s[2], "%2x", &cbin);
#   ifdef REGEX_WCHAR
      *s = '\0';
      len += mbstowcs(&t[len], xs, mxlen-len);
#   else
      memcpy(&t[len], xs, (size_t ) (s-xs));
      len += (size_t ) (s-xs);
#   endif
    t[len++] = cbin;
    s += 4;
    xs = s;
  }
# ifdef REGEX_WCHAR
    len += mbstowcs(&t[len], xs, mxlen-len);
# else
    strcpy(&t[len], xs);
    len += strlen(xs);
# endif
  return len;
}

static const wchar_t* lua_tomultibytelstring (lua_State* L, int pos, size_t* buflen)
{
  size_t len;
  const char *patt = lua_tolstring(L, pos, &len);
  char *oldbuf = (char *) malloc(len + 1);
  memcpy(oldbuf, patt, len);
  wchar_t *buf = (wchar_t *) lua_newuserdata(L, (len + 1) * sizeof(chr));
  memset(buf, 0, (len + 1) * sizeof(chr));
  // wchar_t *buf = (wchar_t *) malloc((len + 1) * sizeof(chr));
  // lua_pushlightuserdata(L, buf);
  *buflen = hexescapes2bin(buf, oldbuf, len);
  free(oldbuf);
  return buf;
}

static int l_re_comp (lua_State* L)
{
  size_t pattlen;
  regex_t* cre = (regex_t*) lua_touserdata(L, 1);
  int flags = (int) lua_tonumber(L, 3);

  const wchar_t* patt = lua_tomultibytelstring(L, 2, &pattlen);
  int rc = re_comp(cre, patt, pattlen, flags);
  lua_pushnumber(L, rc);
  return 2;
}

static int l_re_exec (lua_State* L)
{
  size_t datalen;
  regex_t* cre = (regex_t*) lua_touserdata(L, 1);
  // ignore 3
  int pmatchlen = (int) lua_tonumber(L, 4);
  regmatch_t* pmatch = (regmatch_t*) lua_touserdata(L, 5);
  int flags = (int) lua_tonumber(L, 6);

  const wchar_t* data = lua_tomultibytelstring(L, 2, &datalen);
  int rc = re_exec(cre, data, datalen, NULL, pmatchlen, pmatch, 0);
  lua_pushnumber(L, rc);
  return 2;
}

static int l_regerror (lua_State* L)
{
  int rc = (int) lua_tonumber(L, 1);
  regex_t* cre = (regex_t*) lua_touserdata(L, 2);
  
  char buf[1024] = { 0 };
  regerror(rc, cre, buf, sizeof(buf));
  lua_pushstring(L, buf);
  return 1;
}

static int l_regfree (lua_State* L)
{
  regfree(lua_touserdata(L, 1));
  return 0;
}

/**
 * Load evinrude.
 */

#define luaL_setfieldnumber(L, str, num) lua_pushnumber (L, num); lua_setfield (L, -2, str);

LUALIB_API int luaopen_hsregex (lua_State *L)
{
  lua_newtable (L);
  luaL_register(L, NULL, (luaL_reg[]) {

    { "regex_create", l_regex_create },
    { "regex_nsub", l_regex_nsub },
    { "regmatch_create", l_regmatch_create },
    { "regmatch_so", l_regmatch_so },
    { "regmatch_eo", l_regmatch_eo },
    { "re_comp", l_re_comp },
    { "re_exec", l_re_exec },
    { "regerror", l_regerror },
    { "regfree", l_regfree },

    { NULL, NULL }
  });
  luaL_setfieldnumber(L, "ADVANCED", REG_ADVANCED);
  luaL_setfieldnumber(L, "NOSUB", REG_NOSUB);
  return 1;
}
