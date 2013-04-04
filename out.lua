-- The Great Computer Language Shootout
-- http:--shootout.alioth.debian.org/
-- contributed by Isaac Gouy

local _JS = require('colony-js');
local string, math = nil, nil;
local this, Object, Array, String, Math, require, console = _JS.this, _JS.Object, _JS.Array, _JS.String, _JS.Math, _JS.require, _JS.console;
local _exports = {}; local exports = _exports;

local TreeNode, bottomUpTree, minDepth, n, maxDepth, stretchDepth, check, longLivedTree, depth, iterations, i;
TreeNode = _JS._func(function (this, left, right, item)
this.left = left;
this.right = right;
this.item = item;
end);
bottomUpTree = _JS._func(function (this, item, depth)
if _JS._truthy((depth>(0))) then
if true then return _JS._new(TreeNode, bottomUpTree(this, (((2)*item)-(1)), (depth-(1))), bottomUpTree(this, ((2)*item), (depth-(1))), item); end;
else
if true then return _JS._new(TreeNode, (null), (null), item); end;
end
end);
TreeNode.prototype.itemCheck = _JS._func(function (this)
if _JS._truthy((this.left==(null))) then
if true then return this.item; end;
else
if true then return ((this.item + this.left:itemCheck()) - this.right:itemCheck()); end;
end
end)

;
minDepth = (4);
n = (14);
maxDepth = Math:max((minDepth + (2)), n);
stretchDepth = (maxDepth + (1));
check = bottomUpTree(this, (0), stretchDepth):itemCheck();
console:log((((("stretch tree of depth ") + stretchDepth) + ("\t check: ")) + check));
longLivedTree = bottomUpTree(this, (0), maxDepth);
depth = minDepth;
while (depth<=maxDepth) do
iterations = _JS._bit.lshift((1), ((maxDepth - depth) + minDepth));
check = (0);
i = (1);
while (i<=iterations) do
check = check + bottomUpTree(this, i, depth):itemCheck();
check = check + bottomUpTree(this, (-i), depth):itemCheck();
(function () local _r = i; i = _r + 1; return _r end)()
end
console:log((((((iterations*(2)) + ("\t trees of depth ")) + depth) + ("\t check: ")) + check));
(function () local _r = depth + (2); depth = _r; return _r; end)()
end
console:log((((("long lived tree of depth ") + maxDepth) + ("\t check: ")) 
   + longLivedTree:itemCheck()));

return _exports;

