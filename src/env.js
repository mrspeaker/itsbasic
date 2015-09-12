const Interupt = require('./Interupt');
const rom = require('./ROM');
const utils = require('./utils');

const w = 320;
const h = 200;

// Too much info in env. Should be moved to "computer"
// env should just be outer/bindings for the evaluator.

const env = {
  w,
  h,
  charW: w / 8,
  charH: h / 8,

  reset: function () {
    const ram = this.ram = [];

    ram[rom.pc] = 0;
    ram[rom.cursorPos] = 0;
    ram[rom.cursorOn] = 0;
    ram[rom.BACKCOL] = 6;
    ram[rom.FORECOL] = 14;
    ram[rom.dataReadLoc] = rom.dataBaseLoc;
    ram[rom.dataWriteLoc] = rom.dataBaseLoc;

    // Reset memory
    [...new Array(env.charW * env.charH)].map((_, i) => {
      ram[rom.vidMemLoc + i] = '32';
      ram[rom.vidColBackLoc + i] = 6;
      ram[rom.vidColForeLoc + i] = 14;
    });

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
      const {ram, rom} = env;
      if (typeof x !== 'undefined' && typeof y !== 'undefined') {
        ram[rom.cursorPos] = y * env.charW + x;
      }

      const charToBasicChar = char => {
        const code = char.charCodeAt(0);
        return utils.keycode2Bascii({code, char});
        /*if (c == '@') return 0;
        if (['!"#$%&\'()*+,-./'].indexOf(c) > -1) {
          return ['!"#$%&\'()*+,-./'].indexOf(c) + 65;
        }
        if (code === 32) return 32; // woah!
        if (code >= 48 && code <= 57) return (code - 48) + 48;
        if (code >= 97 && code < 123) return code - 96;*/
      };

      msg.toString().split('').forEach(c => {
        env.bindings.poke(env.rom.vidMemLoc + (ram[rom.cursorPos]++), charToBasicChar(c));

        // Wrap curosr
        if (ram[rom.cursorPos] >= env.charW * env.charH) {
          ram[rom.cursorPos] -= env.charW * env.charH;
        }
        if (ram[rom.cursorPos] < 0) {
          ram[rom.cursorPos] += env.charW * env.charH;
        }
      });

      const ypos = ram[rom.cursorPos] / env.charW | 0;
      ram[rom.cursorPos] = (ypos + 1) * env.charW;
    },
    'cls': () => {
      [...new Array(env.charW * env.charH)].map((_, i) => {
        env.bindings.poke(env.rom.vidMemLoc + i, 32);
      });
      env.ram[env.rom.cursorPos] = 0;
    },
    'goto': lineNumber => {
      const line = env.program.find(l => l[0] === lineNumber);
      if (line) {
        env.ram[env.rom.pc] = env.program.indexOf(line);
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
    },
    'run': () => {
      console.log('I don\'t even know!');
      return 0;
    },
    'list': () => {
      console.log("list a progyy?");
      env.bindings.cls();
      env.program.map(line => {
        env.bindings.print(line[0] + ' ' + line[1]);
      });
    }
  }
};

env.reset();

module.exports = env;
