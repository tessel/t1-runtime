

local _JS = require('colony-lib');
local string, math, print, type, pairs = nil, nil, nil, nil, nil;
local this, global, Object, Array, String, Math, require, console = _JS.this, _JS.global, _JS.Object, _JS.Array, _JS.String, _JS.Math, _JS.require, _JS.console;
local _module = {exports={}}; local exports = _module.exports;

if (_JS._func(function (this, root, factory)
if ("use strict") then end;
if _JS._truthy((_JS._typeof(define) == ("function")) and define.amd) then
if define(global, _JS._arr({[0]=("exports")}), factory) then end;
else
if (_JS._typeof(exports) ~= ("undefined")) then
if factory(global, exports) then end;
else
if factory(global, (function () local _r = _JS._obj({
  }); root.esprima = _r; return _r; end)()) then end;
end
end
end)(global, this, _JS._func(function (this, exports)
local Token, TokenName, FnExprTokens, Syntax, PropertyKind, Messages, Regex, SyntaxTreeDelegate, source, strict, index, lineNumber, lineStart, length, delegate, lookahead, state, extra, assert, isDecimalDigit, isHexDigit, isOctalDigit, isWhiteSpace, isLineTerminator, isIdentifierStart, isIdentifierPart, isFutureReservedWord, isStrictModeReservedWord, isRestrictedWord, isKeyword, skipComment, scanHexEscape, getEscapedIdentifier, getIdentifier, scanIdentifier, scanPunctuator, scanHexLiteral, scanOctalLiteral, scanNumericLiteral, scanStringLiteral, scanRegExp, isIdentifierName, advanceSlash, advance, lex, peek, peekLineTerminator, throwError, throwErrorTolerant, throwUnexpected, expect, expectKeyword, match, matchKeyword, matchAssign, consumeSemicolon, isLeftHandSide, parseArrayInitialiser, parsePropertyFunction, parseObjectPropertyKey, parseObjectProperty, parseObjectInitialiser, parseGroupExpression, parsePrimaryExpression, parseArguments, parseNonComputedProperty, parseNonComputedMember, parseComputedMember, parseNewExpression, parseLeftHandSideExpressionAllowCall, parseLeftHandSideExpression, parsePostfixExpression, parseUnaryExpression, binaryPrecedence, parseBinaryExpression, parseConditionalExpression, parseAssignmentExpression, parseExpression, parseStatementList, parseBlock, parseVariableIdentifier, parseVariableDeclaration, parseVariableDeclarationList, parseVariableStatement, parseConstLetDeclaration, parseEmptyStatement, parseExpressionStatement, parseIfStatement, parseDoWhileStatement, parseWhileStatement, parseForVariableDeclaration, parseForStatement, parseContinueStatement, parseBreakStatement, parseReturnStatement, parseWithStatement, parseSwitchCase, parseSwitchStatement, parseThrowStatement, parseCatchClause, parseTryStatement, parseDebuggerStatement, parseStatement, parseFunctionSourceElements, parseParams, parseFunctionDeclaration, parseFunctionExpression, parseSourceElement, parseSourceElements, parseProgram, addComment, scanComment, filterCommentLocation, collectToken, collectRegex, filterTokenLocation, createLocationMarker, trackGroupExpression, trackLeftHandSideExpression, trackLeftHandSideExpressionAllowCall, filterGroup, wrapTrackingFunction, patch, unpatch, extend, tokenize, parse;
assert = _JS._func(function (this, condition, message)
if (not condition) then
error(_JS._new(Error, (("ASSERT: ") + message)))
end
end);
isDecimalDigit = _JS._func(function (this, ch)
if true then return (ch >= (48)) and (ch <= (57)); end;
end);
isHexDigit = _JS._func(function (this, ch)
if true then return (("0123456789abcdefABCDEF"):indexOf(ch) >= (0)); end;
end);
isOctalDigit = _JS._func(function (this, ch)
if true then return (("01234567"):indexOf(ch) >= (0)); end;
end);
isWhiteSpace = _JS._func(function (this, ch)
if true then return (ch == (32)) or (ch == (9)) or (ch == (11)) or (ch == (12)) or (ch == (160)) or (ch >= (5760)) and ((" ᠎             　﻿"):indexOf(String:fromCharCode(ch)) > (0)); end;
end);
isLineTerminator = _JS._func(function (this, ch)
if true then return (ch == (10)) or (ch == (13)) or (ch == (8232)) or (ch == (8233)); end;
end);
isIdentifierStart = _JS._func(function (this, ch)
if true then return (ch == (36)) or (ch == (95)) or (ch >= (65)) and (ch <= (90)) or (ch >= (97)) and (ch <= (122)) or (ch == (92)) or (ch >= (128)) and Regex.NonAsciiIdentifierStart:test(String:fromCharCode(ch)); end;
end);
isIdentifierPart = _JS._func(function (this, ch)
if true then return (ch == (36)) or (ch == (95)) or (ch >= (65)) and (ch <= (90)) or (ch >= (97)) and (ch <= (122)) or (ch >= (48)) and (ch <= (57)) or (ch == (92)) or (ch >= (128)) and Regex.NonAsciiIdentifierPart:test(String:fromCharCode(ch)); end;
end);
isFutureReservedWord = _JS._func(function (this, id)
repeat
local _0 = ("class"); local _1 = ("enum"); local _2 = ("export"); local _3 = ("extends"); local _4 = ("import"); local _5 = ("super"); local _6;
local _r = id;
if _r == _0 then

_r = _1;
end
if _r == _1 then

_r = _2;
end
if _r == _2 then

_r = _3;
end
if _r == _3 then

_r = _4;
end
if _r == _4 then

_r = _5;
end
if _r == _5 then
if true then return (true); end;
_r = _6;
end
if true then return (false); end;
until true
end);
isStrictModeReservedWord = _JS._func(function (this, id)
repeat
local _0 = ("implements"); local _1 = ("interface"); local _2 = ("package"); local _3 = ("private"); local _4 = ("protected"); local _5 = ("public"); local _6 = ("static"); local _7 = ("yield"); local _8 = ("let"); local _9;
local _r = id;
if _r == _0 then

_r = _1;
end
if _r == _1 then

_r = _2;
end
if _r == _2 then

_r = _3;
end
if _r == _3 then

_r = _4;
end
if _r == _4 then

_r = _5;
end
if _r == _5 then

_r = _6;
end
if _r == _6 then

_r = _7;
end
if _r == _7 then

_r = _8;
end
if _r == _8 then
if true then return (true); end;
_r = _9;
end
if true then return (false); end;
until true
end);
isRestrictedWord = _JS._func(function (this, id)
if true then return (id == ("eval")) or (id == ("arguments")); end;
end);
isKeyword = _JS._func(function (this, id)
if _JS._truthy(strict and isStrictModeReservedWord(global, id)) then
if true then return (true); end;
end
repeat
local _0 = (2); local _1 = (3); local _2 = (4); local _3 = (5); local _4 = (6); local _5 = (7); local _6 = (8); local _7 = (10); local _8;
local _r = id.length;
if _r == _0 then
if true then return (id == ("if")) or (id == ("in")) or (id == ("do")); end;
_r = _1;
end
if _r == _1 then
if true then return (id == ("var")) or (id == ("for")) or (id == ("new")) or (id == ("try")) or (id == ("let")); end;
_r = _2;
end
if _r == _2 then
if true then return (id == ("this")) or (id == ("else")) or (id == ("case")) or (id == ("void")) or (id == ("with")) or (id == ("enum")); end;
_r = _3;
end
if _r == _3 then
if true then return (id == ("while")) or (id == ("break")) or (id == ("catch")) or (id == ("throw")) or (id == ("const")) or (id == ("yield")) or (id == ("class")) or (id == ("super")); end;
_r = _4;
end
if _r == _4 then
if true then return (id == ("return")) or (id == ("typeof")) or (id == ("delete")) or (id == ("switch")) or (id == ("export")) or (id == ("import")); end;
_r = _5;
end
if _r == _5 then
if true then return (id == ("default")) or (id == ("finally")) or (id == ("extends")); end;
_r = _6;
end
if _r == _6 then
if true then return (id == ("function")) or (id == ("continue")) or (id == ("debugger")); end;
_r = _7;
end
if _r == _7 then
if true then return (id == ("instanceof")); end;
_r = _8;
end
if true then return (false); end;
until true
end);
skipComment = _JS._func(function (this)
local ch, blockComment, lineComment;
ch, blockComment, lineComment = nil, nil, nil;
blockComment = (false);
lineComment = (false);
while (index < length) do

ch = source:charCodeAt(index);
if _JS._truthy(lineComment) then
(function () index = index + 1; return index; end)();
if _JS._truthy(isLineTerminator(global, ch)) then
lineComment = (false);
if _JS._truthy((ch == (13)) and (source:charCodeAt(index) == (10))) then
(function () index = index + 1; return index; end)();
end
(function () lineNumber = lineNumber + 1; return lineNumber; end)();
lineStart = index;
end
else
if _JS._truthy(blockComment) then
if _JS._truthy(isLineTerminator(global, ch)) then
if _JS._truthy((ch == (13)) and (source:charCodeAt((index + (1))) == (10))) then
(function () index = index + 1; return index; end)();
end
(function () lineNumber = lineNumber + 1; return lineNumber; end)();
(function () index = index + 1; return index; end)();
lineStart = index;
if (index >= length) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
else
ch = source:charCodeAt((function () local _r = index; index = _r + 1; return _r end)());
if (index >= length) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
if (ch == (42)) then
ch = source:charCodeAt(index);
if (ch == (47)) then
(function () index = index + 1; return index; end)();
blockComment = (false);
end
end
end
else
if (ch == (47)) then
ch = source:charCodeAt((index + (1)));
if (ch == (47)) then
index = index + (2);
lineComment = (true);
else
if (ch == (42)) then
index = index + (2);
blockComment = (true);
if (index >= length) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
else
_c = _JS._break; break;
end
end
else
if _JS._truthy(isWhiteSpace(global, ch)) then
(function () index = index + 1; return index; end)();
else
if _JS._truthy(isLineTerminator(global, ch)) then
(function () index = index + 1; return index; end)();
if _JS._truthy((ch == (13)) and (source:charCodeAt(index) == (10))) then
(function () index = index + 1; return index; end)();
end
(function () lineNumber = lineNumber + 1; return lineNumber; end)();
lineStart = index;
else
_c = _JS._break; break;
end
end
end
end
end

end
end);
scanHexEscape = _JS._func(function (this, prefix)
local i, len, ch, code;
i, len, ch, code = nil, nil, nil, (0);
len = ((prefix == ("u")) and {(4)} or {(2)})[1];
(function () local _r = (0); i = _r; return _r; end)()
while (i < len) do

if _JS._truthy((index < length) and isHexDigit(global, source[index])) then
ch = source[(function () local _r = index; index = _r + 1; return _r end)()];
code = ((code * (16)) + ("0123456789abcdef"):indexOf(ch:toLowerCase()));
else
if true then return (""); end;
end

(function () i = i + 1; return i; end)()
end
if true then return String:fromCharCode(code); end;
end);
getEscapedIdentifier = _JS._func(function (this)
local ch, id;
ch, id = nil, nil;
ch = source:charCodeAt((function () local _r = index; index = _r + 1; return _r end)());
id = String:fromCharCode(ch);
if (ch == (92)) then
if (source:charCodeAt(index) ~= (117)) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
(function () index = index + 1; return index; end)();
ch = scanHexEscape(global, ("u"));
if _JS._truthy((not ch) or (ch == ("\\")) or (not isIdentifierStart(global, ch:charCodeAt((0))))) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
id = ch;
end
while (index < length) do

ch = source:charCodeAt(index);
if (not isIdentifierPart(global, ch)) then
_c = _JS._break; break;
end
(function () index = index + 1; return index; end)();
id = id + String:fromCharCode(ch);
if (ch == (92)) then
id = id:substr((0), (id.length - (1)));
if (source:charCodeAt(index) ~= (117)) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
(function () index = index + 1; return index; end)();
ch = scanHexEscape(global, ("u"));
if _JS._truthy((not ch) or (ch == ("\\")) or (not isIdentifierPart(global, ch:charCodeAt((0))))) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
id = id + ch;
end

end
if true then return id; end;
end);
getIdentifier = _JS._func(function (this)
local start, ch;
start, ch = nil, nil;
start = (function () local _r = index; index = _r + 1; return _r end)();
while (index < length) do

ch = source:charCodeAt(index);
if (ch == (92)) then
index = start;
if true then return getEscapedIdentifier(global); end;
end
if _JS._truthy(isIdentifierPart(global, ch)) then
(function () index = index + 1; return index; end)();
else
_c = _JS._break; break;
end

end
if true then return source:slice(start, index); end;
end);
scanIdentifier = _JS._func(function (this)
local start, id, type;
start, id, type = nil, nil, nil;
start = index;
id = ((source:charCodeAt(index) == (92)) and {getEscapedIdentifier(global)} or {getIdentifier(global)})[1];
if (id.length == (1)) then
type = Token.Identifier;
else
if _JS._truthy(isKeyword(global, id)) then
type = Token.Keyword;
else
if (id == ("null")) then
type = Token.NullLiteral;
else
if _JS._truthy((id == ("true")) or (id == ("false"))) then
type = Token.BooleanLiteral;
else
type = Token.Identifier;
end
end
end
end
if true then return _JS._obj({
  ["type"]=type,
  ["value"]=id,
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end);
scanPunctuator = _JS._func(function (this)
local start, code, code2, ch1, ch2, ch3, ch4;
start, code, code2, ch1, ch2, ch3, ch4 = index, source:charCodeAt(index), nil, source[index], nil, nil, nil;
repeat
local _0 = (46); local _1 = (40); local _2 = (41); local _3 = (59); local _4 = (44); local _5 = (123); local _6 = (125); local _7 = (91); local _8 = (93); local _9 = (58); local _10 = (63); local _11 = (126); local _12;
local _r = code;
if _r == _0 then

_r = _1;
end
if _r == _1 then

_r = _2;
end
if _r == _2 then

_r = _3;
end
if _r == _3 then

_r = _4;
end
if _r == _4 then

_r = _5;
end
if _r == _5 then

_r = _6;
end
if _r == _6 then

_r = _7;
end
if _r == _7 then

_r = _8;
end
if _r == _8 then

_r = _9;
end
if _r == _9 then

_r = _10;
end
if _r == _10 then

_r = _11;
end
if _r == _11 then
(function () index = index + 1; return index; end)();
if _JS._truthy(extra.tokenize) then
if (code == (40)) then
extra.openParenToken = extra.tokens.length;
else
if (code == (123)) then
extra.openCurlyToken = extra.tokens.length;
end
end
end
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=String:fromCharCode(code),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
_r = _12;
end
code2 = source:charCodeAt((index + (1)));
if (code2 == (61)) then
repeat
local _0 = (37); local _1 = (38); local _2 = (42); local _3 = (43); local _4 = (45); local _5 = (47); local _6 = (60); local _7 = (62); local _8 = (94); local _9 = (124); local _10 = (33); local _11 = (61); local _12;
local _r = code;
if _r == _0 then

_r = _1;
end
if _r == _1 then

_r = _2;
end
if _r == _2 then

_r = _3;
end
if _r == _3 then

_r = _4;
end
if _r == _4 then

_r = _5;
end
if _r == _5 then

_r = _6;
end
if _r == _6 then

_r = _7;
end
if _r == _7 then

_r = _8;
end
if _r == _8 then

_r = _9;
end
if _r == _9 then
index = index + (2);
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=(String:fromCharCode(code) + String:fromCharCode(code2)),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
_r = _10;
end
if _r == _10 then

_r = _11;
end
if _r == _11 then
index = index + (2);
if (source:charCodeAt(index) == (61)) then
(function () index = index + 1; return index; end)();
end
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=source:slice(start, index),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
_r = _12;
end
_c = _JS._break; break;
until true
end
_c = _JS._break; break;
until true
ch2 = source[(index + (1))];
ch3 = source[(index + (2))];
ch4 = source[(index + (3))];
if _JS._truthy((ch1 == (">")) and (ch2 == (">")) and (ch3 == (">"))) then
if (ch4 == ("=")) then
index = index + (4);
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=(">>>="),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end
end
if _JS._truthy((ch1 == (">")) and (ch2 == (">")) and (ch3 == (">"))) then
index = index + (3);
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=(">>>"),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end
if _JS._truthy((ch1 == ("<")) and (ch2 == ("<")) and (ch3 == ("="))) then
index = index + (3);
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=("<<="),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end
if _JS._truthy((ch1 == (">")) and (ch2 == (">")) and (ch3 == ("="))) then
index = index + (3);
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=(">>="),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end
if _JS._truthy((ch1 == ch2) and (("+-<>&|"):indexOf(ch1) >= (0))) then
index = index + (2);
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=(ch1 + ch2),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end
if (("<>=!+-*%&|^/"):indexOf(ch1) >= (0)) then
(function () index = index + 1; return index; end)();
if true then return _JS._obj({
  ["type"]=Token.Punctuator,
  ["value"]=ch1,
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end);
scanHexLiteral = _JS._func(function (this, start)
local number;
number = ("");
while (index < length) do

if (not isHexDigit(global, source[index])) then
_c = _JS._break; break;
end
number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];

end
if (number.length == (0)) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
if _JS._truthy(isIdentifierStart(global, source:charCodeAt(index))) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
if true then return _JS._obj({
  ["type"]=Token.NumericLiteral,
  ["value"]=parseInt(global, (("0x") + number), (16)),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end);
scanOctalLiteral = _JS._func(function (this, start)
local number;
number = (("0") + source[(function () local _r = index; index = _r + 1; return _r end)()]);
while (index < length) do

if (not isOctalDigit(global, source[index])) then
_c = _JS._break; break;
end
number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];

end
if _JS._truthy(isIdentifierStart(global, source:charCodeAt(index)) or isDecimalDigit(global, source:charCodeAt(index))) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
if true then return _JS._obj({
  ["type"]=Token.NumericLiteral,
  ["value"]=parseInt(global, number, (8)),
  ["octal"]=(true),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end);
scanNumericLiteral = _JS._func(function (this)
local number, start, ch;
number, start, ch = nil, nil, nil;
ch = source[index];
if assert(global, isDecimalDigit(global, ch:charCodeAt((0))) or (ch == (".")), ("Numeric literal must start with a decimal digit or a decimal point")) then end;
start = index;
number = ("");
if (ch ~= (".")) then
number = source[(function () local _r = index; index = _r + 1; return _r end)()];
ch = source[index];
if (number == ("0")) then
if _JS._truthy((ch == ("x")) or (ch == ("X"))) then
(function () index = index + 1; return index; end)();
if true then return scanHexLiteral(global, start); end;
end
if _JS._truthy(isOctalDigit(global, ch)) then
if true then return scanOctalLiteral(global, start); end;
end
if _JS._truthy(ch and isDecimalDigit(global, ch:charCodeAt((0)))) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
end
while _JS._truthy(isDecimalDigit(global, source:charCodeAt(index))) do

number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];

end
ch = source[index];
end
if (ch == (".")) then
number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];
while _JS._truthy(isDecimalDigit(global, source:charCodeAt(index))) do

number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];

end
ch = source[index];
end
if _JS._truthy((ch == ("e")) or (ch == ("E"))) then
number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];
ch = source[index];
if _JS._truthy((ch == ("+")) or (ch == ("-"))) then
number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];
end
if _JS._truthy(isDecimalDigit(global, source:charCodeAt(index))) then
while _JS._truthy(isDecimalDigit(global, source:charCodeAt(index))) do

number = number + source[(function () local _r = index; index = _r + 1; return _r end)()];

end
else
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
end
if _JS._truthy(isIdentifierStart(global, source:charCodeAt(index))) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
if true then return _JS._obj({
  ["type"]=Token.NumericLiteral,
  ["value"]=parseFloat(global, number),
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end);
scanStringLiteral = _JS._func(function (this)
local str, quote, start, ch, code, unescaped, restore, octal;
str, quote, start, ch, code, unescaped, restore, octal = (""), nil, nil, nil, nil, nil, nil, (false);
quote = source[index];
if assert(global, (quote == ("'")) or (quote == ("\"")), ("String literal must starts with a quote")) then end;
start = index;
(function () index = index + 1; return index; end)();
while (index < length) do

ch = source[(function () local _r = index; index = _r + 1; return _r end)()];
if (ch == quote) then
quote = ("");
_c = _JS._break; break;
else
if (ch == ("\\")) then
ch = source[(function () local _r = index; index = _r + 1; return _r end)()];
if _JS._truthy((not ch) or (not isLineTerminator(global, ch:charCodeAt((0))))) then
repeat
local _0 = ("n"); local _1 = ("r"); local _2 = ("t"); local _3 = ("u"); local _4 = ("x"); local _5 = ("b"); local _6 = ("f"); local _7 = ("v"); local _8;
local _r = ch;
if _r == _0 then
str = str + ("\n");
_c = _JS._break; break;
end
if _r == _1 then
str = str + ("\r");
_c = _JS._break; break;
end
if _r == _2 then
str = str + ("\t");
_c = _JS._break; break;
end
if _r == _3 then

_r = _4;
end
if _r == _4 then
restore = index;
unescaped = scanHexEscape(global, ch);
if _JS._truthy(unescaped) then
str = str + unescaped;
else
index = restore;
str = str + ch;
end
_c = _JS._break; break;
end
if _r == _5 then
str = str + ("\b");
_c = _JS._break; break;
end
if _r == _6 then
str = str + ("\f");
_c = _JS._break; break;
end
if _r == _7 then
str = str + ("\u000b");
_c = _JS._break; break;
end
if _JS._truthy(isOctalDigit(global, ch)) then
code = ("01234567"):indexOf(ch);
if (code ~= (0)) then
octal = (true);
end
if _JS._truthy((index < length) and isOctalDigit(global, source[index])) then
octal = (true);
code = ((code * (8)) + ("01234567"):indexOf(source[(function () local _r = index; index = _r + 1; return _r end)()]));
if _JS._truthy((("0123"):indexOf(ch) >= (0)) and (index < length) and isOctalDigit(global, source[index])) then
code = ((code * (8)) + ("01234567"):indexOf(source[(function () local _r = index; index = _r + 1; return _r end)()]));
end
end
str = str + String:fromCharCode(code);
else
str = str + ch;
end
_c = _JS._break; break;
until true
else
(function () lineNumber = lineNumber + 1; return lineNumber; end)();
if _JS._truthy((ch == ("\r")) and (source[index] == ("\n"))) then
(function () index = index + 1; return index; end)();
end
end
else
if _JS._truthy(isLineTerminator(global, ch:charCodeAt((0)))) then
_c = _JS._break; break;
else
str = str + ch;
end
end
end

end
if (quote ~= ("")) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
if true then return _JS._obj({
  ["type"]=Token.StringLiteral,
  ["value"]=str,
  ["octal"]=octal,
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end);
scanRegExp = _JS._func(function (this)
local str, ch, start, pattern, flags, value, classMarker, restore, terminated;
str, ch, start, pattern, flags, value, classMarker, restore, terminated = nil, nil, nil, nil, nil, nil, (false), nil, (false);
lookahead = (null);
if skipComment(global) then end;
start = index;
ch = source[index];
if assert(global, (ch == ("/")), ("Regular expression literal must start with a slash")) then end;
str = source[(function () local _r = index; index = _r + 1; return _r end)()];
while (index < length) do

ch = source[(function () local _r = index; index = _r + 1; return _r end)()];
str = str + ch;
if _JS._truthy(classMarker) then
if (ch == ("]")) then
classMarker = (false);
end
else
if (ch == ("\\")) then
ch = source[(function () local _r = index; index = _r + 1; return _r end)()];
if _JS._truthy(isLineTerminator(global, ch:charCodeAt((0)))) then
if throwError(global, _JS._obj({
  }), Messages.UnterminatedRegExp) then end;
end
str = str + ch;
else
if (ch == ("/")) then
terminated = (true);
_c = _JS._break; break;
else
if (ch == ("[")) then
classMarker = (true);
else
if _JS._truthy(isLineTerminator(global, ch:charCodeAt((0)))) then
if throwError(global, _JS._obj({
  }), Messages.UnterminatedRegExp) then end;
end
end
end
end
end

end
if (not terminated) then
if throwError(global, _JS._obj({
  }), Messages.UnterminatedRegExp) then end;
end
pattern = str:substr((1), (str.length - (2)));
flags = ("");
while (index < length) do

ch = source[index];
if (not isIdentifierPart(global, ch:charCodeAt((0)))) then
_c = _JS._break; break;
end
(function () index = index + 1; return index; end)();
if _JS._truthy((ch == ("\\")) and (index < length)) then
ch = source[index];
if (ch == ("u")) then
(function () index = index + 1; return index; end)();
restore = index;
ch = scanHexEscape(global, ("u"));
if _JS._truthy(ch) then
flags = flags + ch;
(function () local _r = str + ("\\u"); str = _r; return _r; end)()
while (restore < index) do

str = str + source[restore];

(function () restore = restore + 1; return restore; end)()
end
else
index = restore;
flags = flags + ("u");
str = str + ("\\u");
end
else
str = str + ("\\");
end
else
flags = flags + ch;
str = str + ch;
end

end
local _e = nil
local _s, _r = xpcall(function ()
value = _JS._new(RegExp, pattern, flags);
    end, function (err)
        _e = err
    end)
if _s == false then
e = _e;
if throwError(global, _JS._obj({
  }), Messages.InvalidRegExp) then end;
end

if peek(global) then end;
if _JS._truthy(extra.tokenize) then
if true then return _JS._obj({
  ["type"]=Token.RegularExpression,
  ["value"]=value,
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end
if true then return _JS._obj({
  ["literal"]=str,
  ["value"]=value,
  ["range"]=_JS._arr({[0]=start, index})}); end;
end);
isIdentifierName = _JS._func(function (this, token)
if true then return (token.type == Token.Identifier) or (token.type == Token.Keyword) or (token.type == Token.BooleanLiteral) or (token.type == Token.NullLiteral); end;
end);
advanceSlash = _JS._func(function (this)
local prevToken, checkToken;
prevToken, checkToken = nil, nil;
prevToken = extra.tokens[(extra.tokens.length - (1))];
if (not prevToken) then
if true then return scanRegExp(global); end;
end
if (prevToken.type == ("Punctuator")) then
if (prevToken.value == (")")) then
checkToken = extra.tokens[(extra.openParenToken - (1))];
if _JS._truthy(checkToken and (checkToken.type == ("Keyword")) and (checkToken.value == ("if")) or (checkToken.value == ("while")) or (checkToken.value == ("for")) or (checkToken.value == ("with"))) then
if true then return scanRegExp(global); end;
end
if true then return scanPunctuator(global); end;
end
if (prevToken.value == ("}")) then
if _JS._truthy(extra.tokens[(extra.openCurlyToken - (3))] and (extra.tokens[(extra.openCurlyToken - (3))].type == ("Keyword"))) then
checkToken = extra.tokens[(extra.openCurlyToken - (4))];
if (not checkToken) then
if true then return scanPunctuator(global); end;
end
else
if _JS._truthy(extra.tokens[(extra.openCurlyToken - (4))] and (extra.tokens[(extra.openCurlyToken - (4))].type == ("Keyword"))) then
checkToken = extra.tokens[(extra.openCurlyToken - (5))];
if (not checkToken) then
if true then return scanRegExp(global); end;
end
else
if true then return scanPunctuator(global); end;
end
end
if (FnExprTokens:indexOf(checkToken.value) >= (0)) then
if true then return scanPunctuator(global); end;
end
if true then return scanRegExp(global); end;
end
if true then return scanRegExp(global); end;
end
if (prevToken.type == ("Keyword")) then
if true then return scanRegExp(global); end;
end
if true then return scanPunctuator(global); end;
end);
advance = _JS._func(function (this)
local ch;
ch = nil;
if skipComment(global) then end;
if (index >= length) then
if true then return _JS._obj({
  ["type"]=Token.EOF,
  ["lineNumber"]=lineNumber,
  ["lineStart"]=lineStart,
  ["range"]=_JS._arr({[0]=index, index})}); end;
end
ch = source:charCodeAt(index);
if _JS._truthy((ch == (40)) or (ch == (41)) or (ch == (58))) then
if true then return scanPunctuator(global); end;
end
if _JS._truthy((ch == (39)) or (ch == (34))) then
if true then return scanStringLiteral(global); end;
end
if _JS._truthy(isIdentifierStart(global, ch)) then
if true then return scanIdentifier(global); end;
end
if (ch == (46)) then
if _JS._truthy(isDecimalDigit(global, source:charCodeAt((index + (1))))) then
if true then return scanNumericLiteral(global); end;
end
if true then return scanPunctuator(global); end;
end
if _JS._truthy(isDecimalDigit(global, ch)) then
if true then return scanNumericLiteral(global); end;
end
if _JS._truthy(extra.tokenize and (ch == (47))) then
if true then return advanceSlash(global); end;
end
if true then return scanPunctuator(global); end;
end);
lex = _JS._func(function (this)
local token;
token = nil;
token = lookahead;
index = token.range[(1)];
lineNumber = token.lineNumber;
lineStart = token.lineStart;
lookahead = advance(global);
index = token.range[(1)];
lineNumber = token.lineNumber;
lineStart = token.lineStart;
if true then return token; end;
end);
peek = _JS._func(function (this)
local pos, line, start;
pos, line, start = nil, nil, nil;
pos = index;
line = lineNumber;
start = lineStart;
lookahead = advance(global);
index = pos;
lineNumber = line;
lineStart = start;
end);
peekLineTerminator = _JS._func(function (this)
local pos, line, start, found;
pos, line, start, found = nil, nil, nil, nil;
pos = index;
line = lineNumber;
start = lineStart;
if skipComment(global) then end;
found = (lineNumber ~= line);
index = pos;
lineNumber = line;
lineStart = start;
if true then return found; end;
end);
throwError = _JS._func(function (this, ...)
local arguments = _JS._arr((function (...) return arg; end)(...)); arguments:shift();
local token, messageFormat = ...;
local error, args, msg;
error, args, msg = nil, Array.prototype.slice:call(arguments, (2)), messageFormat:replace(({}), _JS._func(function (this, whole, index)
if assert(global, (index < args.length), ("Message reference must be in range")) then end;
if true then return args[index]; end;
end));
if (_JS._typeof(token.lineNumber) == ("number")) then
error = _JS._new(Error, (((("Line ") + token.lineNumber) + (": ")) + msg));
error.index = token.range[(0)];
error.lineNumber = token.lineNumber;
error.column = ((token.range[(0)] - lineStart) + (1));
else
error = _JS._new(Error, (((("Line ") + lineNumber) + (": ")) + msg));
error.index = index;
error.lineNumber = lineNumber;
error.column = ((index - lineStart) + (1));
end
error.description = msg;
error(error)
end);
throwErrorTolerant = _JS._func(function (this, ...)
local arguments = _JS._arr((function (...) return arg; end)(...)); arguments:shift();
local _e = nil
local _s, _r = xpcall(function ()
if throwError:apply((null), arguments) then end;
    end, function (err)
        _e = err
    end)
if _s == false then
e = _e;
if _JS._truthy(extra.errors) then
if extra.errors:push(e) then end;
else
error(e)
end
end

end);
throwUnexpected = _JS._func(function (this, token)
if (token.type == Token.EOF) then
if throwError(global, token, Messages.UnexpectedEOS) then end;
end
if (token.type == Token.NumericLiteral) then
if throwError(global, token, Messages.UnexpectedNumber) then end;
end
if (token.type == Token.StringLiteral) then
if throwError(global, token, Messages.UnexpectedString) then end;
end
if (token.type == Token.Identifier) then
if throwError(global, token, Messages.UnexpectedIdentifier) then end;
end
if (token.type == Token.Keyword) then
if _JS._truthy(isFutureReservedWord(global, token.value)) then
if throwError(global, token, Messages.UnexpectedReserved) then end;
else
if _JS._truthy(strict and isStrictModeReservedWord(global, token.value)) then
if throwErrorTolerant(global, token, Messages.StrictReservedWord) then end;
if true then return; end;
end
end
if throwError(global, token, Messages.UnexpectedToken, token.value) then end;
end
if throwError(global, token, Messages.UnexpectedToken, token.value) then end;
end);
expect = _JS._func(function (this, value)
local token;
token = lex(global);
if _JS._truthy((token.type ~= Token.Punctuator) or (token.value ~= value)) then
if throwUnexpected(global, token) then end;
end
end);
expectKeyword = _JS._func(function (this, keyword)
local token;
token = lex(global);
if _JS._truthy((token.type ~= Token.Keyword) or (token.value ~= keyword)) then
if throwUnexpected(global, token) then end;
end
end);
match = _JS._func(function (this, value)
if true then return (lookahead.type == Token.Punctuator) and (lookahead.value == value); end;
end);
matchKeyword = _JS._func(function (this, keyword)
if true then return (lookahead.type == Token.Keyword) and (lookahead.value == keyword); end;
end);
matchAssign = _JS._func(function (this)
local op;
op = nil;
if (lookahead.type ~= Token.Punctuator) then
if true then return (false); end;
end
op = lookahead.value;
if true then return (op == ("=")) or (op == ("*=")) or (op == ("/=")) or (op == ("%=")) or (op == ("+=")) or (op == ("-=")) or (op == ("<<=")) or (op == (">>=")) or (op == (">>>=")) or (op == ("&=")) or (op == ("^=")) or (op == ("|=")); end;
end);
consumeSemicolon = _JS._func(function (this)
local line;
line = nil;
if (source:charCodeAt(index) == (59)) then
if lex(global) then end;
if true then return; end;
end
line = lineNumber;
if skipComment(global) then end;
if (lineNumber ~= line) then
if true then return; end;
end
if _JS._truthy(match(global, (";"))) then
if lex(global) then end;
if true then return; end;
end
if _JS._truthy((lookahead.type ~= Token.EOF) and (not match(global, ("}")))) then
if throwUnexpected(global, lookahead) then end;
end
end);
isLeftHandSide = _JS._func(function (this, expr)
if true then return (expr.type == Syntax.Identifier) or (expr.type == Syntax.MemberExpression); end;
end);
parseArrayInitialiser = _JS._func(function (this)
local elements;
elements = _JS._arr({});
if expect(global, ("[")) then end;
while (not match(global, ("]"))) do

if _JS._truthy(match(global, (","))) then
if lex(global) then end;
if elements:push((null)) then end;
else
if elements:push(parseAssignmentExpression(global)) then end;
if (not match(global, ("]"))) then
if expect(global, (",")) then end;
end
end

end
if expect(global, ("]")) then end;
if true then return delegate:createArrayExpression(elements); end;
end);
parsePropertyFunction = _JS._func(function (this, param, first)
local previousStrict, body;
previousStrict, body = nil, nil;
previousStrict = strict;
body = parseFunctionSourceElements(global);
if _JS._truthy(first and strict and isRestrictedWord(global, param[(0)].name)) then
if throwErrorTolerant(global, first, Messages.StrictParamName) then end;
end
strict = previousStrict;
if true then return delegate:createFunctionExpression((null), param, _JS._arr({}), body); end;
end);
parseObjectPropertyKey = _JS._func(function (this)
local token;
token = lex(global);
if _JS._truthy((token.type == Token.StringLiteral) or (token.type == Token.NumericLiteral)) then
if _JS._truthy(strict and token.octal) then
if throwErrorTolerant(global, token, Messages.StrictOctalLiteral) then end;
end
if true then return delegate:createLiteral(token); end;
end
if true then return delegate:createIdentifier(token.value); end;
end);
parseObjectProperty = _JS._func(function (this)
local token, key, id, value, param;
token, key, id, value, param = nil, nil, nil, nil, nil;
token = lookahead;
if (token.type == Token.Identifier) then
id = parseObjectPropertyKey(global);
if _JS._truthy((token.value == ("get")) and (not match(global, (":")))) then
key = parseObjectPropertyKey(global);
if expect(global, ("(")) then end;
if expect(global, (")")) then end;
value = parsePropertyFunction(global, _JS._arr({}));
if true then return delegate:createProperty(("get"), key, value); end;
end
if _JS._truthy((token.value == ("set")) and (not match(global, (":")))) then
key = parseObjectPropertyKey(global);
if expect(global, ("(")) then end;
token = lookahead;
if (token.type ~= Token.Identifier) then
if throwUnexpected(global, lex(global)) then end;
end
param = _JS._arr({[0]=parseVariableIdentifier(global)});
if expect(global, (")")) then end;
value = parsePropertyFunction(global, param, token);
if true then return delegate:createProperty(("set"), key, value); end;
end
if expect(global, (":")) then end;
value = parseAssignmentExpression(global);
if true then return delegate:createProperty(("init"), id, value); end;
end
if _JS._truthy((token.type == Token.EOF) or (token.type == Token.Punctuator)) then
if throwUnexpected(global, token) then end;
else
key = parseObjectPropertyKey(global);
if expect(global, (":")) then end;
value = parseAssignmentExpression(global);
if true then return delegate:createProperty(("init"), key, value); end;
end
end);
parseObjectInitialiser = _JS._func(function (this)
local properties, property, name, key, kind, map, toString;
properties, property, name, key, kind, map, toString = _JS._arr({}), nil, nil, nil, nil, _JS._obj({
  }), String;
if expect(global, ("{")) then end;
while (not match(global, ("}"))) do

property = parseObjectProperty(global);
if (property.key.type == Syntax.Identifier) then
name = property.key.name;
else
name = toString(global, property.key.value);
end
kind = ((property.kind == ("init")) and {PropertyKind.Data} or {((property.kind == ("get")) and {PropertyKind.Get} or {PropertyKind.Set})[1]})[1];
key = (("$") + name);
if _JS._truthy(Object.prototype.hasOwnProperty:call(map, key)) then
if (map[key] == PropertyKind.Data) then
if _JS._truthy(strict and (kind == PropertyKind.Data)) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.StrictDuplicateProperty) then end;
else
if (kind ~= PropertyKind.Data) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.AccessorDataProperty) then end;
end
end
else
if (kind == PropertyKind.Data) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.AccessorDataProperty) then end;
else
if _JS._truthy(_JS._bit.band(map[key], kind)) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.AccessorGetSet) then end;
end
end
end
map[key] = _JS._bit.bor(map[key], kind);
else
map[key] = kind;
end
if properties:push(property) then end;
if (not match(global, ("}"))) then
if expect(global, (",")) then end;
end

end
if expect(global, ("}")) then end;
if true then return delegate:createObjectExpression(properties); end;
end);
parseGroupExpression = _JS._func(function (this)
local expr;
expr = nil;
if expect(global, ("(")) then end;
expr = parseExpression(global);
if expect(global, (")")) then end;
if true then return expr; end;
end);
parsePrimaryExpression = _JS._func(function (this)
local type, token;
type, token = nil, nil;
type = lookahead.type;
if (type == Token.Identifier) then
if true then return delegate:createIdentifier(lex(global).value); end;
end
if _JS._truthy((type == Token.StringLiteral) or (type == Token.NumericLiteral)) then
if _JS._truthy(strict and lookahead.octal) then
if throwErrorTolerant(global, lookahead, Messages.StrictOctalLiteral) then end;
end
if true then return delegate:createLiteral(lex(global)); end;
end
if (type == Token.Keyword) then
if _JS._truthy(matchKeyword(global, ("this"))) then
if lex(global) then end;
if true then return delegate:createThisExpression(); end;
end
if _JS._truthy(matchKeyword(global, ("function"))) then
if true then return parseFunctionExpression(global); end;
end
end
if (type == Token.BooleanLiteral) then
token = lex(global);
token.value = (token.value == ("true"));
if true then return delegate:createLiteral(token); end;
end
if (type == Token.NullLiteral) then
token = lex(global);
token.value = (null);
if true then return delegate:createLiteral(token); end;
end
if _JS._truthy(match(global, ("["))) then
if true then return parseArrayInitialiser(global); end;
end
if _JS._truthy(match(global, ("{"))) then
if true then return parseObjectInitialiser(global); end;
end
if _JS._truthy(match(global, ("("))) then
if true then return parseGroupExpression(global); end;
end
if _JS._truthy(match(global, ("/")) or match(global, ("/="))) then
if true then return delegate:createLiteral(scanRegExp(global)); end;
end
if true then return throwUnexpected(global, lex(global)); end;
end);
parseArguments = _JS._func(function (this)
local args;
args = _JS._arr({});
if expect(global, ("(")) then end;
if (not match(global, (")"))) then
while (index < length) do

if args:push(parseAssignmentExpression(global)) then end;
if _JS._truthy(match(global, (")"))) then
_c = _JS._break; break;
end
if expect(global, (",")) then end;

end
end
if expect(global, (")")) then end;
if true then return args; end;
end);
parseNonComputedProperty = _JS._func(function (this)
local token;
token = lex(global);
if (not isIdentifierName(global, token)) then
if throwUnexpected(global, token) then end;
end
if true then return delegate:createIdentifier(token.value); end;
end);
parseNonComputedMember = _JS._func(function (this)
if expect(global, (".")) then end;
if true then return parseNonComputedProperty(global); end;
end);
parseComputedMember = _JS._func(function (this)
local expr;
expr = nil;
if expect(global, ("[")) then end;
expr = parseExpression(global);
if expect(global, ("]")) then end;
if true then return expr; end;
end);
parseNewExpression = _JS._func(function (this)
local callee, args;
callee, args = nil, nil;
if expectKeyword(global, ("new")) then end;
callee = parseLeftHandSideExpression(global);
args = (_JS._truthy(match(global, ("("))) and {parseArguments(global)} or {_JS._arr({})})[1];
if true then return delegate:createNewExpression(callee, args); end;
end);
parseLeftHandSideExpressionAllowCall = _JS._func(function (this)
local expr, args, property;
expr, args, property = nil, nil, nil;
expr = (_JS._truthy(matchKeyword(global, ("new"))) and {parseNewExpression(global)} or {parsePrimaryExpression(global)})[1];
while _JS._truthy(match(global, (".")) or match(global, ("[")) or match(global, ("("))) do

if _JS._truthy(match(global, ("("))) then
args = parseArguments(global);
expr = delegate:createCallExpression(expr, args);
else
if _JS._truthy(match(global, ("["))) then
property = parseComputedMember(global);
expr = delegate:createMemberExpression(("["), expr, property);
else
property = parseNonComputedMember(global);
expr = delegate:createMemberExpression(("."), expr, property);
end
end

end
if true then return expr; end;
end);
parseLeftHandSideExpression = _JS._func(function (this)
local expr, property;
expr, property = nil, nil;
expr = (_JS._truthy(matchKeyword(global, ("new"))) and {parseNewExpression(global)} or {parsePrimaryExpression(global)})[1];
while _JS._truthy(match(global, (".")) or match(global, ("["))) do

if _JS._truthy(match(global, ("["))) then
property = parseComputedMember(global);
expr = delegate:createMemberExpression(("["), expr, property);
else
property = parseNonComputedMember(global);
expr = delegate:createMemberExpression(("."), expr, property);
end

end
if true then return expr; end;
end);
parsePostfixExpression = _JS._func(function (this)
local expr, token;
expr, token = parseLeftHandSideExpressionAllowCall(global), nil;
if (lookahead.type ~= Token.Punctuator) then
if true then return expr; end;
end
if _JS._truthy(match(global, ("++")) or match(global, ("--")) and (not peekLineTerminator(global))) then
if _JS._truthy(strict and (expr.type == Syntax.Identifier) and isRestrictedWord(global, expr.name)) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.StrictLHSPostfix) then end;
end
if (not isLeftHandSide(global, expr)) then
if throwError(global, _JS._obj({
  }), Messages.InvalidLHSInAssignment) then end;
end
token = lex(global);
expr = delegate:createPostfixExpression(token.value, expr);
end
if true then return expr; end;
end);
parseUnaryExpression = _JS._func(function (this)
local token, expr;
token, expr = nil, nil;
if _JS._truthy((lookahead.type ~= Token.Punctuator) and (lookahead.type ~= Token.Keyword)) then
if true then return parsePostfixExpression(global); end;
end
if _JS._truthy(match(global, ("++")) or match(global, ("--"))) then
token = lex(global);
expr = parseUnaryExpression(global);
if _JS._truthy(strict and (expr.type == Syntax.Identifier) and isRestrictedWord(global, expr.name)) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.StrictLHSPrefix) then end;
end
if (not isLeftHandSide(global, expr)) then
if throwError(global, _JS._obj({
  }), Messages.InvalidLHSInAssignment) then end;
end
if true then return delegate:createUnaryExpression(token.value, expr); end;
end
if _JS._truthy(match(global, ("+")) or match(global, ("-")) or match(global, ("~")) or match(global, ("!"))) then
token = lex(global);
expr = parseUnaryExpression(global);
if true then return delegate:createUnaryExpression(token.value, expr); end;
end
if _JS._truthy(matchKeyword(global, ("delete")) or matchKeyword(global, ("void")) or matchKeyword(global, ("typeof"))) then
token = lex(global);
expr = parseUnaryExpression(global);
expr = delegate:createUnaryExpression(token.value, expr);
if _JS._truthy(strict and (expr.operator == ("delete")) and (expr.argument.type == Syntax.Identifier)) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.StrictDelete) then end;
end
if true then return expr; end;
end
if true then return parsePostfixExpression(global); end;
end);
binaryPrecedence = _JS._func(function (this, token, allowIn)
local prec;
prec = (0);
if _JS._truthy((token.type ~= Token.Punctuator) and (token.type ~= Token.Keyword)) then
if true then return (0); end;
end
repeat
local _0 = ("||"); local _1 = ("&&"); local _2 = ("|"); local _3 = ("^"); local _4 = ("&"); local _5 = ("=="); local _6 = ("!="); local _7 = ("==="); local _8 = ("!=="); local _9 = ("<"); local _10 = (">"); local _11 = ("<="); local _12 = (">="); local _13 = ("instanceof"); local _14 = ("in"); local _15 = ("<<"); local _16 = (">>"); local _17 = (">>>"); local _18 = ("+"); local _19 = ("-"); local _20 = ("*"); local _21 = ("/"); local _22 = ("%"); local _23;
local _r = token.value;
if _r == _0 then
prec = (1);
_c = _JS._break; break;
end
if _r == _1 then
prec = (2);
_c = _JS._break; break;
end
if _r == _2 then
prec = (3);
_c = _JS._break; break;
end
if _r == _3 then
prec = (4);
_c = _JS._break; break;
end
if _r == _4 then
prec = (5);
_c = _JS._break; break;
end
if _r == _5 then

_r = _6;
end
if _r == _6 then

_r = _7;
end
if _r == _7 then

_r = _8;
end
if _r == _8 then
prec = (6);
_c = _JS._break; break;
end
if _r == _9 then

_r = _10;
end
if _r == _10 then

_r = _11;
end
if _r == _11 then

_r = _12;
end
if _r == _12 then

_r = _13;
end
if _r == _13 then
prec = (7);
_c = _JS._break; break;
end
if _r == _14 then
prec = (_JS._truthy(allowIn) and {(7)} or {(0)})[1];
_c = _JS._break; break;
end
if _r == _15 then

_r = _16;
end
if _r == _16 then

_r = _17;
end
if _r == _17 then
prec = (8);
_c = _JS._break; break;
end
if _r == _18 then

_r = _19;
end
if _r == _19 then
prec = (9);
_c = _JS._break; break;
end
if _r == _20 then

_r = _21;
end
if _r == _21 then

_r = _22;
end
if _r == _22 then
prec = (11);
_c = _JS._break; break;
end
_c = _JS._break; break;
until true
if true then return prec; end;
end);
parseBinaryExpression = _JS._func(function (this)
local expr, token, prec, previousAllowIn, stack, right, operator, left, i;
expr, token, prec, previousAllowIn, stack, right, operator, left, i = nil, nil, nil, nil, nil, nil, nil, nil, nil;
previousAllowIn = state.allowIn;
state.allowIn = (true);
expr = parseUnaryExpression(global);
token = lookahead;
prec = binaryPrecedence(global, token, previousAllowIn);
if (prec == (0)) then
if true then return expr; end;
end
token.prec = prec;
if lex(global) then end;
stack = _JS._arr({[0]=expr, token, parseUnaryExpression(global)});
while (((function () local _r = binaryPrecedence(global, lookahead, previousAllowIn); prec = _r; return _r; end)()) > (0)) do

while _JS._truthy((stack.length > (2)) and (prec <= stack[(stack.length - (2))].prec)) do

right = stack:pop();
operator = stack:pop().value;
left = stack:pop();
if stack:push(delegate:createBinaryExpression(operator, left, right)) then end;

end
token = lex(global);
token.prec = prec;
if stack:push(token) then end;
if stack:push(parseUnaryExpression(global)) then end;

end
state.allowIn = previousAllowIn;
i = (stack.length - (1));
expr = stack[i];
while (i > (1)) do

expr = delegate:createBinaryExpression(stack[(i - (1))].value, stack[(i - (2))], expr);
i = i - (2);

end
if true then return expr; end;
end);
parseConditionalExpression = _JS._func(function (this)
local expr, previousAllowIn, consequent, alternate;
expr, previousAllowIn, consequent, alternate = nil, nil, nil, nil;
expr = parseBinaryExpression(global);
if _JS._truthy(match(global, ("?"))) then
if lex(global) then end;
previousAllowIn = state.allowIn;
state.allowIn = (true);
consequent = parseAssignmentExpression(global);
state.allowIn = previousAllowIn;
if expect(global, (":")) then end;
alternate = parseAssignmentExpression(global);
expr = delegate:createConditionalExpression(expr, consequent, alternate);
end
if true then return expr; end;
end);
parseAssignmentExpression = _JS._func(function (this)
local token, left, right;
token, left, right = nil, nil, nil;
token = lookahead;
left = parseConditionalExpression(global);
if _JS._truthy(matchAssign(global)) then
if (not isLeftHandSide(global, left)) then
if throwError(global, _JS._obj({
  }), Messages.InvalidLHSInAssignment) then end;
end
if _JS._truthy(strict and (left.type == Syntax.Identifier) and isRestrictedWord(global, left.name)) then
if throwErrorTolerant(global, token, Messages.StrictLHSAssignment) then end;
end
token = lex(global);
right = parseAssignmentExpression(global);
if true then return delegate:createAssignmentExpression(token.value, left, right); end;
end
if true then return left; end;
end);
parseExpression = _JS._func(function (this)
local expr;
expr = parseAssignmentExpression(global);
if _JS._truthy(match(global, (","))) then
expr = delegate:createSequenceExpression(_JS._arr({[0]=expr}));
while (index < length) do

if (not match(global, (","))) then
_c = _JS._break; break;
end
if lex(global) then end;
if expr.expressions:push(parseAssignmentExpression(global)) then end;

end
end
if true then return expr; end;
end);
parseStatementList = _JS._func(function (this)
local list, statement;
list, statement = _JS._arr({}), nil;
while (index < length) do

if _JS._truthy(match(global, ("}"))) then
_c = _JS._break; break;
end
statement = parseSourceElement(global);
if (_JS._typeof(statement) == ("undefined")) then
_c = _JS._break; break;
end
if list:push(statement) then end;

end
if true then return list; end;
end);
parseBlock = _JS._func(function (this)
local block;
block = nil;
if expect(global, ("{")) then end;
block = parseStatementList(global);
if expect(global, ("}")) then end;
if true then return delegate:createBlockStatement(block); end;
end);
parseVariableIdentifier = _JS._func(function (this)
local token;
token = lex(global);
if (token.type ~= Token.Identifier) then
if throwUnexpected(global, token) then end;
end
if true then return delegate:createIdentifier(token.value); end;
end);
parseVariableDeclaration = _JS._func(function (this, kind)
local id, init;
id, init = parseVariableIdentifier(global), (null);
if _JS._truthy(strict and isRestrictedWord(global, id.name)) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.StrictVarName) then end;
end
if (kind == ("const")) then
if expect(global, ("=")) then end;
init = parseAssignmentExpression(global);
else
if _JS._truthy(match(global, ("="))) then
if lex(global) then end;
init = parseAssignmentExpression(global);
end
end
if true then return delegate:createVariableDeclarator(id, init); end;
end);
parseVariableDeclarationList = _JS._func(function (this, kind)
local list;
list = _JS._arr({});
repeat

if list:push(parseVariableDeclaration(global, kind)) then end;
if (not match(global, (","))) then
_c = _JS._break; break;
end
if lex(global) then end;

until not (index < length);
if true then return list; end;
end);
parseVariableStatement = _JS._func(function (this)
local declarations;
declarations = nil;
if expectKeyword(global, ("var")) then end;
declarations = parseVariableDeclarationList(global);
if consumeSemicolon(global) then end;
if true then return delegate:createVariableDeclaration(declarations, ("var")); end;
end);
parseConstLetDeclaration = _JS._func(function (this, kind)
local declarations;
declarations = nil;
if expectKeyword(global, kind) then end;
declarations = parseVariableDeclarationList(global, kind);
if consumeSemicolon(global) then end;
if true then return delegate:createVariableDeclaration(declarations, kind); end;
end);
parseEmptyStatement = _JS._func(function (this)
if expect(global, (";")) then end;
if true then return delegate:createEmptyStatement(); end;
end);
parseExpressionStatement = _JS._func(function (this)
local expr;
expr = parseExpression(global);
if consumeSemicolon(global) then end;
if true then return delegate:createExpressionStatement(expr); end;
end);
parseIfStatement = _JS._func(function (this)
local test, consequent, alternate;
test, consequent, alternate = nil, nil, nil;
if expectKeyword(global, ("if")) then end;
if expect(global, ("(")) then end;
test = parseExpression(global);
if expect(global, (")")) then end;
consequent = parseStatement(global);
if _JS._truthy(matchKeyword(global, ("else"))) then
if lex(global) then end;
alternate = parseStatement(global);
else
alternate = (null);
end
if true then return delegate:createIfStatement(test, consequent, alternate); end;
end);
parseDoWhileStatement = _JS._func(function (this)
local body, test, oldInIteration;
body, test, oldInIteration = nil, nil, nil;
if expectKeyword(global, ("do")) then end;
oldInIteration = state.inIteration;
state.inIteration = (true);
body = parseStatement(global);
state.inIteration = oldInIteration;
if expectKeyword(global, ("while")) then end;
if expect(global, ("(")) then end;
test = parseExpression(global);
if expect(global, (")")) then end;
if _JS._truthy(match(global, (";"))) then
if lex(global) then end;
end
if true then return delegate:createDoWhileStatement(body, test); end;
end);
parseWhileStatement = _JS._func(function (this)
local test, body, oldInIteration;
test, body, oldInIteration = nil, nil, nil;
if expectKeyword(global, ("while")) then end;
if expect(global, ("(")) then end;
test = parseExpression(global);
if expect(global, (")")) then end;
oldInIteration = state.inIteration;
state.inIteration = (true);
body = parseStatement(global);
state.inIteration = oldInIteration;
if true then return delegate:createWhileStatement(test, body); end;
end);
parseForVariableDeclaration = _JS._func(function (this)
local token, declarations;
token, declarations = lex(global), parseVariableDeclarationList(global);
if true then return delegate:createVariableDeclaration(declarations, token.value); end;
end);
parseForStatement = _JS._func(function (this)
local init, test, update, left, right, body, oldInIteration;
init, test, update, left, right, body, oldInIteration = nil, nil, nil, nil, nil, nil, nil;
init = (function () local _r = (function () local _r = (null); update = _r; return _r; end)(); test = _r; return _r; end)();
if expectKeyword(global, ("for")) then end;
if expect(global, ("(")) then end;
if _JS._truthy(match(global, (";"))) then
if lex(global) then end;
else
if _JS._truthy(matchKeyword(global, ("var")) or matchKeyword(global, ("let"))) then
state.allowIn = (false);
init = parseForVariableDeclaration(global);
state.allowIn = (true);
if _JS._truthy((init.declarations.length == (1)) and matchKeyword(global, ("in"))) then
if lex(global) then end;
left = init;
right = parseExpression(global);
init = (null);
end
else
state.allowIn = (false);
init = parseExpression(global);
state.allowIn = (true);
if _JS._truthy(matchKeyword(global, ("in"))) then
if (not isLeftHandSide(global, init)) then
if throwError(global, _JS._obj({
  }), Messages.InvalidLHSInForIn) then end;
end
if lex(global) then end;
left = init;
right = parseExpression(global);
init = (null);
end
end
if (_JS._typeof(left) == ("undefined")) then
if expect(global, (";")) then end;
end
end
if (_JS._typeof(left) == ("undefined")) then
if (not match(global, (";"))) then
test = parseExpression(global);
end
if expect(global, (";")) then end;
if (not match(global, (")"))) then
update = parseExpression(global);
end
end
if expect(global, (")")) then end;
oldInIteration = state.inIteration;
state.inIteration = (true);
body = parseStatement(global);
state.inIteration = oldInIteration;
if true then return ((_JS._typeof(left) == ("undefined")) and {delegate:createForStatement(init, test, update, body)} or {delegate:createForInStatement(left, right, body)})[1]; end;
end);
parseContinueStatement = _JS._func(function (this)
local label, key;
label, key = (null), nil;
if expectKeyword(global, ("continue")) then end;
if (source:charCodeAt(index) == (59)) then
if lex(global) then end;
if (not state.inIteration) then
if throwError(global, _JS._obj({
  }), Messages.IllegalContinue) then end;
end
if true then return delegate:createContinueStatement((null)); end;
end
if _JS._truthy(peekLineTerminator(global)) then
if (not state.inIteration) then
if throwError(global, _JS._obj({
  }), Messages.IllegalContinue) then end;
end
if true then return delegate:createContinueStatement((null)); end;
end
if (lookahead.type == Token.Identifier) then
label = parseVariableIdentifier(global);
key = (("$") + label.name);
if (not Object.prototype.hasOwnProperty:call(state.labelSet, key)) then
if throwError(global, _JS._obj({
  }), Messages.UnknownLabel, label.name) then end;
end
end
if consumeSemicolon(global) then end;
if _JS._truthy((label == (null)) and (not state.inIteration)) then
if throwError(global, _JS._obj({
  }), Messages.IllegalContinue) then end;
end
if true then return delegate:createContinueStatement(label); end;
end);
parseBreakStatement = _JS._func(function (this)
local label, key;
label, key = (null), nil;
if expectKeyword(global, ("break")) then end;
if (source:charCodeAt(index) == (59)) then
if lex(global) then end;
if (not state.inIteration or state.inSwitch) then
if throwError(global, _JS._obj({
  }), Messages.IllegalBreak) then end;
end
if true then return delegate:createBreakStatement((null)); end;
end
if _JS._truthy(peekLineTerminator(global)) then
if (not state.inIteration or state.inSwitch) then
if throwError(global, _JS._obj({
  }), Messages.IllegalBreak) then end;
end
if true then return delegate:createBreakStatement((null)); end;
end
if (lookahead.type == Token.Identifier) then
label = parseVariableIdentifier(global);
key = (("$") + label.name);
if (not Object.prototype.hasOwnProperty:call(state.labelSet, key)) then
if throwError(global, _JS._obj({
  }), Messages.UnknownLabel, label.name) then end;
end
end
if consumeSemicolon(global) then end;
if _JS._truthy((label == (null)) and (not state.inIteration or state.inSwitch)) then
if throwError(global, _JS._obj({
  }), Messages.IllegalBreak) then end;
end
if true then return delegate:createBreakStatement(label); end;
end);
parseReturnStatement = _JS._func(function (this)
local argument;
argument = (null);
if expectKeyword(global, ("return")) then end;
if (not state.inFunctionBody) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.IllegalReturn) then end;
end
if (source:charCodeAt(index) == (32)) then
if _JS._truthy(isIdentifierStart(global, source:charCodeAt((index + (1))))) then
argument = parseExpression(global);
if consumeSemicolon(global) then end;
if true then return delegate:createReturnStatement(argument); end;
end
end
if _JS._truthy(peekLineTerminator(global)) then
if true then return delegate:createReturnStatement((null)); end;
end
if (not match(global, (";"))) then
if _JS._truthy((not match(global, ("}"))) and (lookahead.type ~= Token.EOF)) then
argument = parseExpression(global);
end
end
if consumeSemicolon(global) then end;
if true then return delegate:createReturnStatement(argument); end;
end);
parseWithStatement = _JS._func(function (this)
local object, body;
object, body = nil, nil;
if _JS._truthy(strict) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.StrictModeWith) then end;
end
if expectKeyword(global, ("with")) then end;
if expect(global, ("(")) then end;
object = parseExpression(global);
if expect(global, (")")) then end;
body = parseStatement(global);
if true then return delegate:createWithStatement(object, body); end;
end);
parseSwitchCase = _JS._func(function (this)
local test, consequent, statement;
test, consequent, statement = nil, _JS._arr({}), nil;
if _JS._truthy(matchKeyword(global, ("default"))) then
if lex(global) then end;
test = (null);
else
if expectKeyword(global, ("case")) then end;
test = parseExpression(global);
end
if expect(global, (":")) then end;
while (index < length) do

if _JS._truthy(match(global, ("}")) or matchKeyword(global, ("default")) or matchKeyword(global, ("case"))) then
_c = _JS._break; break;
end
statement = parseStatement(global);
if consequent:push(statement) then end;

end
if true then return delegate:createSwitchCase(test, consequent); end;
end);
parseSwitchStatement = _JS._func(function (this)
local discriminant, cases, clause, oldInSwitch, defaultFound;
discriminant, cases, clause, oldInSwitch, defaultFound = nil, nil, nil, nil, nil;
if expectKeyword(global, ("switch")) then end;
if expect(global, ("(")) then end;
discriminant = parseExpression(global);
if expect(global, (")")) then end;
if expect(global, ("{")) then end;
if _JS._truthy(match(global, ("}"))) then
if lex(global) then end;
if true then return delegate:createSwitchStatement(discriminant); end;
end
cases = _JS._arr({});
oldInSwitch = state.inSwitch;
state.inSwitch = (true);
defaultFound = (false);
while (index < length) do

if _JS._truthy(match(global, ("}"))) then
_c = _JS._break; break;
end
clause = parseSwitchCase(global);
if (clause.test == (null)) then
if _JS._truthy(defaultFound) then
if throwError(global, _JS._obj({
  }), Messages.MultipleDefaultsInSwitch) then end;
end
defaultFound = (true);
end
if cases:push(clause) then end;

end
state.inSwitch = oldInSwitch;
if expect(global, ("}")) then end;
if true then return delegate:createSwitchStatement(discriminant, cases); end;
end);
parseThrowStatement = _JS._func(function (this)
local argument;
argument = nil;
if expectKeyword(global, ("throw")) then end;
if _JS._truthy(peekLineTerminator(global)) then
if throwError(global, _JS._obj({
  }), Messages.NewlineAfterThrow) then end;
end
argument = parseExpression(global);
if consumeSemicolon(global) then end;
if true then return delegate:createThrowStatement(argument); end;
end);
parseCatchClause = _JS._func(function (this)
local param, body;
param, body = nil, nil;
if expectKeyword(global, ("catch")) then end;
if expect(global, ("(")) then end;
if _JS._truthy(match(global, (")"))) then
if throwUnexpected(global, lookahead) then end;
end
param = parseExpression(global);
if _JS._truthy(strict and (param.type == Syntax.Identifier) and isRestrictedWord(global, param.name)) then
if throwErrorTolerant(global, _JS._obj({
  }), Messages.StrictCatchVariable) then end;
end
if expect(global, (")")) then end;
body = parseBlock(global);
if true then return delegate:createCatchClause(param, body); end;
end);
parseTryStatement = _JS._func(function (this)
local block, handlers, finalizer;
block, handlers, finalizer = nil, _JS._arr({}), (null);
if expectKeyword(global, ("try")) then end;
block = parseBlock(global);
if _JS._truthy(matchKeyword(global, ("catch"))) then
if handlers:push(parseCatchClause(global)) then end;
end
if _JS._truthy(matchKeyword(global, ("finally"))) then
if lex(global) then end;
finalizer = parseBlock(global);
end
if _JS._truthy((handlers.length == (0)) and (not finalizer)) then
if throwError(global, _JS._obj({
  }), Messages.NoCatchOrFinally) then end;
end
if true then return delegate:createTryStatement(block, _JS._arr({}), handlers, finalizer); end;
end);
parseDebuggerStatement = _JS._func(function (this)
if expectKeyword(global, ("debugger")) then end;
if consumeSemicolon(global) then end;
if true then return delegate:createDebuggerStatement(); end;
end);
parseStatement = _JS._func(function (this)
local type, expr, labeledBody, key;
type, expr, labeledBody, key = lookahead.type, nil, nil, nil;
if (type == Token.EOF) then
if throwUnexpected(global, lookahead) then end;
end
if (type == Token.Punctuator) then
repeat
local _0 = (";"); local _1 = ("{"); local _2 = ("("); local _3;
local _r = lookahead.value;
if _r == _0 then
if true then return parseEmptyStatement(global); end;
_r = _1;
end
if _r == _1 then
if true then return parseBlock(global); end;
_r = _2;
end
if _r == _2 then
if true then return parseExpressionStatement(global); end;
_r = _3;
end
_c = _JS._break; break;
until true
end
if (type == Token.Keyword) then
repeat
local _0 = ("break"); local _1 = ("continue"); local _2 = ("debugger"); local _3 = ("do"); local _4 = ("for"); local _5 = ("function"); local _6 = ("if"); local _7 = ("return"); local _8 = ("switch"); local _9 = ("throw"); local _10 = ("try"); local _11 = ("var"); local _12 = ("while"); local _13 = ("with"); local _14;
local _r = lookahead.value;
if _r == _0 then
if true then return parseBreakStatement(global); end;
_r = _1;
end
if _r == _1 then
if true then return parseContinueStatement(global); end;
_r = _2;
end
if _r == _2 then
if true then return parseDebuggerStatement(global); end;
_r = _3;
end
if _r == _3 then
if true then return parseDoWhileStatement(global); end;
_r = _4;
end
if _r == _4 then
if true then return parseForStatement(global); end;
_r = _5;
end
if _r == _5 then
if true then return parseFunctionDeclaration(global); end;
_r = _6;
end
if _r == _6 then
if true then return parseIfStatement(global); end;
_r = _7;
end
if _r == _7 then
if true then return parseReturnStatement(global); end;
_r = _8;
end
if _r == _8 then
if true then return parseSwitchStatement(global); end;
_r = _9;
end
if _r == _9 then
if true then return parseThrowStatement(global); end;
_r = _10;
end
if _r == _10 then
if true then return parseTryStatement(global); end;
_r = _11;
end
if _r == _11 then
if true then return parseVariableStatement(global); end;
_r = _12;
end
if _r == _12 then
if true then return parseWhileStatement(global); end;
_r = _13;
end
if _r == _13 then
if true then return parseWithStatement(global); end;
_r = _14;
end
_c = _JS._break; break;
until true
end
expr = parseExpression(global);
if _JS._truthy((expr.type == Syntax.Identifier) and match(global, (":"))) then
if lex(global) then end;
key = (("$") + expr.name);
if _JS._truthy(Object.prototype.hasOwnProperty:call(state.labelSet, key)) then
if throwError(global, _JS._obj({
  }), Messages.Redeclaration, ("Label"), expr.name) then end;
end
state.labelSet[key] = (true);
labeledBody = parseStatement(global);
state.labelSet[key] = nil;
if true then return delegate:createLabeledStatement(expr, labeledBody); end;
end
if consumeSemicolon(global) then end;
if true then return delegate:createExpressionStatement(expr); end;
end);
parseFunctionSourceElements = _JS._func(function (this)
local sourceElement, sourceElements, token, directive, firstRestricted, oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody;
sourceElement, sourceElements, token, directive, firstRestricted, oldLabelSet, oldInIteration, oldInSwitch, oldInFunctionBody = nil, _JS._arr({}), nil, nil, nil, nil, nil, nil, nil;
if expect(global, ("{")) then end;
while (index < length) do

if (lookahead.type ~= Token.StringLiteral) then
_c = _JS._break; break;
end
token = lookahead;
sourceElement = parseSourceElement(global);
if sourceElements:push(sourceElement) then end;
if (sourceElement.expression.type ~= Syntax.Literal) then
_c = _JS._break; break;
end
directive = source:slice((token.range[(0)] + (1)), (token.range[(1)] - (1)));
if (directive == ("use strict")) then
strict = (true);
if _JS._truthy(firstRestricted) then
if throwErrorTolerant(global, firstRestricted, Messages.StrictOctalLiteral) then end;
end
else
if _JS._truthy((not firstRestricted) and token.octal) then
firstRestricted = token;
end
end

end
oldLabelSet = state.labelSet;
oldInIteration = state.inIteration;
oldInSwitch = state.inSwitch;
oldInFunctionBody = state.inFunctionBody;
state.labelSet = _JS._obj({
  });
state.inIteration = (false);
state.inSwitch = (false);
state.inFunctionBody = (true);
while (index < length) do

if _JS._truthy(match(global, ("}"))) then
_c = _JS._break; break;
end
sourceElement = parseSourceElement(global);
if (_JS._typeof(sourceElement) == ("undefined")) then
_c = _JS._break; break;
end
if sourceElements:push(sourceElement) then end;

end
if expect(global, ("}")) then end;
state.labelSet = oldLabelSet;
state.inIteration = oldInIteration;
state.inSwitch = oldInSwitch;
state.inFunctionBody = oldInFunctionBody;
if true then return delegate:createBlockStatement(sourceElements); end;
end);
parseParams = _JS._func(function (this, firstRestricted)
local param, params, token, stricted, paramSet, key, message;
param, params, token, stricted, paramSet, key, message = nil, _JS._arr({}), nil, nil, nil, nil, nil;
if expect(global, ("(")) then end;
if (not match(global, (")"))) then
paramSet = _JS._obj({
  });
while (index < length) do

token = lookahead;
param = parseVariableIdentifier(global);
key = (("$") + token.value);
if _JS._truthy(strict) then
if _JS._truthy(isRestrictedWord(global, token.value)) then
stricted = token;
message = Messages.StrictParamName;
end
if _JS._truthy(Object.prototype.hasOwnProperty:call(paramSet, key)) then
stricted = token;
message = Messages.StrictParamDupe;
end
else
if (not firstRestricted) then
if _JS._truthy(isRestrictedWord(global, token.value)) then
firstRestricted = token;
message = Messages.StrictParamName;
else
if _JS._truthy(isStrictModeReservedWord(global, token.value)) then
firstRestricted = token;
message = Messages.StrictReservedWord;
else
if _JS._truthy(Object.prototype.hasOwnProperty:call(paramSet, key)) then
firstRestricted = token;
message = Messages.StrictParamDupe;
end
end
end
end
end
if params:push(param) then end;
paramSet[key] = (true);
if _JS._truthy(match(global, (")"))) then
_c = _JS._break; break;
end
if expect(global, (",")) then end;

end
end
if expect(global, (")")) then end;
if true then return _JS._obj({
  ["params"]=params,
  ["stricted"]=stricted,
  ["firstRestricted"]=firstRestricted,
  ["message"]=message}); end;
end);
parseFunctionDeclaration = _JS._func(function (this)
local id, params, body, token, stricted, tmp, firstRestricted, message, previousStrict;
id, params, body, token, stricted, tmp, firstRestricted, message, previousStrict = nil, _JS._arr({}), nil, nil, nil, nil, nil, nil, nil;
if expectKeyword(global, ("function")) then end;
token = lookahead;
id = parseVariableIdentifier(global);
if _JS._truthy(strict) then
if _JS._truthy(isRestrictedWord(global, token.value)) then
if throwErrorTolerant(global, token, Messages.StrictFunctionName) then end;
end
else
if _JS._truthy(isRestrictedWord(global, token.value)) then
firstRestricted = token;
message = Messages.StrictFunctionName;
else
if _JS._truthy(isStrictModeReservedWord(global, token.value)) then
firstRestricted = token;
message = Messages.StrictReservedWord;
end
end
end
tmp = parseParams(global, firstRestricted);
params = tmp.params;
stricted = tmp.stricted;
firstRestricted = tmp.firstRestricted;
if _JS._truthy(tmp.message) then
message = tmp.message;
end
previousStrict = strict;
body = parseFunctionSourceElements(global);
if _JS._truthy(strict and firstRestricted) then
if throwError(global, firstRestricted, message) then end;
end
if _JS._truthy(strict and stricted) then
if throwErrorTolerant(global, stricted, message) then end;
end
strict = previousStrict;
if true then return delegate:createFunctionDeclaration(id, params, _JS._arr({}), body); end;
end);
parseFunctionExpression = _JS._func(function (this)
local token, id, stricted, firstRestricted, message, tmp, params, body, previousStrict;
token, id, stricted, firstRestricted, message, tmp, params, body, previousStrict = nil, (null), nil, nil, nil, nil, _JS._arr({}), nil, nil;
if expectKeyword(global, ("function")) then end;
if (not match(global, ("("))) then
token = lookahead;
id = parseVariableIdentifier(global);
if _JS._truthy(strict) then
if _JS._truthy(isRestrictedWord(global, token.value)) then
if throwErrorTolerant(global, token, Messages.StrictFunctionName) then end;
end
else
if _JS._truthy(isRestrictedWord(global, token.value)) then
firstRestricted = token;
message = Messages.StrictFunctionName;
else
if _JS._truthy(isStrictModeReservedWord(global, token.value)) then
firstRestricted = token;
message = Messages.StrictReservedWord;
end
end
end
end
tmp = parseParams(global, firstRestricted);
params = tmp.params;
stricted = tmp.stricted;
firstRestricted = tmp.firstRestricted;
if _JS._truthy(tmp.message) then
message = tmp.message;
end
previousStrict = strict;
body = parseFunctionSourceElements(global);
if _JS._truthy(strict and firstRestricted) then
if throwError(global, firstRestricted, message) then end;
end
if _JS._truthy(strict and stricted) then
if throwErrorTolerant(global, stricted, message) then end;
end
strict = previousStrict;
if true then return delegate:createFunctionExpression(id, params, _JS._arr({}), body); end;
end);
parseSourceElement = _JS._func(function (this)
if (lookahead.type == Token.Keyword) then
repeat
local _0 = ("const"); local _1 = ("let"); local _2 = ("function"); local _3;
local _r = lookahead.value;
if _r == _0 then

_r = _1;
end
if _r == _1 then
if true then return parseConstLetDeclaration(global, lookahead.value); end;
_r = _2;
end
if _r == _2 then
if true then return parseFunctionDeclaration(global); end;
_r = _3;
end
if true then return parseStatement(global); end;
until true
end
if (lookahead.type ~= Token.EOF) then
if true then return parseStatement(global); end;
end
end);
parseSourceElements = _JS._func(function (this)
local sourceElement, sourceElements, token, directive, firstRestricted;
sourceElement, sourceElements, token, directive, firstRestricted = nil, _JS._arr({}), nil, nil, nil;
while (index < length) do

token = lookahead;
if (token.type ~= Token.StringLiteral) then
_c = _JS._break; break;
end
sourceElement = parseSourceElement(global);
if sourceElements:push(sourceElement) then end;
if (sourceElement.expression.type ~= Syntax.Literal) then
_c = _JS._break; break;
end
directive = source:slice((token.range[(0)] + (1)), (token.range[(1)] - (1)));
if (directive == ("use strict")) then
strict = (true);
if _JS._truthy(firstRestricted) then
if throwErrorTolerant(global, firstRestricted, Messages.StrictOctalLiteral) then end;
end
else
if _JS._truthy((not firstRestricted) and token.octal) then
firstRestricted = token;
end
end

end
while (index < length) do

sourceElement = parseSourceElement(global);
if (_JS._typeof(sourceElement) == ("undefined")) then
_c = _JS._break; break;
end
if sourceElements:push(sourceElement) then end;

end
if true then return sourceElements; end;
end);
parseProgram = _JS._func(function (this)
local body;
body = nil;
strict = (false);
if peek(global) then end;
body = parseSourceElements(global);
if true then return delegate:createProgram(body); end;
end);
addComment = _JS._func(function (this, type, value, start, _K_end, loc)
if assert(global, (_JS._typeof(start) == ("number")), ("Comment must have valid position")) then end;
if (extra.comments.length > (0)) then
if (extra.comments[(extra.comments.length - (1))].range[(1)] > start) then
if true then return; end;
end
end
if extra.comments:push(_JS._obj({
  ["type"]=type,
  ["value"]=value,
  ["range"]=_JS._arr({[0]=start, _K_end}),
  ["loc"]=loc})) then end;
end);
scanComment = _JS._func(function (this)
local comment, ch, loc, start, blockComment, lineComment;
comment, ch, loc, start, blockComment, lineComment = nil, nil, nil, nil, nil, nil;
comment = ("");
blockComment = (false);
lineComment = (false);
while (index < length) do

ch = source[index];
if _JS._truthy(lineComment) then
ch = source[(function () local _r = index; index = _r + 1; return _r end)()];
if _JS._truthy(isLineTerminator(global, ch:charCodeAt((0)))) then
loc._K_end = _JS._obj({
  ["line"]=lineNumber,
  ["column"]=((index - lineStart) - (1))});
lineComment = (false);
if addComment(global, ("Line"), comment, start, (index - (1)), loc) then end;
if _JS._truthy((ch == ("\r")) and (source[index] == ("\n"))) then
(function () index = index + 1; return index; end)();
end
(function () lineNumber = lineNumber + 1; return lineNumber; end)();
lineStart = index;
comment = ("");
else
if (index >= length) then
lineComment = (false);
comment = comment + ch;
loc._K_end = _JS._obj({
  ["line"]=lineNumber,
  ["column"]=(length - lineStart)});
if addComment(global, ("Line"), comment, start, length, loc) then end;
else
comment = comment + ch;
end
end
else
if _JS._truthy(blockComment) then
if _JS._truthy(isLineTerminator(global, ch:charCodeAt((0)))) then
if _JS._truthy((ch == ("\r")) and (source[(index + (1))] == ("\n"))) then
(function () index = index + 1; return index; end)();
comment = comment + ("\r\n");
else
comment = comment + ch;
end
(function () lineNumber = lineNumber + 1; return lineNumber; end)();
(function () index = index + 1; return index; end)();
lineStart = index;
if (index >= length) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
else
ch = source[(function () local _r = index; index = _r + 1; return _r end)()];
if (index >= length) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
comment = comment + ch;
if (ch == ("*")) then
ch = source[index];
if (ch == ("/")) then
comment = comment:substr((0), (comment.length - (1)));
blockComment = (false);
(function () index = index + 1; return index; end)();
loc._K_end = _JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)});
if addComment(global, ("Block"), comment, start, index, loc) then end;
comment = ("");
end
end
end
else
if (ch == ("/")) then
ch = source[(index + (1))];
if (ch == ("/")) then
loc = _JS._obj({
  ["start"]=_JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)})});
start = index;
index = index + (2);
lineComment = (true);
if (index >= length) then
loc._K_end = _JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)});
lineComment = (false);
if addComment(global, ("Line"), comment, start, index, loc) then end;
end
else
if (ch == ("*")) then
start = index;
index = index + (2);
blockComment = (true);
loc = _JS._obj({
  ["start"]=_JS._obj({
  ["line"]=lineNumber,
  ["column"]=((index - lineStart) - (2))})});
if (index >= length) then
if throwError(global, _JS._obj({
  }), Messages.UnexpectedToken, ("ILLEGAL")) then end;
end
else
_c = _JS._break; break;
end
end
else
if _JS._truthy(isWhiteSpace(global, ch:charCodeAt((0)))) then
(function () index = index + 1; return index; end)();
else
if _JS._truthy(isLineTerminator(global, ch:charCodeAt((0)))) then
(function () index = index + 1; return index; end)();
if _JS._truthy((ch == ("\r")) and (source[index] == ("\n"))) then
(function () index = index + 1; return index; end)();
end
(function () lineNumber = lineNumber + 1; return lineNumber; end)();
lineStart = index;
else
_c = _JS._break; break;
end
end
end
end
end

end
end);
filterCommentLocation = _JS._func(function (this)
local i, entry, comment, comments;
i, entry, comment, comments = nil, nil, nil, _JS._arr({});
(function () local _r = (0); i = _r; return _r; end)()
while (i < extra.comments.length) do

entry = extra.comments[i];
comment = _JS._obj({
  ["type"]=entry.type,
  ["value"]=entry.value});
if _JS._truthy(extra.range) then
comment.range = entry.range;
end
if _JS._truthy(extra.loc) then
comment.loc = entry.loc;
end
if comments:push(comment) then end;

(function () i = i + 1; return i; end)()
end
extra.comments = comments;
end);
collectToken = _JS._func(function (this)
local start, loc, token, range, value;
start, loc, token, range, value = nil, nil, nil, nil, nil;
if skipComment(global) then end;
start = index;
loc = _JS._obj({
  ["start"]=_JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)})});
token = extra:advance();
loc._K_end = _JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)});
if (token.type ~= Token.EOF) then
range = _JS._arr({[0]=token.range[(0)], token.range[(1)]});
value = source:slice(token.range[(0)], token.range[(1)]);
if extra.tokens:push(_JS._obj({
  ["type"]=TokenName[token.type],
  ["value"]=value,
  ["range"]=range,
  ["loc"]=loc})) then end;
end
if true then return token; end;
end);
collectRegex = _JS._func(function (this)
local pos, loc, regex, token;
pos, loc, regex, token = nil, nil, nil, nil;
if skipComment(global) then end;
pos = index;
loc = _JS._obj({
  ["start"]=_JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)})});
regex = extra:scanRegExp();
loc._K_end = _JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)});
if (not extra.tokenize) then
if (extra.tokens.length > (0)) then
token = extra.tokens[(extra.tokens.length - (1))];
if _JS._truthy((token.range[(0)] == pos) and (token.type == ("Punctuator"))) then
if _JS._truthy((token.value == ("/")) or (token.value == ("/="))) then
if extra.tokens:pop() then end;
end
end
end
if extra.tokens:push(_JS._obj({
  ["type"]=("RegularExpression"),
  ["value"]=regex.literal,
  ["range"]=_JS._arr({[0]=pos, index}),
  ["loc"]=loc})) then end;
end
if true then return regex; end;
end);
filterTokenLocation = _JS._func(function (this)
local i, entry, token, tokens;
i, entry, token, tokens = nil, nil, nil, _JS._arr({});
(function () local _r = (0); i = _r; return _r; end)()
while (i < extra.tokens.length) do

entry = extra.tokens[i];
token = _JS._obj({
  ["type"]=entry.type,
  ["value"]=entry.value});
if _JS._truthy(extra.range) then
token.range = entry.range;
end
if _JS._truthy(extra.loc) then
token.loc = entry.loc;
end
if tokens:push(token) then end;

(function () i = i + 1; return i; end)()
end
extra.tokens = tokens;
end);
createLocationMarker = _JS._func(function (this)
local marker;
marker = _JS._obj({
  });
marker.range = _JS._arr({[0]=index, index});
marker.loc = _JS._obj({
  ["start"]=_JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)}),
  ["_K_end"]=_JS._obj({
  ["line"]=lineNumber,
  ["column"]=(index - lineStart)})});
marker._K_end = _JS._func(function (this)
this.range[(1)] = index;
this.loc._K_end.line = lineNumber;
this.loc._K_end.column = (index - lineStart);
end);
marker.applyGroup = _JS._func(function (this, node)
if _JS._truthy(extra.range) then
node.groupRange = _JS._arr({[0]=this.range[(0)], this.range[(1)]});
end
if _JS._truthy(extra.loc) then
node.groupLoc = _JS._obj({
  ["start"]=_JS._obj({
  ["line"]=this.loc.start.line,
  ["column"]=this.loc.start.column}),
  ["_K_end"]=_JS._obj({
  ["line"]=this.loc._K_end.line,
  ["column"]=this.loc._K_end.column})});
node = delegate:postProcess(node);
end
end);
marker.apply = _JS._func(function (this, node)
if _JS._truthy(extra.range) then
node.range = _JS._arr({[0]=this.range[(0)], this.range[(1)]});
end
if _JS._truthy(extra.loc) then
node.loc = _JS._obj({
  ["start"]=_JS._obj({
  ["line"]=this.loc.start.line,
  ["column"]=this.loc.start.column}),
  ["_K_end"]=_JS._obj({
  ["line"]=this.loc._K_end.line,
  ["column"]=this.loc._K_end.column})});
node = delegate:postProcess(node);
end
end);
if true then return marker; end;
end);
trackGroupExpression = _JS._func(function (this)
local marker, expr;
marker, expr = nil, nil;
if skipComment(global) then end;
marker = createLocationMarker(global);
if expect(global, ("(")) then end;
expr = parseExpression(global);
if expect(global, (")")) then end;
if marker:_K_end() then end;
if marker:applyGroup(expr) then end;
if true then return expr; end;
end);
trackLeftHandSideExpression = _JS._func(function (this)
local marker, expr, property;
marker, expr, property = nil, nil, nil;
if skipComment(global) then end;
marker = createLocationMarker(global);
expr = (_JS._truthy(matchKeyword(global, ("new"))) and {parseNewExpression(global)} or {parsePrimaryExpression(global)})[1];
while _JS._truthy(match(global, (".")) or match(global, ("["))) do

if _JS._truthy(match(global, ("["))) then
property = parseComputedMember(global);
expr = delegate:createMemberExpression(("["), expr, property);
if marker:_K_end() then end;
if marker:apply(expr) then end;
else
property = parseNonComputedMember(global);
expr = delegate:createMemberExpression(("."), expr, property);
if marker:_K_end() then end;
if marker:apply(expr) then end;
end

end
if true then return expr; end;
end);
trackLeftHandSideExpressionAllowCall = _JS._func(function (this)
local marker, expr, args, property;
marker, expr, args, property = nil, nil, nil, nil;
if skipComment(global) then end;
marker = createLocationMarker(global);
expr = (_JS._truthy(matchKeyword(global, ("new"))) and {parseNewExpression(global)} or {parsePrimaryExpression(global)})[1];
while _JS._truthy(match(global, (".")) or match(global, ("[")) or match(global, ("("))) do

if _JS._truthy(match(global, ("("))) then
args = parseArguments(global);
expr = delegate:createCallExpression(expr, args);
if marker:_K_end() then end;
if marker:apply(expr) then end;
else
if _JS._truthy(match(global, ("["))) then
property = parseComputedMember(global);
expr = delegate:createMemberExpression(("["), expr, property);
if marker:_K_end() then end;
if marker:apply(expr) then end;
else
property = parseNonComputedMember(global);
expr = delegate:createMemberExpression(("."), expr, property);
if marker:_K_end() then end;
if marker:apply(expr) then end;
end
end

end
if true then return expr; end;
end);
filterGroup = _JS._func(function (this, node)
local name;
name = nil;
node.groupRange = nil;
node.groupLoc = nil;
for name in _JS._pairs(node) do
if _JS._truthy(node:hasOwnProperty(name) and (_JS._typeof(node[name]) == ("object")) and node[name]) then
if _JS._truthy(node[name].type or node[name].length and (not node[name].substr)) then
if filterGroup(global, node[name]) then end;
end
end
end
end);
wrapTrackingFunction = _JS._func(function (this, range, loc)
if true then return _JS._func(function (this, parseFunction)
local isBinary, visit;
isBinary = _JS._func(function (this, node)
if true then return (node.type == Syntax.LogicalExpression) or (node.type == Syntax.BinaryExpression); end;
end);
visit = _JS._func(function (this, node)
local start, __K__end;
start, _K_end = nil, nil;
if _JS._truthy(isBinary(global, node.left)) then
if visit(global, node.left) then end;
end
if _JS._truthy(isBinary(global, node.right)) then
if visit(global, node.right) then end;
end
if _JS._truthy(range) then
if _JS._truthy(node.left.groupRange or node.right.groupRange) then
start = (_JS._truthy(node.left.groupRange) and {node.left.groupRange[(0)]} or {node.left.range[(0)]})[1];
_K_end = (_JS._truthy(node.right.groupRange) and {node.right.groupRange[(1)]} or {node.right.range[(1)]})[1];
node.range = _JS._arr({[0]=start, _K_end});
else
if (_JS._typeof(node.range) == ("undefined")) then
start = node.left.range[(0)];
_K_end = node.right.range[(1)];
node.range = _JS._arr({[0]=start, _K_end});
end
end
end
if _JS._truthy(loc) then
if _JS._truthy(node.left.groupLoc or node.right.groupLoc) then
start = (_JS._truthy(node.left.groupLoc) and {node.left.groupLoc.start} or {node.left.loc.start})[1];
_K_end = (_JS._truthy(node.right.groupLoc) and {node.right.groupLoc._K_end} or {node.right.loc._K_end})[1];
node.loc = _JS._obj({
  ["start"]=start,
  ["_K_end"]=_K_end});
node = delegate:postProcess(node);
else
if (_JS._typeof(node.loc) == ("undefined")) then
node.loc = _JS._obj({
  ["start"]=node.left.loc.start,
  ["_K_end"]=node.right.loc._K_end});
node = delegate:postProcess(node);
end
end
end
end);
if true then return _JS._func(function (this, ...)
local arguments = _JS._arr((function (...) return arg; end)(...)); arguments:shift();
local marker, node;
marker, node = nil, nil;
if skipComment(global) then end;
marker = createLocationMarker(global);
node = parseFunction:apply((null), arguments);
if marker:_K_end() then end;
if _JS._truthy(range and (_JS._typeof(node.range) == ("undefined"))) then
if marker:apply(node) then end;
end
if _JS._truthy(loc and (_JS._typeof(node.loc) == ("undefined"))) then
if marker:apply(node) then end;
end
if _JS._truthy(isBinary(global, node)) then
if visit(global, node) then end;
end
if true then return node; end;
end); end;
end); end;
end);
patch = _JS._func(function (this)
local wrapTracking;
wrapTracking = nil;
if _JS._truthy(extra.comments) then
extra.skipComment = skipComment;
skipComment = scanComment;
end
if _JS._truthy(extra.range or extra.loc) then
extra.parseGroupExpression = parseGroupExpression;
extra.parseLeftHandSideExpression = parseLeftHandSideExpression;
extra.parseLeftHandSideExpressionAllowCall = parseLeftHandSideExpressionAllowCall;
parseGroupExpression = trackGroupExpression;
parseLeftHandSideExpression = trackLeftHandSideExpression;
parseLeftHandSideExpressionAllowCall = trackLeftHandSideExpressionAllowCall;
wrapTracking = wrapTrackingFunction(global, extra.range, extra.loc);
extra.parseAssignmentExpression = parseAssignmentExpression;
extra.parseBinaryExpression = parseBinaryExpression;
extra.parseBlock = parseBlock;
extra.parseFunctionSourceElements = parseFunctionSourceElements;
extra.parseCatchClause = parseCatchClause;
extra.parseComputedMember = parseComputedMember;
extra.parseConditionalExpression = parseConditionalExpression;
extra.parseConstLetDeclaration = parseConstLetDeclaration;
extra.parseExpression = parseExpression;
extra.parseForVariableDeclaration = parseForVariableDeclaration;
extra.parseFunctionDeclaration = parseFunctionDeclaration;
extra.parseFunctionExpression = parseFunctionExpression;
extra.parseNewExpression = parseNewExpression;
extra.parseNonComputedProperty = parseNonComputedProperty;
extra.parseObjectProperty = parseObjectProperty;
extra.parseObjectPropertyKey = parseObjectPropertyKey;
extra.parsePostfixExpression = parsePostfixExpression;
extra.parsePrimaryExpression = parsePrimaryExpression;
extra.parseProgram = parseProgram;
extra.parsePropertyFunction = parsePropertyFunction;
extra.parseStatement = parseStatement;
extra.parseSwitchCase = parseSwitchCase;
extra.parseUnaryExpression = parseUnaryExpression;
extra.parseVariableDeclaration = parseVariableDeclaration;
extra.parseVariableIdentifier = parseVariableIdentifier;
parseAssignmentExpression = wrapTracking(global, extra.parseAssignmentExpression);
parseBinaryExpression = wrapTracking(global, extra.parseBinaryExpression);
parseBlock = wrapTracking(global, extra.parseBlock);
parseFunctionSourceElements = wrapTracking(global, extra.parseFunctionSourceElements);
parseCatchClause = wrapTracking(global, extra.parseCatchClause);
parseComputedMember = wrapTracking(global, extra.parseComputedMember);
parseConditionalExpression = wrapTracking(global, extra.parseConditionalExpression);
parseConstLetDeclaration = wrapTracking(global, extra.parseConstLetDeclaration);
parseExpression = wrapTracking(global, extra.parseExpression);
parseForVariableDeclaration = wrapTracking(global, extra.parseForVariableDeclaration);
parseFunctionDeclaration = wrapTracking(global, extra.parseFunctionDeclaration);
parseFunctionExpression = wrapTracking(global, extra.parseFunctionExpression);
parseLeftHandSideExpression = wrapTracking(global, parseLeftHandSideExpression);
parseNewExpression = wrapTracking(global, extra.parseNewExpression);
parseNonComputedProperty = wrapTracking(global, extra.parseNonComputedProperty);
parseObjectProperty = wrapTracking(global, extra.parseObjectProperty);
parseObjectPropertyKey = wrapTracking(global, extra.parseObjectPropertyKey);
parsePostfixExpression = wrapTracking(global, extra.parsePostfixExpression);
parsePrimaryExpression = wrapTracking(global, extra.parsePrimaryExpression);
parseProgram = wrapTracking(global, extra.parseProgram);
parsePropertyFunction = wrapTracking(global, extra.parsePropertyFunction);
parseStatement = wrapTracking(global, extra.parseStatement);
parseSwitchCase = wrapTracking(global, extra.parseSwitchCase);
parseUnaryExpression = wrapTracking(global, extra.parseUnaryExpression);
parseVariableDeclaration = wrapTracking(global, extra.parseVariableDeclaration);
parseVariableIdentifier = wrapTracking(global, extra.parseVariableIdentifier);
end
if (_JS._typeof(extra.tokens) ~= ("undefined")) then
extra.advance = advance;
extra.scanRegExp = scanRegExp;
advance = collectToken;
scanRegExp = collectRegex;
end
end);
unpatch = _JS._func(function (this)
if (_JS._typeof(extra.skipComment) == ("function")) then
skipComment = extra.skipComment;
end
if _JS._truthy(extra.range or extra.loc) then
parseAssignmentExpression = extra.parseAssignmentExpression;
parseBinaryExpression = extra.parseBinaryExpression;
parseBlock = extra.parseBlock;
parseFunctionSourceElements = extra.parseFunctionSourceElements;
parseCatchClause = extra.parseCatchClause;
parseComputedMember = extra.parseComputedMember;
parseConditionalExpression = extra.parseConditionalExpression;
parseConstLetDeclaration = extra.parseConstLetDeclaration;
parseExpression = extra.parseExpression;
parseForVariableDeclaration = extra.parseForVariableDeclaration;
parseFunctionDeclaration = extra.parseFunctionDeclaration;
parseFunctionExpression = extra.parseFunctionExpression;
parseGroupExpression = extra.parseGroupExpression;
parseLeftHandSideExpression = extra.parseLeftHandSideExpression;
parseLeftHandSideExpressionAllowCall = extra.parseLeftHandSideExpressionAllowCall;
parseNewExpression = extra.parseNewExpression;
parseNonComputedProperty = extra.parseNonComputedProperty;
parseObjectProperty = extra.parseObjectProperty;
parseObjectPropertyKey = extra.parseObjectPropertyKey;
parsePrimaryExpression = extra.parsePrimaryExpression;
parsePostfixExpression = extra.parsePostfixExpression;
parseProgram = extra.parseProgram;
parsePropertyFunction = extra.parsePropertyFunction;
parseStatement = extra.parseStatement;
parseSwitchCase = extra.parseSwitchCase;
parseUnaryExpression = extra.parseUnaryExpression;
parseVariableDeclaration = extra.parseVariableDeclaration;
parseVariableIdentifier = extra.parseVariableIdentifier;
end
if (_JS._typeof(extra.scanRegExp) == ("function")) then
advance = extra.advance;
scanRegExp = extra.scanRegExp;
end
end);
extend = _JS._func(function (this, object, properties)
local entry, result;
entry, result = nil, _JS._obj({
  });
for entry in _JS._pairs(object) do
if _JS._truthy(object:hasOwnProperty(entry)) then
result[entry] = object[entry];
end
end
for entry in _JS._pairs(properties) do
if _JS._truthy(properties:hasOwnProperty(entry)) then
result[entry] = properties[entry];
end
end
if true then return result; end;
end);
tokenize = _JS._func(function (this, code, options)
local toString, token, tokens;
toString, token, tokens = nil, nil, nil;
toString = String;
if _JS._truthy((_JS._typeof(code) ~= ("string")) and (not _JS._instanceof(code, String))) then
code = toString(global, code);
end
delegate = SyntaxTreeDelegate;
source = code;
index = (0);
lineNumber = ((source.length > (0)) and {(1)} or {(0)})[1];
lineStart = (0);
length = source.length;
lookahead = (null);
state = _JS._obj({
  ["allowIn"]=(true),
  ["labelSet"]=_JS._obj({
  }),
  ["inFunctionBody"]=(false),
  ["inIteration"]=(false),
  ["inSwitch"]=(false)});
extra = _JS._obj({
  });
options = options or _JS._obj({
  });
options.tokens = (true);
extra.tokens = _JS._arr({});
extra.tokenize = (true);
extra.openParenToken = (-(1));
extra.openCurlyToken = (-(1));
extra.range = (_JS._typeof(options.range) == ("boolean")) and options.range;
extra.loc = (_JS._typeof(options.loc) == ("boolean")) and options.loc;
if _JS._truthy((_JS._typeof(options.comment) == ("boolean")) and options.comment) then
extra.comments = _JS._arr({});
end
if _JS._truthy((_JS._typeof(options.tolerant) == ("boolean")) and options.tolerant) then
extra.errors = _JS._arr({});
end
if (length > (0)) then
if (_JS._typeof(source[(0)]) == ("undefined")) then
if _JS._instanceof(code, String) then
source = code:valueOf();
end
end
end
if patch(global) then end;
local _e = nil
local _s, _r = xpcall(function ()
if peek(global) then end;
if (lookahead.type == Token.EOF) then
if true then return extra.tokens; end;
end
token = lex(global);
while (lookahead.type ~= Token.EOF) do

local _e = nil
local _s, _r = xpcall(function ()
token = lex(global);
    end, function (err)
        _e = err
    end)
if _s == false then
lexError = _e;
token = lookahead;
if _JS._truthy(extra.errors) then
if extra.errors:push(lexError) then end;
_c = _JS._break; return _JS._break;
else
error(lexError)
end
end

if _r == _JS._break then
break;
elseif _r == _JS._cont then
break;
end

end
if filterTokenLocation(global) then end;
tokens = extra.tokens;
if (_JS._typeof(extra.comments) ~= ("undefined")) then
if filterCommentLocation(global) then end;
tokens.comments = extra.comments;
end
if (_JS._typeof(extra.errors) ~= ("undefined")) then
tokens.errors = extra.errors;
end
    end, function (err)
        _e = err
    end)
if _s == false then
e = _e;
error(e)
end
if unpatch(global) then end;
extra = _JS._obj({
  });
if true then return tokens; end;
end);
parse = _JS._func(function (this, code, options)
local program, toString;
program, toString = nil, nil;
toString = String;
if _JS._truthy((_JS._typeof(code) ~= ("string")) and (not _JS._instanceof(code, String))) then
code = toString(global, code);
end
delegate = SyntaxTreeDelegate;
source = code;
index = (0);
lineNumber = ((source.length > (0)) and {(1)} or {(0)})[1];
lineStart = (0);
length = source.length;
lookahead = (null);
state = _JS._obj({
  ["allowIn"]=(true),
  ["labelSet"]=_JS._obj({
  }),
  ["inFunctionBody"]=(false),
  ["inIteration"]=(false),
  ["inSwitch"]=(false)});
extra = _JS._obj({
  });
if (_JS._typeof(options) ~= ("undefined")) then
extra.range = (_JS._typeof(options.range) == ("boolean")) and options.range;
extra.loc = (_JS._typeof(options.loc) == ("boolean")) and options.loc;
if _JS._truthy(extra.loc and (options.source ~= (null)) and (options.source ~= undefined)) then
delegate = extend(global, delegate, _JS._obj({
  ["(\"postProcess\")"]=_JS._func(function (this, node)
node.loc.source = toString(global, options.source);
if true then return node; end;
end)}));
end
if _JS._truthy((_JS._typeof(options.tokens) == ("boolean")) and options.tokens) then
extra.tokens = _JS._arr({});
end
if _JS._truthy((_JS._typeof(options.comment) == ("boolean")) and options.comment) then
extra.comments = _JS._arr({});
end
if _JS._truthy((_JS._typeof(options.tolerant) == ("boolean")) and options.tolerant) then
extra.errors = _JS._arr({});
end
end
if (length > (0)) then
if (_JS._typeof(source[(0)]) == ("undefined")) then
if _JS._instanceof(code, String) then
source = code:valueOf();
end
end
end
if patch(global) then end;
local _e = nil
local _s, _r = xpcall(function ()
program = parseProgram(global);
if (_JS._typeof(extra.comments) ~= ("undefined")) then
if filterCommentLocation(global) then end;
program.comments = extra.comments;
end
if (_JS._typeof(extra.tokens) ~= ("undefined")) then
if filterTokenLocation(global) then end;
program.tokens = extra.tokens;
end
if (_JS._typeof(extra.errors) ~= ("undefined")) then
program.errors = extra.errors;
end
if _JS._truthy(extra.range or extra.loc) then
if filterGroup(global, program.body) then end;
end
    end, function (err)
        _e = err
    end)
if _s == false then
e = _e;
error(e)
end
if unpatch(global) then end;
extra = _JS._obj({
  });
if true then return program; end;
end);
if ("use strict") then end;
Token, TokenName, FnExprTokens, Syntax, PropertyKind, Messages, Regex, SyntaxTreeDelegate, source, strict, index, lineNumber, lineStart, length, delegate, lookahead, state, extra = nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil, nil;
Token = _JS._obj({
  ["BooleanLiteral"]=(1),
  ["EOF"]=(2),
  ["Identifier"]=(3),
  ["Keyword"]=(4),
  ["NullLiteral"]=(5),
  ["NumericLiteral"]=(6),
  ["Punctuator"]=(7),
  ["StringLiteral"]=(8),
  ["RegularExpression"]=(9)});
TokenName = _JS._obj({
  });
TokenName[Token.BooleanLiteral] = ("Boolean");
TokenName[Token.EOF] = ("<end>");
TokenName[Token.Identifier] = ("Identifier");
TokenName[Token.Keyword] = ("Keyword");
TokenName[Token.NullLiteral] = ("Null");
TokenName[Token.NumericLiteral] = ("Numeric");
TokenName[Token.Punctuator] = ("Punctuator");
TokenName[Token.StringLiteral] = ("String");
TokenName[Token.RegularExpression] = ("RegularExpression");
FnExprTokens = _JS._arr({[0]=("("), ("{"), ("["), ("in"), ("typeof"), ("instanceof"), ("new"), ("return"), ("case"), ("delete"), ("throw"), ("void"), ("="), ("+="), ("-="), ("*="), ("/="), ("%="), ("<<="), (">>="), (">>>="), ("&="), ("|="), ("^="), (","), ("+"), ("-"), ("*"), ("/"), ("%"), ("++"), ("--"), ("<<"), (">>"), (">>>"), ("&"), ("|"), ("^"), ("!"), ("~"), ("&&"), ("||"), ("?"), (":"), ("==="), ("=="), (">="), ("<="), ("<"), (">"), ("!="), ("!==")});
Syntax = _JS._obj({
  ["AssignmentExpression"]=("AssignmentExpression"),
  ["ArrayExpression"]=("ArrayExpression"),
  ["BlockStatement"]=("BlockStatement"),
  ["BinaryExpression"]=("BinaryExpression"),
  ["BreakStatement"]=("BreakStatement"),
  ["CallExpression"]=("CallExpression"),
  ["CatchClause"]=("CatchClause"),
  ["ConditionalExpression"]=("ConditionalExpression"),
  ["ContinueStatement"]=("ContinueStatement"),
  ["DoWhileStatement"]=("DoWhileStatement"),
  ["DebuggerStatement"]=("DebuggerStatement"),
  ["EmptyStatement"]=("EmptyStatement"),
  ["ExpressionStatement"]=("ExpressionStatement"),
  ["ForStatement"]=("ForStatement"),
  ["ForInStatement"]=("ForInStatement"),
  ["FunctionDeclaration"]=("FunctionDeclaration"),
  ["FunctionExpression"]=("FunctionExpression"),
  ["Identifier"]=("Identifier"),
  ["IfStatement"]=("IfStatement"),
  ["Literal"]=("Literal"),
  ["LabeledStatement"]=("LabeledStatement"),
  ["LogicalExpression"]=("LogicalExpression"),
  ["MemberExpression"]=("MemberExpression"),
  ["NewExpression"]=("NewExpression"),
  ["ObjectExpression"]=("ObjectExpression"),
  ["Program"]=("Program"),
  ["Property"]=("Property"),
  ["ReturnStatement"]=("ReturnStatement"),
  ["SequenceExpression"]=("SequenceExpression"),
  ["SwitchStatement"]=("SwitchStatement"),
  ["SwitchCase"]=("SwitchCase"),
  ["ThisExpression"]=("ThisExpression"),
  ["ThrowStatement"]=("ThrowStatement"),
  ["TryStatement"]=("TryStatement"),
  ["UnaryExpression"]=("UnaryExpression"),
  ["UpdateExpression"]=("UpdateExpression"),
  ["VariableDeclaration"]=("VariableDeclaration"),
  ["VariableDeclarator"]=("VariableDeclarator"),
  ["WhileStatement"]=("WhileStatement"),
  ["WithStatement"]=("WithStatement")});
PropertyKind = _JS._obj({
  ["Data"]=(1),
  ["Get"]=(2),
  ["Set"]=(4)});
Messages = _JS._obj({
  ["UnexpectedToken"]=("Unexpected token %0"),
  ["UnexpectedNumber"]=("Unexpected number"),
  ["UnexpectedString"]=("Unexpected string"),
  ["UnexpectedIdentifier"]=("Unexpected identifier"),
  ["UnexpectedReserved"]=("Unexpected reserved word"),
  ["UnexpectedEOS"]=("Unexpected end of input"),
  ["NewlineAfterThrow"]=("Illegal newline after throw"),
  ["InvalidRegExp"]=("Invalid regular expression"),
  ["UnterminatedRegExp"]=("Invalid regular expression: missing /"),
  ["InvalidLHSInAssignment"]=("Invalid left-hand side in assignment"),
  ["InvalidLHSInForIn"]=("Invalid left-hand side in for-in"),
  ["MultipleDefaultsInSwitch"]=("More than one default clause in switch statement"),
  ["NoCatchOrFinally"]=("Missing catch or finally after try"),
  ["UnknownLabel"]=("Undefined label '%0'"),
  ["Redeclaration"]=("%0 '%1' has already been declared"),
  ["IllegalContinue"]=("Illegal continue statement"),
  ["IllegalBreak"]=("Illegal break statement"),
  ["IllegalReturn"]=("Illegal return statement"),
  ["StrictModeWith"]=("Strict mode code may not include a with statement"),
  ["StrictCatchVariable"]=("Catch variable may not be eval or arguments in strict mode"),
  ["StrictVarName"]=("Variable name may not be eval or arguments in strict mode"),
  ["StrictParamName"]=("Parameter name eval or arguments is not allowed in strict mode"),
  ["StrictParamDupe"]=("Strict mode function may not have duplicate parameter names"),
  ["StrictFunctionName"]=("Function name may not be eval or arguments in strict mode"),
  ["StrictOctalLiteral"]=("Octal literals are not allowed in strict mode."),
  ["StrictDelete"]=("Delete of an unqualified identifier in strict mode."),
  ["StrictDuplicateProperty"]=("Duplicate data property in object literal not allowed in strict mode"),
  ["AccessorDataProperty"]=("Object literal may not have data and accessor property with the same name"),
  ["AccessorGetSet"]=("Object literal may not have multiple get/set accessors with the same name"),
  ["StrictLHSAssignment"]=("Assignment to eval or arguments is not allowed in strict mode"),
  ["StrictLHSPostfix"]=("Postfix increment/decrement may not have eval or arguments operand in strict mode"),
  ["StrictLHSPrefix"]=("Prefix increment/decrement may not have eval or arguments operand in strict mode"),
  ["StrictReservedWord"]=("Use of future reserved word in strict mode")});
Regex = _JS._obj({
  ["NonAsciiIdentifierStart"]=_JS._new(RegExp, ("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮͰ-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁҊ-ԧԱ-Ֆՙա-ևא-תװ-ײؠ-يٮٯٱ-ۓەۥۦۮۯۺ-ۼۿܐܒ-ܯݍ-ޥޱߊ-ߪߴߵߺࠀ-ࠕࠚࠤࠨࡀ-ࡘࢠࢢ-ࢬऄ-हऽॐक़-ॡॱ-ॷॹ-ॿঅ-ঌএঐও-নপ-রলশ-হঽৎড়ঢ়য়-ৡৰৱਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹਖ਼-ੜਫ਼ੲ-ੴઅ-ઍએ-ઑઓ-નપ-રલળવ-હઽૐૠૡଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହଽଡ଼ଢ଼ୟ-ୡୱஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹௐఅ-ఌఎ-ఐఒ-నప-ళవ-హఽౘౙౠౡಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹಽೞೠೡೱೲഅ-ഌഎ-ഐഒ-ഺഽൎൠൡൺ-ൿඅ-ඖක-නඳ-රලව-ෆก-ะาำเ-ๆກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ະາຳຽເ-ໄໆໜ-ໟༀཀ-ཇཉ-ཬྈ-ྌက-ဪဿၐ-ၕၚ-ၝၡၥၦၮ-ၰၵ-ႁႎႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-ᜑᜠ-ᜱᝀ-ᝑᝠ-ᝬᝮ-ᝰក-ឳៗៜᠠ-ᡷᢀ-ᢨᢪᢰ-ᣵᤀ-ᤜᥐ-ᥭᥰ-ᥴᦀ-ᦫᧁ-ᧇᨀ-ᨖᨠ-ᩔᪧᬅ-ᬳᭅ-ᭋᮃ-ᮠᮮᮯᮺ-ᯥᰀ-ᰣᱍ-ᱏᱚ-ᱽᳩ-ᳬᳮ-ᳱᳵᳶᴀ-ᶿḀ-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼⁱⁿₐ-ₜℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳮⳲⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯⶀ-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⸯ々-〇〡-〩〱-〵〸-〼ぁ-ゖゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘟꘪꘫꙀ-ꙮꙿ-ꚗꚠ-ꛯꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠁꠃ-ꠅꠇ-ꠊꠌ-ꠢꡀ-ꡳꢂ-ꢳꣲ-ꣷꣻꤊ-ꤥꤰ-ꥆꥠ-ꥼꦄ-ꦲꧏꨀ-ꨨꩀ-ꩂꩄ-ꩋꩠ-ꩶꩺꪀ-ꪯꪱꪵꪶꪹ-ꪽꫀꫂꫛ-ꫝꫠ-ꫪꫲ-ꫴꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯢ가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִײַ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻﹰ-ﹴﹶ-ﻼＡ-Ｚａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]")),
  ["NonAsciiIdentifierPart"]=_JS._new(RegExp, ("[ªµºÀ-ÖØ-öø-ˁˆ-ˑˠ-ˤˬˮ̀-ʹͶͷͺ-ͽΆΈ-ΊΌΎ-ΡΣ-ϵϷ-ҁ҃-҇Ҋ-ԧԱ-Ֆՙա-և֑-ׇֽֿׁׂׅׄא-תװ-ײؐ-ؚؠ-٩ٮ-ۓە-ۜ۟-۪ۨ-ۼۿܐ-݊ݍ-ޱ߀-ߵߺࠀ-࠭ࡀ-࡛ࢠࢢ-ࢬࣤ-ࣾऀ-ॣ०-९ॱ-ॷॹ-ॿঁ-ঃঅ-ঌএঐও-নপ-রলশ-হ়-ৄেৈো-ৎৗড়ঢ়য়-ৣ০-ৱਁ-ਃਅ-ਊਏਐਓ-ਨਪ-ਰਲਲ਼ਵਸ਼ਸਹ਼ਾ-ੂੇੈੋ-੍ੑਖ਼-ੜਫ਼੦-ੵઁ-ઃઅ-ઍએ-ઑઓ-નપ-રલળવ-હ઼-ૅે-ૉો-્ૐૠ-ૣ૦-૯ଁ-ଃଅ-ଌଏଐଓ-ନପ-ରଲଳଵ-ହ଼-ୄେୈୋ-୍ୖୗଡ଼ଢ଼ୟ-ୣ୦-୯ୱஂஃஅ-ஊஎ-ஐஒ-கஙசஜஞடணதந-பம-ஹா-ூெ-ைொ-்ௐௗ௦-௯ఁ-ఃఅ-ఌఎ-ఐఒ-నప-ళవ-హఽ-ౄె-ైొ-్ౕౖౘౙౠ-ౣ౦-౯ಂಃಅ-ಌಎ-ಐಒ-ನಪ-ಳವ-ಹ಼-ೄೆ-ೈೊ-್ೕೖೞೠ-ೣ೦-೯ೱೲംഃഅ-ഌഎ-ഐഒ-ഺഽ-ൄെ-ൈൊ-ൎൗൠ-ൣ൦-൯ൺ-ൿංඃඅ-ඖක-නඳ-රලව-ෆ්ා-ුූෘ-ෟෲෳก-ฺเ-๎๐-๙ກຂຄງຈຊຍດ-ທນ-ຟມ-ຣລວສຫອ-ູົ-ຽເ-ໄໆ່-ໍ໐-໙ໜ-ໟༀ༘༙༠-༩༹༵༷༾-ཇཉ-ཬཱ-྄྆-ྗྙ-ྼ࿆က-၉ၐ-ႝႠ-ჅჇჍა-ჺჼ-ቈቊ-ቍቐ-ቖቘቚ-ቝበ-ኈኊ-ኍነ-ኰኲ-ኵኸ-ኾዀዂ-ዅወ-ዖዘ-ጐጒ-ጕጘ-ፚ፝-፟ᎀ-ᎏᎠ-Ᏼᐁ-ᙬᙯ-ᙿᚁ-ᚚᚠ-ᛪᛮ-ᛰᜀ-ᜌᜎ-᜔ᜠ-᜴ᝀ-ᝓᝠ-ᝬᝮ-ᝰᝲᝳក-៓ៗៜ៝០-៩᠋-᠍᠐-᠙ᠠ-ᡷᢀ-ᢪᢰ-ᣵᤀ-ᤜᤠ-ᤫᤰ-᤻᥆-ᥭᥰ-ᥴᦀ-ᦫᦰ-ᧉ᧐-᧙ᨀ-ᨛᨠ-ᩞ᩠-᩿᩼-᪉᪐-᪙ᪧᬀ-ᭋ᭐-᭙᭫-᭳ᮀ-᯳ᰀ-᰷᱀-᱉ᱍ-ᱽ᳐-᳔᳒-ᳶᴀ-ᷦ᷼-ἕἘ-Ἕἠ-ὅὈ-Ὅὐ-ὗὙὛὝὟ-ώᾀ-ᾴᾶ-ᾼιῂ-ῄῆ-ῌῐ-ΐῖ-Ίῠ-Ῥῲ-ῴῶ-ῼ‌‍‿⁀⁔ⁱⁿₐ-ₜ⃐-⃥⃜⃡-⃰ℂℇℊ-ℓℕℙ-ℝℤΩℨK-ℭℯ-ℹℼ-ℿⅅ-ⅉⅎⅠ-ↈⰀ-Ⱞⰰ-ⱞⱠ-ⳤⳫ-ⳳⴀ-ⴥⴧⴭⴰ-ⵧⵯ⵿-ⶖⶠ-ⶦⶨ-ⶮⶰ-ⶶⶸ-ⶾⷀ-ⷆⷈ-ⷎⷐ-ⷖⷘ-ⷞⷠ-ⷿⸯ々-〇〡-〯〱-〵〸-〼ぁ-ゖ゙゚ゝ-ゟァ-ヺー-ヿㄅ-ㄭㄱ-ㆎㆠ-ㆺㇰ-ㇿ㐀-䶵一-鿌ꀀ-ꒌꓐ-ꓽꔀ-ꘌꘐ-ꘫꙀ-꙯ꙴ-꙽ꙿ-ꚗꚟ-꛱ꜗ-ꜟꜢ-ꞈꞋ-ꞎꞐ-ꞓꞠ-Ɦꟸ-ꠧꡀ-ꡳꢀ-꣄꣐-꣙꣠-ꣷꣻ꤀-꤭ꤰ-꥓ꥠ-ꥼꦀ-꧀ꧏ-꧙ꨀ-ꨶꩀ-ꩍ꩐-꩙ꩠ-ꩶꩺꩻꪀ-ꫂꫛ-ꫝꫠ-ꫯꫲ-꫶ꬁ-ꬆꬉ-ꬎꬑ-ꬖꬠ-ꬦꬨ-ꬮꯀ-ꯪ꯬꯭꯰-꯹가-힣ힰ-ퟆퟋ-ퟻ豈-舘並-龎ﬀ-ﬆﬓ-ﬗיִ-ﬨשׁ-זּטּ-לּמּנּסּףּפּצּ-ﮱﯓ-ﴽﵐ-ﶏﶒ-ﷇﷰ-ﷻ︀-️︠-︦︳︴﹍-﹏ﹰ-ﹴﹶ-ﻼ０-９Ａ-Ｚ＿ａ-ｚｦ-ﾾￂ-ￇￊ-ￏￒ-ￗￚ-ￜ]"))});
SyntaxTreeDelegate = _JS._obj({
  ["name"]=("SyntaxTree"),
  ["postProcess"]=_JS._func(function (this, node)
if true then return node; end;
end),
  ["createArrayExpression"]=_JS._func(function (this, elements)
if true then return _JS._obj({
  ["type"]=Syntax.ArrayExpression,
  ["elements"]=elements}); end;
end),
  ["createAssignmentExpression"]=_JS._func(function (this, operator, left, right)
if true then return _JS._obj({
  ["type"]=Syntax.AssignmentExpression,
  ["operator"]=operator,
  ["left"]=left,
  ["right"]=right}); end;
end),
  ["createBinaryExpression"]=_JS._func(function (this, operator, left, right)
local type;
type = (_JS._truthy((operator == ("||")) or (operator == ("&&"))) and {Syntax.LogicalExpression} or {Syntax.BinaryExpression})[1];
if true then return _JS._obj({
  ["type"]=type,
  ["operator"]=operator,
  ["left"]=left,
  ["right"]=right}); end;
end),
  ["createBlockStatement"]=_JS._func(function (this, body)
if true then return _JS._obj({
  ["type"]=Syntax.BlockStatement,
  ["body"]=body}); end;
end),
  ["createBreakStatement"]=_JS._func(function (this, label)
if true then return _JS._obj({
  ["type"]=Syntax.BreakStatement,
  ["label"]=label}); end;
end),
  ["createCallExpression"]=_JS._func(function (this, callee, args)
if true then return _JS._obj({
  ["type"]=Syntax.CallExpression,
  ["callee"]=callee,
  ["(\"arguments\")"]=args}); end;
end),
  ["createCatchClause"]=_JS._func(function (this, param, body)
if true then return _JS._obj({
  ["type"]=Syntax.CatchClause,
  ["param"]=param,
  ["body"]=body}); end;
end),
  ["createConditionalExpression"]=_JS._func(function (this, test, consequent, alternate)
if true then return _JS._obj({
  ["type"]=Syntax.ConditionalExpression,
  ["test"]=test,
  ["consequent"]=consequent,
  ["alternate"]=alternate}); end;
end),
  ["createContinueStatement"]=_JS._func(function (this, label)
if true then return _JS._obj({
  ["type"]=Syntax.ContinueStatement,
  ["label"]=label}); end;
end),
  ["createDebuggerStatement"]=_JS._func(function (this)
if true then return _JS._obj({
  ["type"]=Syntax.DebuggerStatement}); end;
end),
  ["createDoWhileStatement"]=_JS._func(function (this, body, test)
if true then return _JS._obj({
  ["type"]=Syntax.DoWhileStatement,
  ["body"]=body,
  ["test"]=test}); end;
end),
  ["createEmptyStatement"]=_JS._func(function (this)
if true then return _JS._obj({
  ["type"]=Syntax.EmptyStatement}); end;
end),
  ["createExpressionStatement"]=_JS._func(function (this, expression)
if true then return _JS._obj({
  ["type"]=Syntax.ExpressionStatement,
  ["expression"]=expression}); end;
end),
  ["createForStatement"]=_JS._func(function (this, init, test, update, body)
if true then return _JS._obj({
  ["type"]=Syntax.ForStatement,
  ["init"]=init,
  ["test"]=test,
  ["update"]=update,
  ["body"]=body}); end;
end),
  ["createForInStatement"]=_JS._func(function (this, left, right, body)
if true then return _JS._obj({
  ["type"]=Syntax.ForInStatement,
  ["left"]=left,
  ["right"]=right,
  ["body"]=body,
  ["each"]=(false)}); end;
end),
  ["createFunctionDeclaration"]=_JS._func(function (this, id, params, defaults, body)
if true then return _JS._obj({
  ["type"]=Syntax.FunctionDeclaration,
  ["id"]=id,
  ["params"]=params,
  ["defaults"]=defaults,
  ["body"]=body,
  ["rest"]=(null),
  ["generator"]=(false),
  ["expression"]=(false)}); end;
end),
  ["createFunctionExpression"]=_JS._func(function (this, id, params, defaults, body)
if true then return _JS._obj({
  ["type"]=Syntax.FunctionExpression,
  ["id"]=id,
  ["params"]=params,
  ["defaults"]=defaults,
  ["body"]=body,
  ["rest"]=(null),
  ["generator"]=(false),
  ["expression"]=(false)}); end;
end),
  ["createIdentifier"]=_JS._func(function (this, name)
if true then return _JS._obj({
  ["type"]=Syntax.Identifier,
  ["name"]=name}); end;
end),
  ["createIfStatement"]=_JS._func(function (this, test, consequent, alternate)
if true then return _JS._obj({
  ["type"]=Syntax.IfStatement,
  ["test"]=test,
  ["consequent"]=consequent,
  ["alternate"]=alternate}); end;
end),
  ["createLabeledStatement"]=_JS._func(function (this, label, body)
if true then return _JS._obj({
  ["type"]=Syntax.LabeledStatement,
  ["label"]=label,
  ["body"]=body}); end;
end),
  ["createLiteral"]=_JS._func(function (this, token)
if true then return _JS._obj({
  ["type"]=Syntax.Literal,
  ["value"]=token.value,
  ["raw"]=source:slice(token.range[(0)], token.range[(1)])}); end;
end),
  ["createMemberExpression"]=_JS._func(function (this, accessor, object, property)
if true then return _JS._obj({
  ["type"]=Syntax.MemberExpression,
  ["computed"]=(accessor == ("[")),
  ["object"]=object,
  ["property"]=property}); end;
end),
  ["createNewExpression"]=_JS._func(function (this, callee, args)
if true then return _JS._obj({
  ["type"]=Syntax.NewExpression,
  ["callee"]=callee,
  ["(\"arguments\")"]=args}); end;
end),
  ["createObjectExpression"]=_JS._func(function (this, properties)
if true then return _JS._obj({
  ["type"]=Syntax.ObjectExpression,
  ["properties"]=properties}); end;
end),
  ["createPostfixExpression"]=_JS._func(function (this, operator, argument)
if true then return _JS._obj({
  ["type"]=Syntax.UpdateExpression,
  ["operator"]=operator,
  ["argument"]=argument,
  ["prefix"]=(false)}); end;
end),
  ["createProgram"]=_JS._func(function (this, body)
if true then return _JS._obj({
  ["type"]=Syntax.Program,
  ["body"]=body}); end;
end),
  ["createProperty"]=_JS._func(function (this, kind, key, value)
if true then return _JS._obj({
  ["type"]=Syntax.Property,
  ["key"]=key,
  ["value"]=value,
  ["kind"]=kind}); end;
end),
  ["createReturnStatement"]=_JS._func(function (this, argument)
if true then return _JS._obj({
  ["type"]=Syntax.ReturnStatement,
  ["argument"]=argument}); end;
end),
  ["createSequenceExpression"]=_JS._func(function (this, expressions)
if true then return _JS._obj({
  ["type"]=Syntax.SequenceExpression,
  ["expressions"]=expressions}); end;
end),
  ["createSwitchCase"]=_JS._func(function (this, test, consequent)
if true then return _JS._obj({
  ["type"]=Syntax.SwitchCase,
  ["test"]=test,
  ["consequent"]=consequent}); end;
end),
  ["createSwitchStatement"]=_JS._func(function (this, discriminant, cases)
if true then return _JS._obj({
  ["type"]=Syntax.SwitchStatement,
  ["discriminant"]=discriminant,
  ["cases"]=cases}); end;
end),
  ["createThisExpression"]=_JS._func(function (this)
if true then return _JS._obj({
  ["type"]=Syntax.ThisExpression}); end;
end),
  ["createThrowStatement"]=_JS._func(function (this, argument)
if true then return _JS._obj({
  ["type"]=Syntax.ThrowStatement,
  ["argument"]=argument}); end;
end),
  ["createTryStatement"]=_JS._func(function (this, block, guardedHandlers, handlers, finalizer)
if true then return _JS._obj({
  ["type"]=Syntax.TryStatement,
  ["block"]=block,
  ["guardedHandlers"]=guardedHandlers,
  ["handlers"]=handlers,
  ["finalizer"]=finalizer}); end;
end),
  ["createUnaryExpression"]=_JS._func(function (this, operator, argument)
if _JS._truthy((operator == ("++")) or (operator == ("--"))) then
if true then return _JS._obj({
  ["type"]=Syntax.UpdateExpression,
  ["operator"]=operator,
  ["argument"]=argument,
  ["prefix"]=(true)}); end;
end
if true then return _JS._obj({
  ["type"]=Syntax.UnaryExpression,
  ["operator"]=operator,
  ["argument"]=argument}); end;
end),
  ["createVariableDeclaration"]=_JS._func(function (this, declarations, kind)
if true then return _JS._obj({
  ["type"]=Syntax.VariableDeclaration,
  ["declarations"]=declarations,
  ["kind"]=kind}); end;
end),
  ["createVariableDeclarator"]=_JS._func(function (this, id, init)
if true then return _JS._obj({
  ["type"]=Syntax.VariableDeclarator,
  ["id"]=id,
  ["init"]=init}); end;
end),
  ["createWhileStatement"]=_JS._func(function (this, test, body)
if true then return _JS._obj({
  ["type"]=Syntax.WhileStatement,
  ["test"]=test,
  ["body"]=body}); end;
end),
  ["createWithStatement"]=_JS._func(function (this, object, body)
if true then return _JS._obj({
  ["type"]=Syntax.WithStatement,
  ["object"]=object,
  ["body"]=body}); end;
end)});
exports.version = ("1.1.0-dev");
exports.tokenize = tokenize;
exports.parse = parse;
exports.Syntax = _JS._func(function (this)
local name, types;
name, types = nil, _JS._obj({
  });
if (_JS._typeof(Object.create) == ("function")) then
types = Object:create((null));
end
for name in _JS._pairs(Syntax) do
if _JS._truthy(Syntax:hasOwnProperty(name)) then
types[name] = Syntax[name];
end
end
if (_JS._typeof(Object.freeze) == ("function")) then
if Object:freeze(types) then end;
end
if true then return types; end;
end)(global);
end))) then end;

return _module.exports;

