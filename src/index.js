const CRT = require('CRT');
const Computer = require('./Computer');
const progs = require('../list/prg');

const $$ = (sel) => document.querySelector(sel);
const defaultProggy = 4;

const computer = new Computer();
const crt1 = CRT(computer.env);
document.querySelector('#screen').appendChild(crt1);
const computer2 = new Computer();
CRT('#screen2', computer2.env);

var selected = computer;
//console.log(CRT);

$$('#screen').addEventListener('click', () => selected = computer, false);
$$('#screen2').addEventListener('click', () => selected = computer2, false);

$$('#load').addEventListener('click', () => selected.load($$('#prog').value), false);
$$('#run').addEventListener('click', () => selected.run(), false);
$$('#stop').addEventListener('click', () => selected.runstop(), false);

document.body.addEventListener('keydown', e => selected.keys.down(e), false);
document.body.addEventListener('keyup', e => selected.keys.up(e), false);

$$('#cli').addEventListener('keydown', ({which}) => {
  if (which === 13) {
    selected.eval($$('#cli').value);
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
  selected.load($$('#prog').value);
}, false);

$$('#prog').value = progs[defaultProggy][1];
