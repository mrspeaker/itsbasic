const parser = require('./parser');
const evalScheem = require('./interpreter');

const ast = parser.parse("abba");
//interpreter(ast);

const env = {
  bindings: {
    print:x => console.log(x),
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
    '/': (x, y) => x / y,
    '=': (x, y) => x === y ? '#t' : '#f',
    '<': (x, y) => x < y ? '#t' : '#f',
    '>': (x, y) => x > y ? '#t' : '#f'
  },
  outer: null
};

// Test...
evalScheem(['print', ['quote', 'hello from inside...']], env);
evalScheem(['define', 'x', 5], env);
console.assert('#t' === evalScheem(['=', 'x', 5], env), "assignemnt");
console.assert(6 === evalScheem(['set!', 'x', ['+', 'x', 1]], env), "variable addition");
console.assert(3 === evalScheem(['let-one', 'x', 2, ['+', 'x', 1]], env), "let-one bind");
console.assert(7 === evalScheem(['+', 'x', 1], env), "variable addition");
evalScheem(['define', 'y', 1], env);
evalScheem(['set!', 'x', 2], env);
evalScheem(['define', 'id', ['lambda', 'x', 'x']], env);
evalScheem(['define', 'sq', ['lambda', 'x', ['*', 'x', 'x']]], env);
evalScheem(['define', 'add', ['lambda', 'a', 'b', ['+', 'a', 'b']]], env);
evalScheem(['define', 'one', ['lambda', 1]], env);

console.log(evalScheem(['id', 'x'], env));
console.log(evalScheem(['one'], env));
console.log(evalScheem(['sq', 'x'], env));
console.log(evalScheem(['add', 'x', 'y'], env));

const expr = ['let-one', 'x', 2,
    ['+', ['let-one', 'x', 3, 'x'],
       ['let-one', 'y', 4, 'x']]];

console.assert(5 === evalScheem(expr, env), "nested lets");

var prg = ['begin',
  ['define', 'x', 4],
  ['=', 6, 'x'],
  ['if', ['<', 'x', 5], 0, 10]
];
console.assert(0 === evalScheem(prg, env), "Run program");

console.log("done.");
