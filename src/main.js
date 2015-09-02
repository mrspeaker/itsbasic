const parse = require('./parser');
const evals = require('./evals');
const ROM = require('./rom');
const screen = require('./screen');

const progs = require('../list/prg');
/*
  Implemented:

  # TEXT // comment
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
