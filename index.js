const parse = require('./parser');
const evals = require('./evals');

const screen = document.querySelector("#screen");
const w = 320;
const h = 200;
const chW = w / 8;
const chH = h / 8;
const scr = [...new Array(chW * chH)].map(() => {
  const d = document.createElement("div");
  screen.appendChild(d);
  return d;
});

const prog9 = `
10 print "earle rulez  "
20 goto 10
`;

const prog = `
10 x=0 : y=0:z=20: v=2042
20 poke v+y, x
21 poke v+y+1, x+1
22 poke v+y+2, x+2
25 print "hey"
35 x=x+1:y=y+41
30 if (x < z) then 20

`;

// Convert prog
const lines = prog.split("\n").map(l => {
  const lineNum = l.match(/[0-9]*[\s]+/);
  if (!lineNum) {
    return [-1];
  }
  return [parseInt(lineNum, 10), l.slice(lineNum.toString().length)];
}).filter(l => l[0] !== -1);


// Env...
const env = {
  bindings: {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    'print': (msg) => {
      msg.split("").forEach(c => {
        env.ram[env.rom.vidMemLoc + (env.cursorPos++)] = c.charCodeAt(0) - 97;
        // Wrap curosr
        if (env.cursorPos >= chW * chH) {
          env.cursorPos -= chW * chH;
        }
        if (env.cursorPos < 0) {
          env.cursorPos += chW * chH;
        }
      });
    },
    'goto': lineNumber => {
      const line = lines.find(l => l[0] === lineNumber);
      if (line) {
        env.cur = lines.indexOf(line);
        env.cur--;
      } else {
        throw new Error('Undefined line number ' + lineNumber);
      }
    }
  },
  outer:{},
  ram: [],
  rom: {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    vidMemLoc: 2042
  },
  cursorPos: 0,
  cur: 0
};

// Run the 'puter
var t = setInterval(() => {
  if (env.cur >= lines.length) return;
  var parsed, res;
  try {
    parsed = parse(lines[env.cur][1]);
    res = evals.evalStatements(parsed, env);
  } catch (e) {
    console.error(e.message, e);
    clearInterval(t);
    return;
  }
  if (res && res.go) {
    env.bindings.goto(res.go);
  }
  env.cur++;

  // Update screen
  scr.map((s, i) => {
    s.textContent = env.rom.chars[env.ram[env.rom.vidMemLoc + i]];
  });

}, 50);
