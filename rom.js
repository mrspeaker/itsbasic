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
    colors: ['HSL(0, 0%, 0%)', 'HSL(0, 0%, 100%)', 'HSL(8, 45%, 37%)','HSL(187, 42%, 63%)',
      'HSL(280, 46%, 47%)', 'HSL(96, 49%, 45%)','HSL(249, 59%, 41%)', 'HSL(67, 63%, 64%)',
      'HSL(34, 67%, 34%)', 'HSL(46, 100%, 18%)', 'HSL(9, 38%, 58%)', 'HSL(0, 0%, 33%)',
      'HSL(0, 0%, 50%)', 'HSL(98, 73%, 72%)', 'HSL(248, 62%, 65%)', 'HSL(0, 0%, 67%)'],
    vidMemLoc: 2042,
    vidColBackLoc: 3042,
    vidColForeLoc: 4042,
    spriteEnableLoc: 1000,
    spriteXYLoc: 1021,
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
        // TODO: hmm... fix goto20 and if()then20
        return { went: line };
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

      // sprites
      if (addr >= env.rom.spriteEnableLoc && addr <= env.rom.spriteEnableLoc + 20) {
        const spriteNum = addr - env.rom.spriteEnableLoc;
        // todo... move to screen
        env.screen.sprites[spriteNum].style.display = val === 1 ? 'block' : 'none';
      }
      if (addr >= env.rom.spriteXYLoc && addr <= env.rom.spriteXYLoc + (20 * 2)) {
        const offset = addr - env.rom.spriteXYLoc;
        const spriteNum = offset / 2 | 0;
        const xo = offset % 2 === 0;
        env.screen.sprites[spriteNum].style[xo ? 'left' : 'top'] = val + 'px';
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
};

module.exports = env;
