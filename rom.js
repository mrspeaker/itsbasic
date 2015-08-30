// Env...
const w = 320;
const h = 200;

const env = {
  w,
  h,
  charW: w / 8,
  charH: h / 8,

  cursorPos: 0, // should be in RAM
  pc: 0,

  outer:{},
  program: [],
  ram: [],
  rom: {
    chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""),
    colors: ['rgb(0,0,0)', 'rgb(255,255,255)', 'rgb(136,0,0)','rgb(170,255,238)',
      'rgb(204,68,204)', 'rgb(0,204,85)','rgb(0,0,170)', 'rgb(238,238,119)',
      'rgb(221,136,85)', 'rgb(102,68,0)', 'rgb(255,119,119)', 'rgb(51,51,51)',
      'rgb(119,119,119)', 'rgb(170,255,102)', 'rgb(0,136,255)', 'rgb(187,187,187)'],
    vidMemLoc: 2042,
    vidColBackLoc: 3042,
    vidColForeLoc: 4042,
    BACKCOL: 0,
    FORECOL: 1
  },

  bindings: {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
    '/': (x, y) => x / y,
    'print': (msg, x, y) => {
      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        env.cursorPos = y * env.charW + x;
      }
      msg.split("").forEach(c => {
        env.screen.chars[env.cursorPos].style.backgroundColor = env.rom.colors[env.ram[env.rom.BACKCOL]];
        env.screen.chars[env.cursorPos].style.color = env.rom.colors[env.ram[env.rom.FORECOL]];

        env.ram[env.rom.vidMemLoc + (env.cursorPos++)] = charToBasicChar(c);
        // Wrap curosr
        if (env.cursorPos >= env.charW * env.charH) {
          env.cursorPos -= env.charW * env.charH;
        }
        if (env.cursorPos < 0) {
          env.cursorPos += env.charW * env.charH;
        }
      });
    },
    'goto': lineNumber => {
      const line = env.program.find(l => l[0] === lineNumber);
      if (line) {
        env.pc = env.program.indexOf(line);
        env.pc--;
      } else {
        throw new Error('Undefined line number ' + lineNumber);
      }
    },
    'poke': (addr, val) => {
      env.ram[addr] = val;

      if (addr >= env.rom.vidMemLoc &&
        addr < env.rom.vidMemLoc + 1000) {
        env.screen.chars[addr - env.rom.vidMemLoc].style.backgroundColor = env.rom.colors[env.ram[env.rom.BACKCOL]];
        env.screen.chars[addr - env.rom.vidMemLoc].style.color = env.rom.colors[env.ram[env.rom.FORECOL]];
      }

      // Update color
      if (addr >= env.rom.vidColBackLoc &&
        addr < env.rom.vidColBackLoc + 1000) {
        env.screen.chars[addr - env.rom.vidColBackLoc].style.backgroundColor = env.rom.colors[val];
      }
      if (addr >= env.rom.vidColForeLoc &&
        addr < env.rom.vidColForeLoc + 1000) {
        env.screen.chars[addr - env.rom.vidColForeLoc].style.color = env.rom.colors[val];
      }
    },
    'rnd': (num) => Math.random() * num | 0
  }
};

env.ram[env.rom.BACKCOL] = 0;
env.ram[env.rom.FORECOL] = 1;

const charToBasicChar = (c) => {
  const code = c.charCodeAt(0);
  if (code >= 48 && code <= 57) return (code - 48) + 26;
  if (code >= 97) return code - 97;
}

module.exports = env;
