const parse = require('./parser');
const evals = require('./evals');
const env = require('./env');
const video = require('./video');

// Init video
video('#screen', env);

var runTimer = null;

const exec = (line, env = env, lineNumber = -1, alreadyParsed = false) => {
  var parsed, res;
  // Parse
  if (alreadyParsed) {
    parsed = line;
  } else {
    try {
      parsed = parse(line);
    } catch (e) {
      env.bindings.print('syntax error in ' + lineNumber + ' col ' + e.offset);
      console.error('parse.', e.message, e);
      clearInterval(runTimer);
      return;
    }
  }

  // Execute
  try {
    res = evals.evalStatements(parsed, env);
  } catch (e) {
    env.bindings.print('exec error in ' + lineNumber);
    console.error('exec.', e.message, e);
    clearInterval(runTimer);
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

const load = (prog) => {
  clearInterval(runTimer);

  env.reset();

  // de-line number prog
  env.program = prog.split('\n').map(l => {
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
  const parsedCode = env.program.map(line => {
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
  }

  const pc = env.rom.pc;
  const ram = env.ram;

  // Run the 'puter
  runTimer = setInterval(() => {
    if (ram[pc] >= env.program.length) {
      return;
    }

    // x instructions per frame
    for (var i = 0; i < 10; i++) {
      exec(parsedCode[ram[pc]], env, env.program[ram[pc]][0], true);
      ram[pc]++;
      if (ram[pc] >= env.program.length) {
        break;
      }
    }

  }, 1000/60);

};

module.exports = {
  load,
  exec
};
