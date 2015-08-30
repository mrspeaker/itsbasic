// Env...
const w = 320;
const h = 200;

const env = {
  w,
  h,
  charW: w / 8,
  charH: h / 8,
  outer:{},
  program: [],
  ram: [],
  rom: {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
    colors: ['rgb(0,0,0)', 'rgb(255,255,255)', 'rgb(136,0,0)','rgb(1720,255,238)','rgb(204,68,204)', 'rgb(0,204,85)','rgb(0,0,170)'],
    vidMemLoc: 2042,
    vidColBackLoc: 3042,
    vidColForeLoc: 4042
  },
  cursorPos: 0,
  cur: 0,
  bindings: {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
    '/': (x, y) => x / y,
    'print': (msg, x, y) => {
      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        env.cursorPos = y * env.chW + x;
      }
      msg.split("").forEach(c => {
        env.ram[env.rom.vidMemLoc + (env.cursorPos++)] = c.charCodeAt(0) - 97;
        // Wrap curosr
        if (env.cursorPos >= env.chW * env.chH) {
          env.cursorPos -= env.chW * env.chH;
        }
        if (env.cursorPos < 0) {
          env.cursorPos += env.chW * env.chH;
        }
      });
    },
    'goto': lineNumber => {
      const line = env.program.find(l => l[0] === lineNumber);
      if (line) {
        env.cur = env.program.indexOf(line);
        env.cur--;
      } else {
        throw new Error('Undefined line number ' + lineNumber);
      }
    },
    'poke': (addr, val) => {
      env.ram[addr] = val;
    }
  }
};

module.exports = env;
