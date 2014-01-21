#!/usr/bin/env node

var fs = require('fs')
  , falafel = require('falafel')
  , colors = require('colors')
  , path = require('path');


/** 
 * Colonize
 */

var keywords = ['end', 'do', 'nil', 'error', 'until', 'repeat', 'local', 'in', 'not'];
var mask = ['string', 'math', 'print', 'type', 'pairs'];

var joiner = '\n', wrapmodule = true;

function fixIdentifiers (str) {
  if (keywords.indexOf(str) > -1) {
    return '_K_' + str;
  }
  return str.replace(/_/g, '__').replace(/\$/g, '_S');
}

function uniqueStrings (arr) {
  var o = {};
  arr.forEach(function (k) {
    o[k] = true;
  });
  return Object.keys(o);
}

function attachIdentifierToContext (id, node) {
  var name = fixIdentifiers(id.source());
  while (node = node.parent) {
    if (node.type == 'FunctionDeclaration' || node.type == 'Program' || node.type == 'FunctionExpression') {
      (node.identifiers || (node.identifiers = [])).push(name);
      node.identifiers = uniqueStrings(node.identifiers);
      return;
    }
  }
}

function declareWithBlock (block, node) {
  while (node = node.parent) {
    if (node.type == 'Program') {
      node.withBlocks || (node.withBlocks = []);
      return node.withBlocks.push(block.source());
    }
  }
}

function truthy (node) {
  if (['!', '<', '<=', '>', '>=', '===', '!=', '!==', 'instanceof', 'in'].indexOf(node.operator) == -1) {
    node.update("_truthy(" + node.source() + ")");
  }
  return node.source();
}

function colonizeContext (ids, node) {
  if (ids) {
    ids = ids.filter(function (id) {
      return id != 'arguments';
    });
  }
  node.update([
    // Variables
    ids && ids.length ? 'local ' + ids.join(', ') + ' = ' + ids.join(', ') + ';' : '',
    // Hoist Functions
    node.body.filter(function (stat) {
      return stat.type == 'FunctionDeclaration';
    }).map(function (stat) {
      return stat.source();
    }).join(joiner),
    // Statements
    node.body.filter(function (stat) {
      return stat.type != 'FunctionDeclaration';
    }).map(function (stat) {
      return stat.source();
    }).join(joiner)
  ].filter(function (n) {
    return n;
  }).join(joiner));
}

function getLoops (node) {
  var loops = [];
  var par = node;
  while (par = par.parent) {
    if (par.type == 'WhileStatement' || par.type == 'ForStatement' || par.type == 'TryStatement') {
      var parname = par.parent.type == 'LabeledStatement' ? par.parent.label.source() :'';
      loops.unshift([par.type, parname, node.usesContinue]);
    }
  }
  return loops;
}

var labels = [];
var loops = [];

function colonize (node) {
  // console.error(process.memoryUsage().heapUsed/1024);
  // console.error(node.type)

  switch (node.type) {
    case 'Identifier':
      if (node.source() == 'arguments' && node.parent.type != 'Property') {
        attachIdentifierToContext(node, node);
      }
      if (node.parent.type != 'MemberExpression' || node.parent.object == node) {
        node.update(fixIdentifiers(node.source()));
      }
      break;

    case 'AssignmentExpression':
      // +=, -=, etc.
      if (node.operator != '=') {
        if (node.operator == '|=') {
          node.right.update('_bit.bor(' + node.left.source() + ', ' + node.right.source() + ')');
        } else if (node.operator == '&=') {
          node.right.update('_bit.band(' + node.left.source() + ', ' + node.right.source() + ')');
        } else if (node.operator == '^=') {
          node.right.update('_bit.bxor(' + node.left.source() + ', ' + node.right.source() + ')');
        } else if (node.operator == '>>=') {
          node.right.update('_bit.rshift(' + node.left.source() + ', ' + node.right.source() + ')');
        } else if (node.operator == '<<=') {
          node.right.update('_bit.lshift(' + node.left.source() + ', ' + node.right.source() + ')');
        } else {
          node.right.update(node.left.source().replace(/^\s+/, '') + ' ' + node.operator.substr(0, 1) + ' ' + node.right.source());
        }
        node.operator = '=';
      }
      // Used in another expression, assignments must be wrapped by a closure.
      if (node.parent.type != 'ExpressionStatement') {
        // OPTIM
        node.update('(function () local _r = ' + node.right.source() + '; ' + node.left.source() + ' = _r; return _r; end)()');
        // node.update('local _r = ' + node.right.source() + '; ' + node.left.source() + ' = _r; ');
      } else {
        // Need to refresh thanks to += updating.
        node.update(node.left.source() + ' = ' + node.right.source());
      }
      break;

    case 'EmptyStatement':
      node.source('');
      break;

    case 'ThisExpression':
      break;  

    case 'UnaryExpression':
      if (node.operator == '~') {
        node.update('_bit.bnot(' + node.argument.source() + ')');
      } else if (node.operator == '+') {
        node.update('(0+' + node.argument.source() + ')');
      } else if (node.operator == '!') {
        node.update('(not _truthy(' + node.argument.source() + '))');
      } else if (node.operator == 'typeof') {
        node.update('_typeof(' + node.argument.source() + ')');
      } else if (node.operator == 'delete') {
        // TODO return true/false
        node.update(node.argument.source() + ' = nil');
      } else {
        node.update('(' + node.source() + ')');
      }
      break;

    case 'BinaryExpression':
      if (node.operator == '!==' || node.operator == '!=') {
        // TODO strict
        node.update('(' + node.left.source() + ' ~= ' + node.right.source() + ')');
      } else if (node.operator == '===') {
        // TODO strict
        node.update('(' + node.left.source() + ' == ' + node.right.source() + ')');
      } else if (node.operator == '<<') {
        node.update('_bit.lshift(' + node.left.source() + ' or 0, ' + node.right.source() + ' or 0)');
      } else if (node.operator == '>>') {
        node.update('_bit.rshift(' + node.left.source() + ' or 0, ' + node.right.source() + ' or 0)');
      } else if (node.operator == '>>>') {
        node.update('_bit.rrotate(' + node.left.source() + ' or 0, ' + node.right.source() + ' or 0)');
      } else if (node.operator == '&') {
        node.update('_bit.band(' + node.left.source() + ' or 0, ' + node.right.source() + ' or 0)');
      } else if (node.operator == '^') {
        node.update('_bit.bxor(' + node.left.source() + ' or 0, ' + node.right.source() + ' or 0)');
      } else if (node.operator == '|') {
        node.update('_bit.bor(' + node.left.source() + ' or 0, ' + node.right.source() + ' or 0)');
      } else if (node.operator == 'instanceof') {
        node.update('_instanceof(' + node.left.source() + ', ' + node.right.source() + ')');
      } else if (node.operator == 'in') {
        node.update('_in(' + node.left.source() + ', ' + node.right.source() + ')');
      } else {
        node.update('(' + node.source() + ')');
      }
      break;

    case 'LogicalExpression':
      if (node.operator == '&&') {
        node.update(node.left.source() + ' and ' + node.right.source());
      } else if (node.operator == '||') {
        node.update(node.left.source() + ' or ' + node.right.source());
      }
      break;

    case 'UpdateExpression':
      // ++ or --
      if (node.prefix) {
        node.update('(function () ' + node.argument.source() + ' = ' + node.argument.source() + ' ' + node.operator.substr(0, 1) + ' 1; return ' + node.argument.source() + '; end)()');
      } else {
        // OPTIM
        node.update('(function () local _r = ' + node.argument.source() + '; ' + node.argument.source() + ' = _r ' + node.operator.substr(0, 1) + ' 1; return _r end)()');
        // node.update('local _r = ' + node.argument.source() + '; ' + node.argument.source() + ' = _r ' + node.operator.substr(0, 1) + ' 1;');
      }
      break;

    case 'NewExpression':
      node.update("_new(" +
        [node.callee.source()].concat(node.arguments.map(function (arg) {
          return arg.source();
        })).join(', ') + ")");
      break;

    case 'VariableDeclarator':
      attachIdentifierToContext(node.id, node);
      break;

    case 'VariableDeclaration':
      node.update(node.declarations.map(function (d) {
        return d.id.source() + ' = ' + (d.init ? d.init.source() : 'nil') + ';';
      }).join(joiner));
      break;

    case 'BreakStatement':
      //TODO _c down the stack is false until the main one
      //label = label or (x for x in loops when loops[0] != 'try')[-1..][0]?[1] or ""

      var label = node.label ? node.label.source() : '';

      node.update("_c" + label + " = _break; " +
        ((getLoops(node).slice(-1)[0] || [])[0] == "TryStatement" ? "return _break;" : "break;"));
      break;

    case 'SequenceExpression':
      node.update('_seq({' + node.expressions.map(function (d) {
        return d.source();
      }).join(', ') + '})');
      break;

    case 'SwitchCase':
      break;
    case 'SwitchStatement':
      node.update([
        'repeat',
        node.cases.map(function (c, i) {
          return 'local _' + i + (c.test ? ' = ' + c.test.source() : '') + ';'
        }).join(' '),
        'local _r = ' + node.discriminant.source() + ';',
        node.cases.map(function (c, i) {
          if (!c.test) {
            return c.consequent.map(function (s) {
              return s.source();
            }).join(joiner)
          }
          return 'if _r == _' + i + ' then' + joiner + c.consequent.map(function (s) {
            return s.source();
          }).join(joiner) + joiner + (i < node.cases.length - 1 && (c.consequent.slice(-1)[0] || {}).type != 'BreakStatement' ? '_r = _' + (i + 1) + ';' + joiner : '') + 'end'
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
      break;


    case 'ContinueStatement':
      //TODO _c down the stack is false until the main one
      //label = label or (x for x in loops when loops[0] != 'try')[-1..][0]?[1] or ""

      var label = node.label ? node.label.source() : '';

      var par = node;
      while (par = par.parent) {
        if (par.type == 'WhileStatement' || par.type == 'ForStatement') {
          par.usesContinue = true;
        }
      }
      node.update("_c" + label + " = _cont; " +
        ((getLoops(node).slice(-1)[0] || [])[0] == "TryStatement" ? "return _cont;" : "break;"));
      break;

    case 'DoWhileStatement':
      var name = node.parent.type == 'LabeledStatement' ? node.parent.label.source() :'';

      var loops = getLoops(node);
      var ascend = loops.filter(function (l) {
        return l[0] != 'TryStatement' && l[1] != null;
      }).map(function (l) {
        return l[1];
      });

      node.update([
        'repeat',
        (node.usesContinue ? 'local _c' + name + ' = nil; repeat' : ''),
        node.body.source(),
        (node.usesContinue ? 'until true;' + joiner + 'if _c' + name + ' == _break' + [''].concat(ascend).join(' or _c') + ' then break end;' : ''),
        'until not ' + truthy(node.test) + ';'
      ].join(joiner))
      break;

    case 'WhileStatement':
      var name = node.parent.type == 'LabeledStatement' ? node.parent.label.source() :'';

      var loops = getLoops(node);
      var ascend = loops.filter(function (l) {
        return l[0] != 'TryStatement' && l[1] != null;
      }).map(function (l) {
        return l[1];
      });

      node.update([
        'while ' + truthy(node.test) + ' do ',
        (node.usesContinue ? 'local _c' + name + ' = nil; repeat' : ''),
        node.body.source(),
        (node.usesContinue ? 'until true;' + joiner + 'if _c' + name + ' == _break' + [''].concat(ascend).join(' or _c') + ' then break end;' : ''),
        'end;'
      ].join(joiner))
      break;

    case 'ForStatement':
      node.update([
        node.init ? node.init.source() : '',
        'while ' + (node.test ? truthy(node.test) : 'true') + ' do ',
        (node.usesContinue ? 'local _c = nil; repeat' : ''),
        node.body.source(),
        (node.usesContinue ? 'until true;' + joiner + 'if _c == _break then break end;' : ''),
        (node.update && node.update.source
          // TODO make this better
          ? (node.update.type == 'BinaryExpression' || node.update.type == 'LogicalExpression' || node.update.type == 'UpdateExpression' || node.update.type == 'Literal' || node.update.type == 'CallExpression' || node.update.type == 'ConditionalExpression'
            ? node.update.source()
            : 'if ' + node.update.source().replace(/;?$/, '') + ' then end;')
          : ''),
        'end;'
      ].join(joiner))
      break;

    case 'Literal':
      if (node.value instanceof RegExp) {
        node.update('_regexp(' + JSON.stringify(node.value.source) + ', ' + JSON.stringify(String(node.value).replace(/^.*\//, '')) + ')');
      } else if (typeof node.value == 'string') {
        // TODO update
        node.update('(' + JSON.stringify(node.value).replace(/\\u00/g, '\\x').replace(/\*/g, '\\*') + ')');
      } else if (node.parent.type != 'Property') {
        node.update('(' + JSON.stringify(node.value) + ')');
      }
      break;

    case 'CallExpression':
      if (node.callee.type == 'MemberExpression') {
        // Method call
        if (node.callee.property.type == 'Identifier' && fixIdentifiers(node.callee.property.name) != node.callee.property.name && !node.callee.computed) {
          // Escape keywords awkwardly.
          node.update("(function () local base, prop = " + node.callee.object.source() + ', '
            + (node.callee.property.type == 'Identifier' ? JSON.stringify(node.callee.property.source()) : node.callee.property.source())
            + '; return base[prop]('
            + ['base'].concat(node.arguments.map(function (arg) {
              return arg.source()
            })).join(', ') + '); end)()');
        } else if (node.callee.property.type != 'Identifier' || node.callee.computed) {
          // Dynamic properties can't be method calls
          node.update("(function () local _base, _prop = " + node.callee.object.source() + ', '
            + node.callee.property.source()
            + '; local _val = _base[_prop]; console:log(_base, _prop, _val); return _val('
            + ['_base'].concat(node.arguments.map(function (arg) {
              return arg.source()
            })).join(', ') + '); end)()');
        } else {
          node.update(node.callee.object.source() + ':'
            + node.callee.property.source()
            // + '[' + (node.callee.property.type == 'Identifier' ? JSON.stringify(node.callee.property.source()) : node.callee.property.source()) + ']'
            + '(' + node.arguments.map(function (arg) {
            return arg.source()
          }).join(', ') + ')')
        }
      } else {
        node.update(node.callee.source() + '(' + ['global'].concat(node.arguments.map(function (arg) {
          return arg.source()
        })).join(', ') + ')')
      }
      break;

    case 'ObjectExpression':
      node.update('_obj({' + joiner + '  ' +
        node.properties.map(function (prop) {
          return '[' + JSON.stringify(prop.key.type == 'Identifier' ? prop.key.name : prop.key.value) + ']=' + prop.value.source()
        }).join(',' + joiner + '  ') +
        '})');
      break;
    case 'Property':
      break;

    case 'ArrayExpression':
      if (!node.elements.length) {
        node.update("_arr({})");
      } else {
        node.update("_arr({[0]=" + [].concat(node.elements.map(function (el) {
          return el.source();
        })).join(', ') + "})");
      }
      break;

    case 'ConditionalExpression':
      node.update('(' + truthy(node.test) + ' and {' + node.consequent.source() + '} or {' + node.alternate.source() + '})[1]');
      break;

    case 'IfStatement':
      node.update([
        "if " + truthy(node.test) + " then" + joiner,
        node.consequent.source() + joiner,
        (node.alternate ? 'else ' + joiner + node.alternate.source() + joiner : ""),
        "end;"
      ].join(''));
      break;

    case 'ReturnStatement':
      // Wrap in conditional to allow returns to precede statements
      node.update("if true then return" + (node.argument ? ' ' + node.argument.source() : '') + "; end;");
      break;

    case 'BlockStatement':
      colonizeContext(node.parent.type == 'FunctionDeclaration' || node.parent.type == 'FunctionExpression' ? node.parent.identifiers : [], node);
      break;

    case 'WithStatement':
      declareWithBlock(node.body, node);
      node.update("local _ret = _with(obj, _G._with_fn1); if _ret ~= _with then return _ret end");
      break;

    case 'MemberExpression':
      if (node.parent.type != 'CallExpression' || node.parent.callee != node) {
        if (!node.computed && node.property.source().match(/^[\w_]+$/) && keywords.indexOf(node.property.source()) == -1) {
          node.update("(" + node.object.source() + ")." + node.property.source());
        } else {
          node.update("(" + node.object.source() + ")"
            + '[' + (!node.computed ? JSON.stringify(node.property.source()) : fixIdentifiers(node.property.source())) + ']');
        }
      }

      if (node.parent.type == 'ExpressionStatement') {
        node.update('if ' + node.source() + ' then end;');
      }
      break;

    case 'ExpressionStatement':
      node.update(node.source().replace(/;?$/, ';')); // Enforce trailing semicolons.

      // Can't have and/or be statements.
      if (node.expression.type == 'BinaryExpression' || node.expression.type == 'LogicalExpression' || node.expression.type == 'Literal' || node.expression.type == 'CallExpression' || node.expression.type == 'ConditionalExpression') {
        // console.log('>>>', JSON.stringify(node.source()))
        node.update('if ' + node.source().replace(/;?$/, '') + ' then end; ');
      }
      break;

    case 'LabeledStatement':
      // TODO change stat to do { } while(false) unless of certain type;
      // this makes this labels array work
      node.update(node.body.source());
      break;

    case 'ForInStatement':
      if (node.left.type == 'VariableDeclaration') {
        var name = fixIdentifiers(node.left.declarations[0].id.name);
      } else {
        var name = node.left.source();
      }
      node.update([
        'for ' + name + ' in _pairs(' + node.right.source() + ') do',
        node.body.source(),
        'end;'
      ].join(joiner))
      break;

    case 'ThrowStatement':
      node.update("_error(" + node.argument.source() + ")");
      break;

    case 'CatchClause':
      break;

    case 'TryStatement':
      node.update([
'local _e = nil',
'local _s, _r = _xpcall(function ()',
node.block.source(),
//    #{if tryStat.stats[-1..][0].type != 'ret-stat' then "return _cont" else ""}
'    end, function (err)',
'        _e = err',
'    end);'
].concat(node.handlers.length ? [
// catch clause
'if _s == false then',
node.handlers[0].param.source() + ' = _e;' + joiner + node.handlers[0].body.source(),

// break clause.
'end;'
] : []).concat([
node.finalizer ? node.finalizer.source() : ''
]).concat(
!getLoops(node).length ? [] : [
//break
'if _r == _break then',
(getLoops(node).length && getLoops(node).slice(-1)[0][0] == 'TryStatement' ? 'return _break;' : 'break;'),
// continue clause.
'elseif _r == _cont then',
//'  return _r',
(getLoops(node).length && getLoops(node).slice(-1)[0][0] == 'TryStatement' ? 'return _cont;' : 'break;'),
'end;'
      ]).join(joiner));
      break;

    case 'FunctionExpression':
    case 'FunctionDeclaration':
      if (node.id && !node.expression) {
        attachIdentifierToContext(node.id, node);
      }

      node.identifiers || (node.identifiers = []);

      // fix references
      var name = node.id && node.id.source();
      var args = node.params.map(function (arg) {
        return arg.source();
      });

      // expression prefix/suffix
      if (!node.expression && node.parent.type != 'CallExpression' && name) {
        // TODO among other types of expressions...
        var prefix = name + ' = ', suffix = ';';
      } else {
        var prefix = '', suffix = '';
      }

      // assign self-named function reference
      var namestr = "";
      if (name) {
        // OPTIM
        namestr = "local " + name + " = _debug.getinfo(1, 'f').func;\n";
      }

      var loopsbkp = loops;
      var loops = [];
      if (node.identifiers.indexOf('arguments') > -1) {
        node.update(prefix + "(function (this, ...) " + joiner + namestr +
          "local arguments = _arguments(...);" + joiner +
          (args.length ? "local " + args.join(', ') + " = ...;" + joiner : "") +
          node.body.source() + joiner +
          "end)" + suffix);
      } else {
        node.update(prefix + "(function (" + ['this'].concat(args).join(', ') + ") " + joiner + namestr +
          node.body.source() + joiner +
          "end)" + suffix);
      }

      // Wrap functions with names used in expressions to assign inside closure.
      if (name && prefix && node.parent.type.match(/Expression$|^VariableDeclarator$|^ReturnStatement$|^Property$/)) {
        node.update('(function () ' + node.source() + '; return ' + name + '; end)()');
      }

      loops = loopsbkp;
      break;

    case 'Program':
      colonizeContext(node.identifiers, node);
      if (wrapmodule) {
        if (node.withBlocks) {
          var w = '';
          node.withBlocks.forEach(function (b, i) {
            w += 'function _with_fn' + (i + 1) + '(_with)' + joiner + b + joiner + 'return _with;' + joiner + 'end' + joiner;
          })
          console.log(w)
        }

        node.update([
          joiner + "return function (_ENV, _module)",
          'local ' + mask.join(', ') + ' = ' + mask.map(function () { return 'nil'; }).join(', ') + ';',
          "local exports, module = _module.exports, _module;",
          "",
          node.source(),
          "",
          "return _module.exports;",
          "end "
        ].join(joiner));
      }
      break;

    default:
      console.log(node.type.red, node);
  }
}

module.exports = function (src, _wrapmodule) {
  wrapmodule = _wrapmodule == null || _wrapmodule ? true : false;
  src = src.replace(/^#.*\n/, '');
  return String(falafel(src, colonize))
    // inline lingering comments are converted to lua comments
    .replace(/^(([^"']|"[^"]*"|'[^']*')*?)\/\//gm, '$1--')
    // replace multiline comments
    .replace(/\/\*([\S\s\n]*?)\*\//g, function (str) {
      return str.replace(/[^\n]+/g, '');
    })
    // Replace trailing and beginning whitespace
    // .replace(/^\s+|\s+$/g, '')
    // Replace successive semicolons or trailing semicolons
    .replace(/;([\s\n]*;)+/g, ';')
    .replace(/do\s*;/g, 'do')
};