const lookup = (env, v) => {
  if (!env) return null;
  if (env.bindings && env.bindings.hasOwnProperty(v)) {
    return env.bindings[v];
  }
  return lookup(env.outer, v);
};

const update = (env, v, val) => {
  if (!env) return null;
  if (env.bindings && env.bindings.hasOwnProperty(v)) {
    env.bindings[v] = val;
  } else {
    return update(env.outer, v, val);
  }
};

const evalScheem = (expr, env) => {
  if (typeof expr === 'undefined') return;
  if (typeof expr === 'number') {
    return expr;
  }
  if (typeof expr === 'string') {
    return lookup(env, expr);
  }
  const head = expr[0];
  const left = expr[1];
  const right = expr[2];

  switch (head) {
  case 'if':
    const res = evalScheem(left, env);
    return evalScheem(res === '#t' ? expr[2] : expr[3], env);

  case 'define':
    env.bindings[left] = evalScheem(right, env);
    return env.bindings[left];

  case 'set!':
    update(env, left, evalScheem(right, env));
    return env.bindings[left];

  case 'quote':
    return left;

  case 'begin':
    return expr.reduce((env, ex) => {
      env.res = evalScheem(ex, env.env);
      return env;
    }, {env:env, res:0}).res;

  case 'let-one':
    const bindings = {};
    bindings[expr[1]] = evalScheem(expr[2], env);
    return evalScheem(expr[3], {
      bindings: bindings,
      outer : env
    });

  case 'lambda':
    const argLen = expr.length - 2;
    const body = expr[expr.length - 1];
    return function () {
      // Create new env with mapped arguments
      const bindings = {};
      for (var i = 0; i < arguments.length; i++) {
        if (i > argLen) break;
        bindings[expr[i + 1]] = arguments[i];
      }
      const newenv = {outer: env, bindings: bindings};
      return evalScheem(body, newenv);
    };

  default:
    // Function execution
    const func = lookup(env, head);
    const args = expr.slice(1).map(e => evalScheem(e, env));
    return func.apply(this, args);
  }
};

module.exports = evalScheem;
