const parse = require('./parser');
const evals = require('./evals');
const ROM = require('./rom');
const screen = require('./screen');

/*
  Implemented:

  x = 1
  x = y + 1
  == <> < > >= <=
  print "msg"
  print "msg", x, y
  goto 10
  if x < 10 then 20
  poke addr, value
  poke 2042, 1 // first screen char is A
  poke 3042, 2 // first scrren char background col is red
  peek 2042 // read the address
  rnd 20 // random int between 0 and 19
  data 1,2,3,4 // puts data into memory (writeLoc)
  read() //  reads data from memory (readLoc ) read must happen after data.
  cos, sin, tan, atan2
  mod
  con // console.log variable


  ---

  probs:

  * return from rom binding only handles last statement.
  * line numbers ignored (in init prog... need to sort/filter etc.)

  ---

  notes:

  printing moves the cursor pos.
  have types? %, $?

  ---

  next todos:

  for loop
  cursor pos should be in RAM.
  set sprite data
  if x < 10 then EXPR
  input (keys)

  ---

  Mem locations

  0: background color
  1: foreground color
  2: data read location
  3: data write location
  1000: sprites on/off
  1021: sprite x, y
  2042: screen char memory
  3042: screen back color
  4042: screen forecolor
  5000: default data location

*/

const scr = screen("#screen", ROM);
ROM.screen = scr;

const progs = [['classic',`
10 print "mrspeaker rulez  "
20 goto 10
`],

['text cols', `
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
`],

['peek value', `
10 print "b"
15 x = "peeked val " + peek 2042
20 print x, 2, 2
`],

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
['read data', `
5 print "read data"
10 data 20, 30, 40
20 x = read()
30 print x, 10, 10
`],

['sprites',`
5 print "sprites", 20, 0
10 poke 1000, 1: poke 1001, 1
20 x = 0
30 poke 1021, cos(x / 60) * 60 + 100
35 poke 1022, sin(x / 100) * 60 + 130
40 x = x + 1
80 goto 30
`]
];

document.querySelector("#prog").value = progs[4][1];
document.querySelector("#run").addEventListener('click', () => runProgram(document.querySelector("#prog").value));
document.querySelector("#cli").addEventListener('keydown', ({which}) => {
  if (which === 13) {
    const val = document.querySelector("#cli").value;
    execLine(val, ROM);
    ROM.screen.update();
  }
});
const selectProgs = document.querySelector("#progs");
progs.forEach((p, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.selected = i === 4;
  opt.innerHTML = p[0];
  selectProgs.appendChild(opt);
});
selectProgs.onchange = (e) => {
  document.querySelector("#prog").value = progs[e.target.value][1];
  runProgram(document.querySelector("#prog").value);
};
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

  ROM.reset();
  ROM.screen.reset();

  // de-line number prog
  ROM.program = prog.split("\n").map(l => {
    const lineNum = parseInt(l.match(/[0-9]*[\s]+/), 10);
    if (!lineNum) {
      return [-1];
    }
    return [parseInt(lineNum, 10), l.slice(lineNum.toString().length)];
  })
    .filter(l => l[0] !== -1)
    .sort((a, b) => a[0] - b[0]);
    // TODO: remove if duplicates...

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

  // TODO: load DATA statments?

  if (err) {
    ROM.bindings.print(err[0]);
    ROM.screen.update();
    console.error("parse.", err[1].message, err[1]);
    return;
  }

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

};
