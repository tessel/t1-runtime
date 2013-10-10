
function lt (op1, op2)
  return (op1 or 0) < (op2 or 0)
end

debug.setmetatable(nil, {
  __lt = lt,
  __add = function (a,b) return (a or 0) + (b or 0) end
  })


print(nil + 400);
if nil < 400 then
  print('400')
end