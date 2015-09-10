
const keys = {};
const buffer = [];

document.body.addEventListener('keydown', e => {
  const which = e.which;
  keys[which] = true;
  if (e.location === 0) {
    buffer.push({code: which, char: e.key});
  }
}, false);

document.body.addEventListener('keyup', ({which}) => {
  keys[which] = false;
}, false);

const read = () => buffer.pop();

module.exports = {
  read,
  keys
};
