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

  env.bindings[stmt] = value;
};

const evalExpr = (expr, env) => {

  if (typeof expr === 'number' || typeof expr === 'string') {
    return expr;
  }

  switch(expr.tag) {
  case 'call':
    const func = lookup(env, expr.name);
    if (!func) {
      throw new Exception("No such function " + expr.name);
    }
    const args = expr.args.map(item => evalExpr(item, env));
    return func.apply(env, args);

  case 'ident':
    return lookup(env, expr.name);

  default:
    console.log("expr not found", expr);
    //const func = lookup(env, expr.name);

  }
};


const evalStatement = (stmt, env) => {
  var val;

  // Special forms
  switch(stmt.tag) {

  case 'ignore':
    return evalExpr(stmt.body, env);

  case 'repeat':
    const count = evalExpr(stmt.expr, env);
    var lastValue = 0;
    for (var i = 0; i < count; ++i) {
      lastValue = evalStatements(stmt.body, env);
    }
    return lastValue;

  case '=':
    // Create var if not exists yet.
    if (!exists(env, stmt.left)) {
      add_binding(env, stmt.left, 0);
    }
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

  case 'def':
    const func = function() {
      const bindings = stmt.args.reduce((b, arg, i) => {
        b[arg] = arguments[i];
        return b;
      }, {});
      const newEnv = { bindings, outer: env };
      return evalStatements(stmt.body, newEnv);
    };

    add_binding(env, stmt.name, func);
    return 0;

  default:
    console.log("syntax error? unknown statement:", stmt.tag);
  }
};

const evalStatements = (stmts, env) => {
  return stmts.reduce((val, s) => evalStatement(s, env), 0);
};

const evalProg = (lines, env) => {
  return lines.reduce((val, ss) => {
    return evalStatements(ss, env);
  }, 0);
};

module.exports = {
  evalExpr,
  evalProg,
  evalStatement,
  evalStatements,
  lookup
};
