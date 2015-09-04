const computer = require('./computer');
const progs = require('../list/prg');

const $$ = (sel) => document.querySelector(sel);
const defaultProggy = 4;

$$('#load').addEventListener('click', () => computer.load($$('#prog').value), false);
$$('#run').addEventListener('click', computer.run, false);
$$('#stop').addEventListener('click', computer.runstop, false);

$$('#cli').addEventListener('keydown', ({which}) => {
  if (which === 13) {
    computer.eval($$('#cli').value);
  }
}, false);

const selectProgs = $$('#progs');
progs.forEach((p, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.selected = i === defaultProggy;
  opt.textContent = p[0];
  selectProgs.appendChild(opt);
});

selectProgs.addEventListener('change', e => {
  $$('#prog').value = progs[e.target.value][1];
  computer.load($$('#prog').value);
}, false);

$$('#prog').value = progs[defaultProggy][1];
