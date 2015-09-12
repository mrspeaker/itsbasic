const parse = require('./parser');
const evals = require('./evals');
const video = require('./video');
const env = require('./env');
const keys = require('./keys');
const utils = require('./utils');

// Init video
video('#screen', env);

var runTimer = null;
var running = false;

const exec = (line, lineNumber = -1, alreadyParsed = false) => {
  var parsed, res;

  if (alreadyParsed) {
    parsed = line;
  } else {
    try {
      parsed = parse(line);
    } catch (e) {
      const msg = lineNumber >= 0 ? '?syntax error in ' + lineNumber + ' col ' + e.offset : '?syntax error, col ' + e.offset;
      env.bindings.print(msg);
      console.error('parse.', e.message, e);
      runstop();
      return;
    }
  }

  // Execute
  try {
    res = evals.evalStatements(parsed, env);
  } catch (e) {
    const msg = lineNumber >= 0 ? '?exec error in ' + lineNumber : '?error';
    env.bindings.print(msg);
    console.error('exec.', e.message, e);
    runstop();
    return;
  }

  // Response to exec
  if (res) {
    const pc = env.rom.pc;
    const ram = env.ram;
    try {
      if (res.go) {
        env.bindings.goto(res.go);
        ram[pc]--;
      }
      if (res.went) {
        ram[pc]--;
      }
    } catch (e) {
      env.bindings.print(e.message.toLowerCase() + ' in ' + lineNumber);
      console.error('res.', e.message, e);
      return;
    }
  }
};

const sortProg = prog => prog.sort((a, b) => a[0] - b[0]);

const load = (prog) => {

  runstop();
  env.reset();

  // de-line number prog
  env.program = prog.split('\n').map(l => {
    const lineNum = parseInt(l.match(/[0-9]*[\s]+/), 10);
    if (!lineNum) {
      return [-1];
    }
    return [parseInt(lineNum, 10), l.slice(lineNum.toString().length).trim()];
  })
    .filter(l => l[0] !== -1)
    .sort((a, b) => a[0] - b[0]);
    // TODO: remove if duplicates...

};

const execTheLineYo = () => {

  const {ram, rom} = env;
  var ypos = ram[rom.cursorPos] / env.charW | 0;
  const line = [...new Array(env.charW)]
    .map((_, i) => ram[rom.vidMemLoc + (ypos * env.charW) + i])
    .map(utils.bascii2Char)
    .join('')
    .trim()
    .toLowerCase();
  ram[rom.cursorPos] = (ypos + 1) * env.charW;

  if (!line) {
    return;
  }

  // Delete, insert, or execute line.

  const deleteALine = line.match(/^[1-9][0-9]*$/);
  const isProgramLine = line.match(/^[1-9][0-9]*\s/);

  if (deleteALine) {
    const lineNum = parseInt(deleteALine, 10);
    env.program = env.program.filter(line => {
      return line[0] !== lineNum;
    });
  }

  else if (isProgramLine) {
    const lineNum = parseInt(isProgramLine[0], 10);
    const lineCode = line.slice((isProgramLine[0] + '').length).trim();
    const newInstruction = [lineNum, lineCode];
    // Add this line
    var replaced = false;
    env.program = env.program.map(line => {
      if (line[0] === lineNum) {
        line[1] = lineCode;
        replaced = true;
      }
      return line;
    });

    if (!replaced) {
      // NOTE: not in order (but is ordered on run.)
      env.program.push(newInstruction);
    }

    // TODO: dodgy order.
    env.program = sortProg(env.program);

  }

  else {
    // REgular old execute-a-line.
    // TODO: um, not nice.
    if (line === "run") {
      run();
    }
    else if (line === "list") {
      env.bindings.list();
    }
    else {
      exec(line);
    }
    ypos = ram[rom.cursorPos] / env.charW | 0;
    //ram[rom.cursorPos] = (ypos + 1) * env.charW;
  }
};

const run = () => {

  if (runTimer) {
    running = false;
    clearInterval(runTimer);
  }

  const rom = env.rom;
  const ram = env.ram;
  const pc = rom.pc;

  // Parse the entire prog
  var err = null;

  env.parsedCode = env.program.map(line => {
    if (err) return;
    try {
      const parsed = parse(line[1]);
      return parsed;
    } catch (e) {
      err = ['syntax error in ' + line[0] + ' col ' + e.offset, e];
      return null;
    }
  });

  // TODO: load DATA statments?

  if (err) {
    env.bindings.print(err[0]);
    console.error('parse.', err[1].message, err[1]);
    return;
  } else {
    env.bindings.print("ready ");
  }

  running = true;
  ram[pc] = 0;

  // Run the 'puter
  runTimer = setInterval(() => {
    if (running) {
      if (ram[pc] >= env.program.length) {
        running = false;
        return;
      }

      // x instructions per frame
      for (var i = 0; i < 10; i++) {
        exec(env.parsedCode[ram[pc]], env.program[ram[pc]][0], true);
        ram[pc]++;
        if (ram[pc] >= env.program.length) {
          break;
        }
      }
    } else {
      // Direct mode
      // blink
      ram[rom.cursorOn] = Date.now() / 500 % 2 | 0;

      const key = keys.read();
      if (key) {

        switch (key.code) {
        case 13:
          // return key: read the current line and exec it
          execTheLineYo();
          break;
        case 8:
          // Delete key
          env.bindings.poke(rom.vidMemLoc + ram[rom.cursorPos], 32);
          if (ram[rom.cursorPos] > 0) {
            ram[rom.cursorPos] -= 1;
          }
          break;
        case 38:
          ram[rom.cursorPos] -= env.charW;
          break;
        case 40:
          ram[rom.cursorPos] += env.charW;
          break;
        case 37:
          ram[rom.cursorPos] -= 1;
          break;
        case 39:
          ram[rom.cursorPos] += 1;
          break;
        default:
          const basic = utils.keycode2Bascii(key);
          env.bindings.poke(rom.vidMemLoc + ram[rom.cursorPos], basic);
          ram[rom.cursorPos]++;
        }
      }

    }

  }, 1000 / 60);

};

exec('cls()');
run();

const runstop = () => {
  running = false;
};

module.exports = {
  load,
  run,
  exec,
  runstop
};
