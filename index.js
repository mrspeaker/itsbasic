const parse = require('./parser');
const evals = require('./evals');
const ROM = require('./rom');
const screen = require('./screen');

/*
  Implemented:

  x = 1
  x = y + 1
  print "msg"
  print "msg", x, y
  goto 10
  if (x < 10) then 20
  poke addr, value
  poke 2042, 1 // first screen char is A
  poke 3042, 2 // first scrren char background col is red
  rnd 20 // random int between 0 and 19

  ---

  probs:

  if x < z then 10 // breaks on 'z'
  if x < 10 then 10 // works fine.
  if (x < 10 then 10 // inifintie loop
  .. problem when "()" removed from function calls
  same:
  print "hey", rnd 35, x //fail
  print "hey", rnd(35), x // fail
  print "hey", (rnd 35), x // works.

  ---

  Mem locations
  0: background color
  1: foreground color
  2042: screen char memory
  3042: screen back color
  4042: screen forecolor
*/

const scr = screen("#screen", ROM);
ROM.screen = scr;

const prog9 = `
10 print "earle rulez  "
20 goto 10
`;

const prog = `
10 x=0 : y=0:z=20: w=0: v=2042
20 poke v+y, x
21 poke v+y+1, x+1
22 poke v+y+2, x+2
23 poke v+1000+x, w
24 poke 0, w
25 poke 1, w + 1
30 print "hey", ((rnd 5) + 20), x
35 x=x+1:y=y+41:w=w+1:
40 if (x < z) then 20

`;

document.querySelector("#prog").value = prog;
document.querySelector("#run").addEventListener('click', () => runProgram(document.querySelector("#prog").value));

document.querySelector("#cli").addEventListener('keydown', ({which}) => {
  if (which === 13) {
    const val = document.querySelector("#cli").value;
    execLine(val, ROM);
    ROM.screen.update();
  }
});
var runTimer = null;

const execLine = (line, ROM, lineNumber = -1) => {
  var parsed, res;
  // Parse
  try {
    parsed = parse(line);
  } catch (e) {
    ROM.bindings.print("syntax error in " + lineNumber + " col " + e.offset);
    ROM.screen.update();
    console.error("parse.", e.message, e);
    clearInterval(runTimer);
    return;
  }

  // Execute
  try {
    res = evals.evalStatements(parsed, ROM);
  } catch (e) {
    ROM.bindings.print("exec error in " + lineNumber);
    ROM.screen.update();
    console.error("exec.", e.message, e);
    clearInterval(runTimer);
    return;
  }

  // Response to exec
  if (res) {
    try {
      if (res.go) {
        // eh, can't goto!
        //ROM.bindings.goto(res.go);
      }
      if (res.type === 'poke') {
        ROM.bindings.poke(res.addr, res.val);
      }
    } catch (e) {
      ROM.bindings.print(e.message.toLowerCase() + " in " + lineNumber);
      ROM.screen.update();
      console.error("res.", e.message, e);
      return;
    }
  }
};

const runProgram = (prog) => {

  clearInterval(runTimer);

  // TODO: real reset!
  ROM.cursorPos = 0;
  ROM.pc = 0;
  ROM.ram = [];
  ROM.screen.reset();

  // de-line number prog
  ROM.program = prog.split("\n").map(l => {
    const lineNum = l.match(/[0-9]*[\s]+/);
    if (!lineNum) {
      return [-1];
    }
    return [parseInt(lineNum, 10), l.slice(lineNum.toString().length)];
  }).filter(l => l[0] !== -1);

  // Run the 'puter
  runTimer = setInterval(() => {
    if (ROM.pc >= ROM.program.length) {
      return;
    }
    if (ROM.pc < 0) ROM.pc = 0;
    var parsed, res;
    
    // Parse
    try {
      parsed = parse(ROM.program[ROM.pc][1]);
    } catch (e) {
      ROM.bindings.print("syntax error in " + ROM.program[ROM.pc][0] + " col " + e.offset);
      ROM.screen.update();
      console.error("parse.", e.message, e);
      clearInterval(runTimer);
      return;
    }

    // Execute
    try {
      res = evals.evalStatements(parsed, ROM);
    } catch (e) {
      ROM.bindings.print("exec error in " + ROM.program[ROM.pc][0]);
      ROM.screen.update();
      console.error("exec.", e.message, e);
      clearInterval(runTimer);
      return;
    }

    // Response to exec
    if (res) {
      try {
        if (res.go) {
          ROM.bindings.goto(res.go);
          ROM.pc--;
        }
        if (res.type === 'poke') {
          ROM.bindings.poke(res.addr, res.val);
        }
      } catch (e) {
        ROM.bindings.print(e.message.toLowerCase() + " in " + ROM.program[ROM.pc][0]);
        ROM.screen.update();
        console.error("res.", e.message, e);
        return;
      }
    }
    ROM.pc++;

    ROM.screen.update();

  }, 1000/60);
};
