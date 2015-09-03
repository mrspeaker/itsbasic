const computer = require('./computer');
const progs = require('../list/prg');

const $$ = (sel) => document.querySelector(sel);
const defaultProggy = 4;

$$('#prog').value = progs[defaultProggy][1];
$$('#run').addEventListener('click', () => computer.load($$('#prog').value));
$$('#cli').addEventListener('keydown', ({which}) => {
  if (which === 13) {
    computer.eval($$('#cli').value);
  }
});

const selectProgs = $$('#progs');
progs.forEach((p, i) => {
  const opt = document.createElement('option');
  opt.value = i;
  opt.selected = i === defaultProggy;
  opt.innerHTML = p[0];
  selectProgs.appendChild(opt);
});

selectProgs.addEventListener('change', e => {
  $$('#prog').value = progs[e.target.value][1];
  computer.load($$('#prog').value);
});
