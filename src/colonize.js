var acorn = require('./acorn_mod');

function _log () {
//  console.error.apply(console, arguments);
}

var repl = false;

var keywords = ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while'];
var unaryops = { '|': '_bit.bor', '&': '_bit.band', '~': '_bit.bnot', '+': '_G.tonumber', '!': 'not ', 'typeof': '_typeof', 'void': '_void' }
var logicalops = { '&&': 'and', '||': 'or' };
var binaryops = { '|': '_bit.bor', '&': '_bit.band', '|': '_bit.bor', '>>': '_bit.arshift', '<<': '_bit.lshift', '>>>': '_bit.rshift', 'instanceof': '_instanceof', 'in': '_in' }
var infixops = { '!==': '~=', '!=': '~=', '===': '==' };

var colony_locals, colony_flow, colony_with;

function resetState () {
  colony_locals = [];
  colony_flow = [];
  colony_with = [];

  colony_newScope(null);
}

// Scopes contain ids, locals, etc: [ 0, 1, ..., id ]
function colony_newScope (id) {
  var scope = [];
  scope.id = id;
  scope.hoist = [];

  colony_locals.unshift(scope);
}

// Flow control for loops, labeled blocks, and try statements.
// We create a loop every time we enter, close the loop when we leave.

function colony_newFlow (type, label) {
  if (colony_flow[0] && colony_flow[0].type == 'label') {
    colony_flow[0].type = type;
  } else {
    colony_flow.unshift({
      type: type,
      usesContinue: false
    })
  }
}

function colony_newFlowLabel (label) {
  colony_flow.unshift({
    type: 'label',
    label: label,
    usesContinue: false
  })
}

function colony_newWith (block) {
  return colony_with.push(block);
}

function ColonyNode (type, start, str) { this.type = type; this.start = start; this.str = str; } //this.str = '--[[' + this.start + ']] ' + str; }
ColonyNode.prototype = new String();
ColonyNode.prototype.valueOf = function () { return this.str; }
ColonyNode.prototype.toString = function () { return this.str; }

function colony_node (node, str) {
  _log(node)
  return new ColonyNode(node.type, node.start, str)
}

function hygenifystr (str) {
  str = String(str);
  if (['undefined', 'arguments'].indexOf(str) == -1) {
    if (keywords.indexOf(str) > -1) {
      return '_K_' + str;
    } else {
      return str.replace(/_/g, '__').replace(/\$/g, '_S');
    }
    // return 'COL_' + str;
  }
  return str;
}

function hygenify (node) {
  if (node.type == 'Identifier') {
    return colony_node(node, hygenifystr(String(node)));
  }
  return node;
}

function ensureExpression (node) {
  if (node.type == 'AssignmentExpression') {
    var _ = node.split(/=\s*/, 2), left = _[0], right = node.substr(left.length + 1);
    return colony_node(node, '(function () local _r = ' + right + '; ' + left + ' = _r; return _r; end)()');
  } else if (node.type == 'UpdateExpression') {
    return colony_node(node, '(function () ' + node + '; return _r; end)()')
  }
  return node;
}

function ensureStatement (node) {
  if (['BinaryExpression', 'AssignmentExpression', 'LogicalExpression', 'UpdateExpression', 'Literal', 'CallExpression', 'ConditionalExpression'].indexOf(node.type) > -1) {
    return colony_node(node, node + ';');
  } else {
    return colony_node(node, 'if ' + node.replace(/;?$/, '') + ' then end;');
  }
}

function finishNode(node, type) {
  _log('==>', type);

  // Basic nodes

  if (type == 'Identifier') {
    if (node.name == 'arguments') {
      colony_locals[0].arguments = true;
    }
    return colony_node(node, node.name);

  } else if (type == 'Literal') {
    if (node.value instanceof RegExp) {
      return colony_node(node, '_regexp(' + JSON.stringify(node.value.source) + ', ' + JSON.stringify(String(node.value).replace(/^.*\//, '')) + ')');
    } else if (typeof node.value == 'string') {
      return colony_node(node, '(' + JSON.stringify(node.value).replace(/[\u007F-\uFFFF]/g, function (c) {
        return [].slice.apply(new Buffer(c)).map(function (a) {
          return '\\' + ('000' + a).substr(-3);
        }).join('');
      }) + ')');
    } else {
      return colony_node(node, '(' + node.raw + ')');
    }


  // Expressions

  } else if (type == 'MemberExpression') {
    if (node.computed) {
      return colony_node(node, ensureExpression(hygenify(node.object)) + '[' + ensureExpression(hygenify(node.property)) + ']');
    } else if (keywords.indexOf(String(node.property)) > -1) {
      return colony_node(node, ensureExpression(hygenify(node.object)) + '[' + JSON.stringify(String(node.property)) + ']');
    } else {
      return colony_node(node, ensureExpression(hygenify(node.object)) + '.' + node.property);
    }
    return str;

  } else if (type == 'AssignmentExpression') {
    if (node.operator != '=') {
      var operator = node.operator.slice(0, -1);
      if (operator in binaryops) {
        node.right = binaryops[operator] + '((' + ensureExpression(node.left) + ') or 0, (' + ensureExpression(node.right) + ') or 0)'
      } else {
        // TODO we run the risk of re-interpreting node.left here
        // need a function that encapsulates that behavior
        node.right = hygenify(node.left) + operator + hygenify(node.right);
      }
    }
    return colony_node(node, hygenify(node.left) + ' = ' + ensureExpression(hygenify(node.right)));

  } else if (type == 'CallExpression') {
    // For dynamic expressions, evaluate temporary member to properly call "this"
    if (node.callee.type == 'MemberExpression' && String(node.callee).match(/\]$/)) {
      // Find last square bracketed group. (wow such CS)
      var start = 0, str = String(node.callee), count = 0; 
      for (var i = 0; i < str.length; i++) {
        if (str[i] == '[') {
          if (count == 0) start = i;
          count++;
        } else if (str[i] == ']') {
          count--;
        }
      }
      var base = str.substr(0, start), member = str.slice(start+1, -1);
      return colony_node(node,
        '(function () local _b = ' + base + '; local _f = _b[' + member + ']; return _f(' + ['_b'].concat(node.arguments.map(hygenify).map(ensureExpression)).join(', ') + '); end)()');
    }

    // For member expressions, change last occurance of '.' to ':'
    var ismethod = node.callee.type == 'MemberExpression'
    return colony_node(node,
      (ismethod ? hygenify(node.callee).replace(/^([\s\S]+)\./, '$1:') : hygenify(node.callee))
      + '(' + (ismethod ? [] : ['this']).concat(node.arguments.map(hygenify).map(ensureExpression)).join(', ') + ')');

  } else if (type == 'NewExpression') {
    // var ismethod = node.callee.type == 'MemberExpression'
    // if (ismethod) {
    //   throw new Error('Dont support methods as new expressions yet');
    // }
    return colony_node(node, '_new(' + [node.callee].concat(node.arguments.map(hygenify)).join(', ') + ')');

  } else if (type == 'ThisExpression') {
    return colony_node(node, 'this');

  } else if (type == 'UpdateExpression') {
    if (node.prefix) {
      return colony_node(node, 'local _r = ' + hygenify(node.argument) + ' ' + node.operator.substr(0, 1) + ' 1; ' + hygenify(node.argument) + ' = _r')
    } else {
      return colony_node(node, 'local _r = ' + hygenify(node.argument) + '; ' + hygenify(node.argument) + ' = _r ' + node.operator.substr(0, 1) + ' 1')
    }

  } else if (type == 'ConditionalExpression') {
    return colony_node(node, '((' + ensureExpression(hygenify(node.test)) + ') and {' + ensureExpression(hygenify(node.consequent)) + '} or {' + ensureExpression(hygenify(node.alternate)) + '})[1]');

  } else if (type == 'UnaryExpression') {
    if (node.operator == 'delete') {
      // TODO "delete" semantics may change in future VM
      return colony_node(node, '(function () local _r = ' + hygenify(node.argument) + '; ' + hygenify(node.argument) + ' = nil; return _r ~= nil; end)()');
    }

    return colony_node(node, '(' + (unaryops[node.operator] || node.operator) + '(' + ensureExpression(hygenify(node.argument)) + '))')

  } else if (type == 'LogicalExpression') {
    return colony_node(node, '((' + ensureExpression(hygenify(node.left)) + ')' + logicalops[node.operator] + '(' + ensureExpression(hygenify(node.right)) + '))')

  } else if (type == 'BinaryExpression') {
    if (node.operator in binaryops) {
      return colony_node(node, binaryops[node.operator] + '((' + ensureExpression(hygenify(node.left)) + ') or 0,(' + ensureExpression(hygenify(node.right)) + ') or 0)')
    } else {
      // infix
      return colony_node(node, '((' + ensureExpression(hygenify(node.left)) + ')' + (infixops[node.operator] || node.operator) + '(' + ensureExpression(hygenify(node.right)) + '))')
    }

  } else if (type == 'ArrayExpression') {
    return colony_node(node, '_arr({' + [node.elements.length > 0 ? '[0]=' + hygenify(node.elements[0]) : ''].concat(node.elements.slice(1).map(hygenify).map(ensureExpression)).join(', ') + '}, ' + node.elements.length + ')')

  } else if (type == 'ObjectExpression') {
    return colony_node(node, '_obj({\n  '
      + node.properties.map(function (prop) {
        return '[' + (prop.key.type == 'Literal' ? prop.key : JSON.stringify(prop.key.toString())) + ']=' + ensureExpression(hygenify(prop.value))
      }).join(',\n  ')
      + '\n})');

  } else if (type == 'SequenceExpression') {
    return colony_node(node, '_seq({' + node.expressions.map(function (d) {
      return ensureExpression(hygenify(d));
    }).join(', ') + '})');


  // Statements

  } else if (type == 'IfStatement') {
    return colony_node(node, [
      "if " + ensureExpression(hygenify(node.test)) + ' then\n',
      // TODO node.consequent should be a string, here is body
      (node.consequent.body ? node.consequent.body.join('\n') : node.consequent) + '\n',
      (node.alternate ? 'else\n' + (node.alternate.body ? node.alternate.body.join('\n') : node.alternate) + '\n' : ""),
      'end;'
    ].join(''));

  } else if (type == 'ReturnStatement') {
    return colony_node(node, 'if true then return ' + (node.argument ? ensureExpression(hygenify(node.argument)) : '') + '; end');

  } else if (type == 'ForInStatement') {
    if (node.left.kind == 'var') {
      var name = hygenifystr(node.left.declarations[0].str.replace(/\s*=.*$/, ''));
    } else {
      var name = hygenifystr(node.left);
    }
    return colony_node(node, [
      'for ' + name + ' in _pairs(' + ensureExpression(hygenify(node.right)) + ') do ',
      name + ' = ""+' + name + '; ',
      !node.body.body ? node.body : node.body.body.join('\n'),
      'end;'
    ].join('\n'))

  } else if (type == 'ExpressionStatement') {
    if (['BinaryExpression', 'UnaryExpression', 'LogicalExpression', 'Literal', 'ConditionalExpression', 'MemberExpression', 'ConditionalExpression'].indexOf(node.expression.type) > -1) {
      var ret = colony_node(node, 'if ' + hygenify(node.expression) + ' then end;');
    } else {
      var ret = colony_node(node, hygenify(node.expression) + ';');
    }
    ret.expression = node.expression;
    // TODO we shouldn't have to leave ret.expression attached to the node,
    // but a later step seems to require it being there
    return ret;

  } else if (type == 'VariableDeclarator') {
    colony_locals[0].push(hygenify(node.id));
    return colony_node(node, hygenify(node.id) + ' = ' + (node.init ? ensureExpression(node.init) : 'nil') + '; ')

  } else if (type == 'VariableDeclaration') {
    return colony_node(node, node.declarations.join(' '));

  } else if (type == 'WithStatement') {
    var i = colony_newWith(node.body.body.join('\n'));
    return colony_node(node,
      'local _ret = _with(' + node.object + ', _G._with_fn' + i + ');'
      + 'if _ret ~= _with then return _ret end; ');

  } else if (type == 'SwitchCase') {
    return node;

  } else if (type == 'SwitchStatement') {
    var joiner = '\n';
    return colony_node(node, [
      'repeat',
      node.cases.map(function (c, i) {
        return 'local _' + i + (c.test ? ' = ' + c.test : '') + ';'
      }).join(' '),
      'local _r = ' + node.discriminant + ';',
      node.cases.map(function (c, i) {
        if (!c.test) {
          return c.consequent.join(joiner)
        }
        return 'if _r == _' + i + ' then' + joiner + c.consequent.join(joiner) + joiner + (i < node.cases.length - 1 && (c.consequent.slice(-1)[0] || {}).type != 'BreakStatement' ? '_r = _' + (i + 1) + ';' + joiner : '') + 'end'
      }).join(joiner),
      'until true'
    ].join(joiner))
// ret = "repeat\n" +
//   (if cases.length then ("local _#{i}#{if v then ' = ' + colonize(v) else ''}; " for i, [v, _] of cases).join('') else '') +
//   "local _r = #{colonize(expr)};\n" +
//   (for i, [_, stats] of cases
//     if _?
//       "if _r == _#{i} then\n" + (colonize(x) for x in stats).concat(if cases[Number(i)+1] and (not stats.length or stats[-1..][0].type != "break-stat") then ["_r = _#{Number(i)+1};"] else []).join("\n") + "\nend"
//     else
//       (colonize(x) for x in stats).join("\n")
//   ).join("\n") + "\n" +
//   "until true"
// loops.pop()

  } else if (type == 'BlockStatement') {
    // TODO the block statement should be joined here,
    // but it seems to break code in acorn_mod
    return node;
    // return 'do\n' + node.body.join('\n') + 'end\n'

  } else if (type == 'EmptyStatement') {
    return colony_node(node, '');


  // Flow control

  } else if (type == 'WhileStatement') {
    // Done with while block.
    var flow = colony_flow.shift();

    // TODO we should only look up break flags up until
    // the next function scope, not the entire chain
    var ascend = colony_flow.filter(function (l) {
      return l.type != 'try' && l.label;
    }).map(function (l) {
      return l.label;
    }).reverse();

    return colony_node(node, [
      'while ' + ensureExpression(node.test) + ' do ',
      (flow.usesContinue ? 'local _c' + (flow.label||'') + ' = nil; repeat' : ''),
      !node.body.body ? node.body : node.body.body.join('\n'),
      (flow.usesContinue ? 'until true;\nif _c' + flow.label + ' == _break' + [''].concat(ascend).join(' or _c') + ' then break end;' : ''),
      'end;'
    ].join('\n'));

  } else if (type == 'DoWhileStatement') {
    // Done with while block.
    var flow = colony_flow.shift();

    // TODO we should only look up break flags up until
    // the next function scope, not the entire chain
    var ascend = colony_flow.filter(function (l) {
      return l.type != 'try' && l.label;
    }).map(function (l) {
      return l.label;
    }).reverse();

    return colony_node(node, [
      'repeat ',
      (flow.usesContinue ? 'local _c' + (flow.label||'') + ' = nil; repeat' : ''),
      !node.body.body ? node.body : node.body.body.join('\n'),
      (flow.usesContinue ? 'until true;\nif _c' + flow.label + ' == _break' + [''].concat(ascend).join(' or _c') + ' then break end;' : ''),
      'until not (' + ensureExpression(node.test) + '); ',
    ].join('\n'));

  } else if (type == 'ForStatement') {
    // Done with for block.
    var flow = colony_flow.shift();

    return colony_node(node, [
      // TODO need node.init.declarations?
      node.init ? (node.init.declarations ? node.init.declarations.join(' ') : node.init) : '',
      'while ' + (node.test ? ensureExpression(node.test) : 'true') + ' do ',
      (flow.usesContinue ? 'local _c = nil; repeat' : ''),
      !node.body.body ? node.body : node.body.body.join('\n'),
      (flow.usesContinue ? 'until true;\nif _c == _break then break end;' : ''),
      (node.update ? ensureStatement(node.update) : ''),
      'end;'
    ].join('\n'))

  } else if (type == 'TryStatement') {
    // Done with try block.
    var flow = colony_flow.shift();

    return colony_node(node, [
'local _e = nil',
'local _s, _r = _xpcall(function ()',
node.block.body ? node.block.body.join('\n') : '',
//    #{if tryStat.stats[-1..][0].type != 'ret-stat' then "return _cont" else ""}
'    end, function (err)',
'        _e = err',
'    end);'
].concat(node.handler ? [
// catch clause
'if _s == false then',
hygenifystr(node.handler.param) + ' = _e;',
node.handler.body ? node.handler.body.body.join('\n') : '',

// break clause.
'end;'
] : []).concat([
node.finalizer ? node.finalizer.body.join('\n') : '',
]).concat(node.handler ? [] : [
'if _s == false then',
'_error(_e)',
'end'
]).concat(
!colony_flow.length ? [] : [
//break
'if _r == _break then',
(colony_flow.length && colony_flow[0].type == 'try' ? 'return _break;' : 'break;'),
// continue clause.
'elseif _r == _cont then',
//'  return _r',
(colony_flow.length && colony_flow[0].type == 'try' ? 'return _cont;' : 'break;'),
'end;'
    ]).join('\n'));

  } else if (type == 'BreakStatement') {
    return colony_node(node, [
      (colony_flow[0].usesContinue ? "_c" + (node.label||colony_flow[0].label||'') + " = _break; " : ''),
      'if true then ' + ((colony_flow[0] || {}).type == 'try' ? 'return _break;' : 'break;') + ' end;'
    ].join(''));

  } else if (type == 'ContinueStatement') {
    colony_flow.some(function (flow) {
      flow.usesContinue = true;
      if (String(flow.label) == String(node.label) || !node.label) {
        return true;
      }
    });

    return colony_node(node, [
      '_c' + (node.label||'') + ' = _cont; ',
      'if true then ' + (colony_flow[0].type == 'try' ? 'return _cont;' : 'break;') + ' end;'
    ].join(''));

  } else if (type == 'ThrowStatement') {
    return colony_node(node, '_error(' + hygenify(node.argument) + ' or {})');

  } else if (type == 'CatchClause') {
    return node;

  } else if (type == 'LabeledStatement') {
    return colony_node(node.body, String(node.body));


  // Contexts

  } else if (type == 'FunctionExpression' || type == 'FunctionDeclaration') {
    var localstr = colony_locals[0].length ? 'local ' + colony_locals[0].join(', ') + ' = ' + colony_locals[0].join(', ') + ';\n' : '';
    var usesArguments = !!colony_locals[0].arguments;
    var hoistsr = colony_locals[0].hoist.join('\n');
    colony_locals.shift()
    if (type == 'FunctionDeclaration') {
      colony_locals[0].push(hygenifystr(node.id));
    }
    var fnnode = colony_node(node,
      (type == 'FunctionDeclaration' ? (node.id ? hygenifystr(node.id) + ' = ' : '') + '' : '(')
      + (node.id ? '(function () local ' + hygenifystr(node.id) + ' = ' : '')
      + 'function ('
      + (usesArguments
        ? 'this, ...)\n' + (node.params.length ? 'local ' + node.params.map(hygenifystr).join(', ') + ' = ...;\n' : '') + 'local arguments = _arguments(...);\n'
        : ['this'].concat(node.params.map(hygenifystr)).join(', ') + ')\n')
      + localstr
      + hoistsr
      + node.body.body.join('\n')
      + '\nend'
      + (node.id ? '; ' + hygenifystr(node.id) + '.name = ' + JSON.stringify(hygenifystr(node.id)) + '; return ' + hygenifystr(node.id) + '; end)()' : '')
      + (type == 'FunctionDeclaration' ? '\n' : ')'));

    if (type == 'FunctionDeclaration') {
      colony_locals[0].hoist.push(fnnode);
      return colony_node(node, '');
    } else {
      return fnnode;
    }

  } else if (type == 'Program') {
    var w = '';
    colony_with.forEach(function (b, i) {
      var joiner = '\n';
      w += 'function _with_fn' + (i + 1) + '(_with)' + joiner + b + joiner + 'return _with;' + joiner + 'end' + joiner;
    });

    var localstr = colony_locals[0].length ? 'local ' + colony_locals[0].join(', ') + ' = ' + colony_locals[0].join(', ') + ';\n' : '';
    var hoistsr = colony_locals[0].hoist.join('\n');
    colony_locals.shift()

    var laststr = '';
    if (repl && node.body.length && node.body[node.body.length - 1].expression) {
      laststr = '\nif true then return ' + node.body.pop().expression + '; end';
    }
    return colony_node(node, w + '\n--[[COLONY_MODULE]]\n' + localstr + hoistsr + node.body.join('\n') + laststr);

  }
  throw new Error('Colony cannot yet handle type ' + type);
}

module.exports = function (script, opts)
{
  var joiner = '\n';

  repl = (opts || {}).returnLastStatement;
  var wrap = (opts || {}).wrap !== false;

  resetState();
  var res = acorn.parse(script, {
    allowReturnOutsideFunction: true,
    behaviors: {
      openFor: colony_newFlow.bind(null, 'for'),
      openTry: colony_newFlow.bind(null, 'try'),
      openWhile: colony_newFlow.bind(null, 'with'),
      openLabel: colony_newFlowLabel,
      openFunction: colony_newScope,
      closeNode: finishNode
    }
  });

  var prelude = res.replace(/--\[\[COLONY_MODULE\]\][\s\S]*$/, '');
  var body = res.replace(/^[\s\S]*--\[\[COLONY_MODULE\]\]/, '');

  if (!wrap) {
    return prelude + '\n' + body;
  }

  return [
    prelude,
    'return function (_ENV, _module)',
    'local exports, module = _module.exports, _module;',
    '',
    body,
    '',
    'return _module.exports;',
    'end '
  ].join(joiner);
};