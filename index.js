const parse = require('./parser');
const evals = require('./evals');
const ROM = require('./rom');

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

*/

const screen = document.querySelector("#screen");
const scr = [...new Array(ROM.charW * ROM.charH)].map(() => {
  const d = document.createElement("div");
  screen.appendChild(d);
  return d;
});

const prog9 = `
10 print "earle rulez  "
20 goto 10
`;

const prog = `
10 x=0 : y=0:z=20: w=0: v=2042:
20 poke v+y, x
21 poke v+y+1, x+1
22 poke v+y+2, x+2
23 poke v+1000+x, w
25 print "hey", 10, x
35 x=x+1:y=y+41:w=w+1:
30 if (x < z) then 20
`;

// de-line number prog
ROM.program = prog.split("\n").map(l => {
  const lineNum = l.match(/[0-9]*[\s]+/);
  if (!lineNum) {
    return [-1];
  }
  return [parseInt(lineNum, 10), l.slice(lineNum.toString().length)];
}).filter(l => l[0] !== -1);

// Run the 'puter
var t = setInterval(() => {
  if (ROM.cur >= ROM.program.length) {
    return;
  }
  var parsed, res;
  try {
    parsed = parse(ROM.program[ROM.cur][1]);
    res = evals.evalStatements(parsed, ROM);
  } catch (e) {
    console.error(e.message, e);
    clearInterval(t);
    return;
  }
  if (res) {
    if (res.go) {
      ROM.bindings.goto(res.go);
    }
    if (res.type === 'poke') {
      ROM.bindings.poke(res.addr, res.val);

      // Update color
      if (res.addr >= ROM.rom.vidColBackLoc &&
        res.addr < ROM.rom.vidColBackLoc + 1000) {
        scr[res.addr - ROM.rom.vidColBackLoc].style.backgroundColor = ROM.rom.colors[res.val];
      }
    }
  }
  ROM.cur++;

  // Update screen
  scr.map((s, i) => {
    s.textContent = ROM.rom.chars[ROM.ram[ROM.rom.vidMemLoc + i]];
  });

}, 50);
