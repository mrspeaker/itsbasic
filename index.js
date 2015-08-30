const parse = require('./parser');
const evals = require('./evals');
const ROM = require('./rom');
const screen = require('./screen');

/*
  Implemented:

  print "msg"
  print "msg", x, y
  goto 10
  poke addr, value
  poke 2042, 1 // first screen char is A
  poke 3042, 2 // first scrren char background col is red

  ---

  probs:

  if x < z then 10 // breaks on 'z'
  if x < 10 then 10 // works fine.
  .. problem when "()" removed from function calls

  ---

  Mem locations
  0: background color
  1: foreground color (not impl!)
  2042: screen char memory
  3042: screen back color
  4042: screen forecolor (not impls)
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
30 print "hey", 10, x
35 x=x+1:y=y+41:w=w+1:
40 if (x < z) then 20
`;

document.querySelector("#prog").value = prog;
document.querySelector("#run").addEventListener('click', () => runProgram(document.querySelector("#prog").value));

var runTimer = null;
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
    var parsed, res;

    // Parse
    try {
      parsed = parse(ROM.program[ROM.pc][1]);
    } catch (e) {
      ROM.bindings.print("syntax error line " + ROM.program[ROM.pc][0]);
      ROM.screen.update();
      console.error("parse.", e.message, e);
      clearInterval(runTimer);
      return;
    }

    // Execute
    try {
      res = evals.evalStatements(parsed, ROM);
    } catch (e) {
      ROM.bindings.print("exec error line " + ROM.program[ROM.pc][0]);
      ROM.screen.update();
      clearInterval(runTimer);
      return;
    }

    if (res) {
      if (res.go) {
        ROM.bindings.goto(res.go);
      }
      if (res.type === 'poke') {
        ROM.bindings.poke(res.addr, res.val);
      }
    }
    ROM.pc++;

    ROM.screen.update();

  }, 1000/60);
};
