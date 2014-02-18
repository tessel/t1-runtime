var acorn = require('./acorn_mod');

function _log () {
//  console.error.apply(console, arguments);
}

var keywords = ['and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true', 'until', 'while'];

var colony_locals, colony_flow, colony_with;

function resetState () {
  colony_locals = [[]];
  colony_flow = [];
  colony_with = [];
}

// Scopes contain ids, locals, etc: [ 0, 1, ..., id, usesId ]
function colony_newScope (id) {
  var scope = [];
  scope.id = id;
  scope.usesId = false;

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
  if (node.type == 'BinaryExpression' || node.type == 'AssignmentExpression' || node.type == 'LogicalExpression' || node.type == 'UpdateExpression' || node.type == 'Literal' || node.type == 'CallExpression' || node.type == 'ConditionalExpression') {
    return colony_node(node, node + ';');
  } else {
    return colony_node(node, 'if ' + node.replace(/;?$/, '') + ' then end;');
  }
}

var lasttype = null;

function finishNode(node, type) {
  _log('==>', type);
  if (type != 'Identifier') {
    lasttype = type;
  }

  // Basic nodes

  if (type == 'Identifier') {
    // console.error('--->', lasttype);
    if (node.name == 'arguments') {
      colony_locals[0].arguments = true;
    }
    if (node.name != 'arguments' && node.name == colony_locals[0].id) {
      // TODO We have to discover if a function above the current one is named
      // by this ID, which we might not know until the entire function is parsed
      // (local variables could be declared later). We should flag id's as
      // "potentially used" and then verify by checking variables used in scope,
      // then propagate to parent scopes.
      colony_locals[0].usesId = true;
    }
    return colony_node(node, node.name);

  } else if (type == 'Literal') {
    if (node.value instanceof RegExp) {
      return colony_node(node, '_regexp(' + JSON.stringify(node.value.source) + ', ' + JSON.stringify(String(node.value).replace(/^.*\//, '')) + ')');
    } else {
      return colony_node(node, '(' + node.raw + ')');
    }


  // Expressions

  } else if (type == 'MemberExpression') {
    if (node.computed) {
      return colony_node(node, hygenify(node.object) + '[' + hygenify(node.property) + ']');
    } else if (keywords.indexOf(String(node.property)) > -1) {
      return colony_node(node, hygenify(node.object) + '[' + JSON.stringify(String(node.property)) + ']');
    } else {
      return colony_node(node, hygenify(node.object) + '.' + node.property);
    }
    return str;

  } else if (type == 'AssignmentExpression') {
    if (node.operator != '=') {
      var operator = node.operator.slice(0, -1);
      var ops = { '|': 'bor', '&': 'band', '>>': 'rshift', '<<': 'lshift' }
      if (node.operator in ops) {
        node.right = '_bit.' + ops[operator] + '(' + ensureExpression(node.left) + ', ' + ensureExpression(node.right) + ')'
      } else {
        // TODO we run the risk of re-interpreting node.left here
        // need a function that encapsulates that behavior
        node.right = hygenify(node.left) + operator + hygenify(node.right);
      }
    }
    return colony_node(node, hygenify(node.left) + ' = ' + ensureExpression(hygenify(node.right)));

  } else if (type == 'CallExpression') {
    var ismethod = node.callee.type == 'MemberExpression'
    return colony_node(node,
      (ismethod ? hygenify(node.callee).replace(/^([\s\S]+)\./, '$1:') : hygenify(node.callee))
      + '(' + (ismethod ? [] : ['this']).concat(node.arguments.map(ensureExpression)).join(', ') + ')');

  } else if (type == 'NewExpression') {
    var ismethod = node.callee.type == 'MemberExpression'
    if (ismethod) {
      throw new Error('Dont support methods as new expressions yet');
    }
    return colony_node(node, '_new(' + [node.callee].concat(node.arguments).join(', ') + ')');

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
      return colony_node(node, '(function () local _r = ' + node.argument + '; ' + node.argument + ' = nil; return _r ~= nil; end)()');
    }

    var ops = { '|': '_bit.bor', '&': '_bit.band', '~': '_bit.bnot', '+': '0+', '!': 'not ', 'typeof': '_typeof', 'void': '_void' }
    return colony_node(node, '(' + (ops[node.operator] || node.operator) + '(' + ensureExpression(node.argument) + '))')

  } else if (type == 'LogicalExpression') {
    var ops = { '&&': 'and', '||': 'or' }
    return colony_node(node, '((' + ensureExpression(hygenify(node.left)) + ')' + ops[node.operator] + '(' + ensureExpression(hygenify(node.right)) + '))')

  } else if (type == 'BinaryExpression') {
    var ops = { '|': '_bit.bor', '&': '_bit.band', '>>': '_bit.rshift', '<<': '_bit.lshift', '>>>': '_bit.rrotate', 'instanceof': '_instanceof', 'in': '_in' }
    if (node.operator in ops) {
      return colony_node(node, ops[node.operator] + '(' + ensureExpression(hygenify(node.left)) + ',' + ensureExpression(hygenify(node.right)) + ')')
    } else {
      // infix
      var infixops = { '!==': '~=', '!=': '~=', '===': '==' };
      return colony_node(node, '((' + ensureExpression(hygenify(node.left)) + ')' + (infixops[node.operator] || node.operator) + '(' + ensureExpression(hygenify(node.right)) + '))')
    }

  } else if (type == 'ArrayExpression') {
    return colony_node(node, '_arr({' + [node.elements.length > 0 ? '[0]=' + hygenify(node.elements[0]) : ''].concat(node.elements.slice(1).map(hygenify)).join(', ') + '}, ' + node.elements.length + ')')

  } else if (type == 'ObjectExpression') {
    return colony_node(node, '_obj({\n  '
      + node.properties.map(function (prop) {
        return '[' + (prop.key.type == 'Literal' ? prop.key : JSON.stringify(prop.key.toString())) + ']=' + hygenify(prop.value)
      }).join(',\n  ')
      + '\n})');

  } else if (type == 'SequenceExpression') {
    return colony_node(node, '_seq({' + node.expressions.map(function (d) {
      return ensureExpression(hygenify(d));
    }).join(', ') + '})');


  // Statements

  } else if (type == 'IfStatement') {
    return colony_node(node, [
      "if " + node.test + ' then\n',
      // TODO node.consequent should be a string, here is body
      (node.consequent.body ? node.consequent.body.join('\n') : node.consequent) + '\n',
      (node.alternate ? 'else\n' + (node.alternate.body ? node.alternate.body.join('\n') : node.alternate) + '\n' : ""),
      'end;'
    ].join(''));

  } else if (type == 'ReturnStatement') {
    return colony_node(node, 'if true then return ' + hygenify(node.argument) + '; end');

  } else if (type == 'ForInStatement') {
    if (node.left.kind == 'var') {
      var name = hygenifystr(node.left.declarations[0].str.replace(/\s*=.*$/, ''));
    } else {
      var name = hygenifystr(node.left);
    }
    return colony_node(node, [
      'for ' + name + ' in _pairs(' + hygenify(node.right) + ') do',
      !node.body.body ? node.body : node.body.body.join('\n'),
      'end;'
    ].join('\n'))

  } else if (type == 'ExpressionStatement') {
    if (['BinaryExpression', 'UnaryExpression', 'LogicalExpression', 'Literal', 'CallExpression', 'ConditionalExpression', 'MemberExpression', 'ConditionalExpression'].indexOf(node.expression.type) > -1) {
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
node.finalizer ? node.finalizer : ''
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
    return colony_node(node, '_error(' + hygenify(node.argument) + ')');

  } else if (type == 'CatchClause') {
    return node;

  } else if (type == 'LabeledStatement') {
    return colony_node(node.body, String(node.body));


  // Contexts

  } else if (type == 'FunctionExpression' || type == 'FunctionDeclaration') {
    var localstr = colony_locals[0].length ? 'local ' + colony_locals[0].map(hygenifystr).join(', ') + ' = ' + colony_locals[0].map(hygenifystr).join(', ') + ';\n' : '';
    var usesArguments = !!colony_locals[0].arguments;
    var usesId = colony_locals[0].usesId;
    colony_locals.shift()
    if (type == 'FunctionDeclaration') {
      colony_locals[0].push(node.id);
    }
    return colony_node(node,
      (type == 'FunctionDeclaration' ? (node.id ? hygenifystr(node.id) + ' = ' : '') + 'function (' : '(function (')
      + (usesArguments
        ? 'this, ...)\n' + (node.params.length ? 'local ' + node.params.join(', ') + ' = ...;\n' : '') + 'local arguments = _arguments(...);\n'
        : ['this'].concat(node.params).join(', ') + ')\n')
      + (usesId ? 'local ' + node.id + ' = _debug.getinfo(1, \'f\').func;\n' : '')
      + localstr
      + node.body.body.join('\n')
      + (type == 'FunctionDeclaration' ? '\nend\n' : '\nend)'));

  } else if (type == 'Program') {
    var w = '';
    colony_with.forEach(function (b, i) {
      var joiner = '\n';
      w += 'function _with_fn' + (i + 1) + '(_with)' + joiner + b + joiner + 'return _with;' + joiner + 'end' + joiner;
    });

    var localstr = colony_locals[0].length ? 'local ' + colony_locals[0].join(', ') + ' = ' + colony_locals[0].join(', ') + ';\n' : '';
    colony_locals.shift()
    return colony_node(node, w + '\n--[[COLONY_MODULE]]\n' + localstr + node.body.join('\n'));

  }
  throw new Error('Colony cannot yet handle type ' + type);
}

module.exports = function (script)
{
  var joiner = '\n', wrapmodule = true;

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

  return [
    res.replace(/--\[\[COLONY_MODULE\]\][\s\S]*$/, ''),
    "return function (_ENV, _module)",
    // 'local ' + mask.join(', ') + ' = ' + mask.map(function () { return 'nil'; }).join(', ') + ';',
    "local exports, module = _module.exports, _module;",
    "",
    res.replace(/^[\s\S]*--\[\[COLONY_MODULE\]\]/, ''),
    "",
    "return _module.exports;",
    "end "
  ].join(joiner);
};