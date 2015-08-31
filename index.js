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
  if x < 10 then 20
  poke addr, value
  poke 2042, 1 // first screen char is A
  poke 3042, 2 // first scrren char background col is red
  peek 2042 // read the address
  rnd 20 // random int between 0 and 19

  ---

  probs:

  ---

  notes:

  printing moves the cursor pos.

  ---

  todo:

  cursor pos should be in RAM.
  data/reads
  set sprite data
  if x < 10 then EXPR

  ---

  Mem locations
  0: background color
  1: foreground color
  2042: screen char memory
  3042: screen back color
  4042: screen forecolor
  1000: sprites on/off
  1021: sprite x, y

*/

const scr = screen("#screen", ROM);
ROM.screen = scr;

const prog0 = `
10 print "mrspeaker rulez  "
20 goto 10
`;

const prog1 = `
10 x=0 : y=0:z=20: w=0: v=2042:
15 poke 1000, 1
16 poke 1021, 50: poke 1022, 50
20 poke v+y, x
21 poke v+y+1, x+1
22 poke v+y+2, x+2
23 poke v+1000+x, w
24 poke 0, w
25 poke 1, w + 1
28 poke 1021,w * 3
29 poke 1022,w
30 print "hey", rnd(25) + 10, x
35 x=x+1:y=y+41:w=w+1:
40 if x < z then 20
50 goto 10
`;

const prog2 = `
10 print "a"
20 print "hey", 0, peek 2042
`;

/*
Examples

10 DATA 1,2,3,Apple,"Commodore 64"
20 READ A
30 READ B%, C, D$
40 READ E$
50 PRINT A, B%, C, D$, E$

10 FOR X=0 TO 10: READ A(X): PRINT A(X),;:NEXT
20 DATA 10,20,30,40,50,60,70,80,90,100,110

*/
const prog = `
10 read x
20 data 1, 2, 3
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

const execLine = (line, ROM, lineNumber = -1, alreadyParsed = false) => {
  var parsed, res;
  // Parse
  if (alreadyParsed) {
    parsed = line;
  } else {
    try {
      parsed = parse(line);
    } catch (e) {
      ROM.bindings.print("syntax error in " + lineNumber + " col " + e.offset);
      ROM.screen.update();
      console.error("parse.", e.message, e);
      clearInterval(runTimer);
      return;
    }
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
        ROM.bindings.goto(res.go);
        ROM.pc--;
      }
      if (res.went) {
        ROM.pc--;
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
  // Parse the entire prog
  var err = null;
  const parsedCode = ROM.program.map(line => {
    if (err) return;
    try {
      const parsed = parse(line[1]);
      return parsed;
    } catch (e) {
      err = ["syntax error in " + line[0] + " col " + e.offset, e];
      return null;
    }
  });

  console.log(JSON.stringify(parsedCode, null, 2));

  if (err) {
    ROM.bindings.print(err[0]);
    ROM.screen.update();
    console.error("parse.", err[1].message, err[1]);
  } else {
    // Run the 'puter
    runTimer = setInterval(() => {
      if (ROM.pc >= ROM.program.length) {
        return;
      }

      // x instructions per frame
      for (var i = 0; i < 10; i++) {
        execLine(parsedCode[ROM.pc], ROM, ROM.program[ROM.pc][0], true);
        ROM.pc++;
        if (ROM.pc >= ROM.program.length) {
          break;
        }
      }

      ROM.screen.update();

    }, 1000/60);
  }
};
