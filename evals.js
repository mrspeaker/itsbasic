const lookup = (env, v) => {
  if (!env || !env.bindings) {
    throw new Error('Undefined variable ' + v);
  }
  if (env.bindings.hasOwnProperty(v)) {
    return env.bindings[v];
  }
  return lookup(env.outer, v);
};

const exists = (env, v) => {
  if (!env || !env.bindings) {
    return false;
  }
  if (env.bindings.hasOwnProperty(v)) {
    return true;
  }
  return exists(env.outer, v);
};

const update = (env, v, val) => {
  if (!env || !env.bindings) {
    throw new Error('Undefined variable ' + v);
  }
  if (env.bindings.hasOwnProperty(v)) {
    env.bindings[v] = val;
    return 0;
  } else {
    return update(env.outer, v, val);
  }

};

const add_binding = (env, stmt, value) => {
  // redefine if already exists
  var e = env;
  while (e.hasOwnProperty('bindings')) {
    if (e.bindings.hasOwnProperty(stmt)) {
      e.bindings[stmt] = value;
      return 0;
    }
    e = e.outer;
  }

  if ('bindings' in env === false) {
    console.error("do i get here?");
    env.bindings = {};
    env.outer = {};
  }

  env.bindings[stmt] = value;
};

const evalExpr = (expr, env) => {

  if (typeof expr === 'number' || typeof expr === 'string') {
    return expr;
  }

  switch(expr.tag) {
  case '!=':
    return evalExpr(expr.left, env) != evalExpr(expr.right, env);
  case '>':
    return evalExpr(expr.left, env) > evalExpr(expr.right, env);
  case '<':
    return evalExpr(expr.left, env) < evalExpr(expr.right, env);
  case '>=':
    return evalExpr(expr.left, env) >= evalExpr(expr.right, env);
  case '<=':
    return evalExpr(expr.left, env) <= evalExpr(expr.right, env);
  case 'call':
    {
      const func = lookup(env, expr.name);
      if (!func) {
        throw new Exception("No such function " + expr.name);
      }
      const args = expr.args.map(item => evalExpr(item, env));
      return func.apply(null, args);
    }
  case 'ident':
    return lookup(env, expr.name);
  default:
    console.log("expr not found", expr);
    //const func = lookup(env, expr.name);
  }
};

const evalStatement = (stmt, env) => {
  var val = undefined;
  switch(stmt.tag) {

  // A single expression
  case 'ignore':
    // Just evaluate expression
    return evalExpr(stmt.body, env);

  // Repeat
  case 'repeat':
    const count = evalExpr(stmt.expr, env);
    var lastValue = 0;

    for (var i = 0; i < count; ++i) {
      lastValue = evalStatements(stmt.body, env);
    }
    return lastValue;

  case '=':
    if (!exists(env, stmt.left)) {
      add_binding(env, stmt.left, 0);
    }
    // Evaluate right hand side
    val = evalExpr(stmt.right, env);
    update(env, stmt.left, val);
    return val;

  case 'if':
    if (evalExpr(stmt.expr, env)) {
      val = evalStatements(stmt.body, env);
    }
    return val;

  case 'ifgoto':
    if (evalExpr(stmt.expr, env)) {
      val = {go:stmt.line};
    }
    return val;

  case 'poke':
    {
      const addr = evalExpr(stmt.address, env);
      const val_ = evalExpr(stmt.value, env); // grr, chrome no block scope.
      return {type: 'poke', addr, val: val_};
    }

  case 'define':
    // name args body
    const new_func = function() {
      // This function takes any number of arguments
      var i;
      const new_bindings = { };
      for (i = 0; i < stmt.args.length; i++) {
        new_bindings[stmt.args[i]] = arguments[i];
      }
      const new_env = { bindings: new_bindings, outer: env };
      return evalStatements(stmt.body, new_env);
    };

    add_binding(env, stmt.name, new_func);
    return 0;

  default:
    console.log("syntax error? unknown statement:", stmt.tag);
  }
};

const evalStatements = (stmts, env) => {
  var i;
  var val;
  for (i = 0; i < stmts.length; i++) {
    val = evalStatement(stmts[i], env);
  }
  return val;
};

const evalProg = (lines, env) => {
  var i;
  var val;
  for (i = 0; i < lines.length; i++) {
    for (var j = 0; j < lines[i].stmts.length; j++) {
      val = evalStatement(lines[i].stmts[j], env);
    }
  }
  return val;
};

module.exports = {
  evalExpr,
  evalProg,
  evalStatement,
  evalStatements,
  lookup
};
