"use strict";
const parse = require("../src/Computer/parser");
const tester = require("./tester");
const deep = tester.deep;

console.log("🌴  🌴  🌴  Parser 🌴  🌴  🌴");
console.log("");

deep(
  "Comment. # Hello, World.",
  parse(`# Hello, World`),
  [{"tag":"comment","val":" Hello, World"}]
);

deep(
  "Simple value",
  parse(`"hi"`),
  [ { tag: 'ignore', body: "hi" } ]);

deep(
  "Compound expression. (2 + 2) * 2.",
  parse(`(2 + 2) * 2`),
  [{"tag":"ignore","body":{"tag":"call","name":"*","args":[{"tag":"call","name":"+","args":[2,2]},2]}}]);


deep(
  "Assignment to variable",
  parse(`a = 1`),
  [{"tag":"=","left":"a","right":1}]
);

console.log("");
