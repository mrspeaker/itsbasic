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
  reset: function () {
    const ram = this.ram = [];
    const rom = this.rom;

    this.cursorPos = 0;
    this.pc = 0;

    ram[rom.BACKCOL] = 0;
    ram[rom.FORECOL] = 1;
    ram[rom.dataReadLoc] = rom.dataBaseLoc;
    ram[rom.dataWriteLoc] = rom.dataBaseLoc;

  },
  ram: [],
  program: [],
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
    FORECOL: 1,
    dataReadLoc: 2,
    dataWriteLoc: 3,
    dataBaseLoc: 5000
  },

  bindings: {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
    '/': (x, y) => x / y,
    '==': (x, y) => x === y,
    '<>': (x, y) => x !== y,
    '>': (x, y) => x > y,
    '<': (x, y) => x < y,
    '>=': (x, y) => x >= y,
    '<=': (x, y) => x <= y,
    'sin': a => Math.sin(a),
    'cos': a => Math.cos(a),
    'tan': a => Math.tan(a),
    'atan2': (y, x) => Math.atan2(y, x),
    'mod': (x, y) => x % y,
    'con': (...args) => console.log(...args),
    'print': (msg, x, y) => {
      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        env.cursorPos = y * env.charW + x;
      }
      msg.toString().split("").forEach(c => {
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
    'peek': addr => {
      // TODO: bounds?
      return env.ram[addr];
    },
    'poke': (addr, val) => {
      const {ram, rom, screen} = env;

      ram[addr] = val;

      if (addr >= rom.vidMemLoc && addr < rom.vidMemLoc + 1000) {
        screen.chars[addr - rom.vidMemLoc].style.backgroundColor = rom.colors[ram[rom.BACKCOL]];
        screen.chars[addr - rom.vidMemLoc].style.color = rom.colors[ram[rom.FORECOL]];
      }

      // Update color
      if (addr >= rom.vidColBackLoc && addr < rom.vidColBackLoc + 1000) {
        screen.chars[addr - rom.vidColBackLoc].style.backgroundColor = rom.colors[val];
      }
      if (addr >= rom.vidColForeLoc && addr < rom.vidColForeLoc + 1000) {
        screen.chars[addr - rom.vidColForeLoc].style.color = rom.colors[val];
      }

      // sprites
      if (addr >= rom.spriteEnableLoc && addr <= rom.spriteEnableLoc + 20) {
        const spriteNum = addr - rom.spriteEnableLoc;
        screen.setSprite(spriteNum, val);
      }
      if (addr >= rom.spriteXYLoc && addr <= rom.spriteXYLoc + (20 * 2)) {
        const offset = addr - rom.spriteXYLoc;
        const spriteNum = offset / 2 | 0;
        const xo = offset % 2 === 0;
        screen.moveSprite(spriteNum, xo, val);
      }
    },
    'rnd': (num) => Math.random() * num | 0,
    'data': (...data) => {
      const {ram, rom} = env;
      data.forEach(d => ram[ram[rom.dataWriteLoc]++] = d);
    },
    'read': () => {
      const {ram, rom} = env;
      const back =  ram[ram[rom.dataReadLoc]++];
      console.log(back);
      return back;
    }
  }
};

env.reset();

const charToBasicChar = (c) => {
  const code = c.charCodeAt(0);
  if (code >= 48 && code <= 57) return (code - 48) + 26;
  if (code >= 97) return code - 97;
};

module.exports = env;
