const Interupt = require('./Interupt');
const rom = require('./ROM');

const w = 320;
const h = 200;


// Too much info in env. Should be moved to "computer"
// env should just be outer/bindings for the evaluator.

const env = {
  w,
  h,
  charW: w / 8,
  charH: h / 8,

  cursorPos: 0, // should be in RAM
  pc: 0,

  reset: function () {
    const ram = this.ram = [];
    this.cursorPos = 0;
    this.pc = 0;

    ram[rom.BACKCOL] = 6;
    ram[rom.FORECOL] = 14;
    ram[rom.dataReadLoc] = rom.dataBaseLoc;
    ram[rom.dataWriteLoc] = rom.dataBaseLoc;

    Interupt.trigger('sys_reset');

  },

  rom,
  ram: [],
  program: [],

  outer:{},
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
    'rnd': (num) => Math.random() * num | 0,
    'con': (...args) => console.log(...args),
    'print': (msg, x, y) => {
      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        env.cursorPos = y * env.charW + x;
      }

      const charToBasicChar = (c) => {
        const code = c.charCodeAt(0);
        if (code >= 48 && code <= 57) return (code - 48) + 26;
        if (code >= 97) return code - 97;
      };

      msg.toString().split('').forEach(c => {
        env.bindings.poke(env.rom.vidMemLoc + (env.cursorPos++), charToBasicChar(c));

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
        return { went: lineNumber };
      } else {
        throw new Error('Undefined line number ' + lineNumber);
      }
    },
    'peek': addr => env.ram[addr],
    'poke': (addr, val) => {
      env.ram[addr] = val;
      Interupt.trigger('poke', addr, val);
    },
    'data': (...data) => {
      const {ram, rom} = env;
      data.forEach(d => ram[ram[rom.dataWriteLoc]++] = d);
    },
    'read': () => {
      const {ram, rom} = env;
      return ram[ram[rom.dataReadLoc]++];
    }
  }
};

env.reset();

module.exports = env;
