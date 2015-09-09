
const keys = {};
const buffer = [];

document.body.addEventListener('keydown', ({which}) => {
  keys[which] = true;
  buffer.push(which);
}, false);

document.body.addEventListener('keyup', ({which}) => {
  keys[which] = false;
}, false);

const read = () => {
  return buffer.pop();
};

const codeToBasic = (code) => {
  const c = String.fromCharCode(code);
  if (c == '@') return 0;
  if (['!"#$%&\'()*+,-./'].indexOf(c) > -1) {
    return ['!"#$%&\'()*+,-./'].indexOf(c) + 65;
  }
  if (code >= 48 && code <= 57) return (code - 48) + 48;
  if (code >= 65 && code < 90) return code - 64;
  if (code >= 97 && code < 123) return code - 96;
  return 0;
};

module.exports = {
  read,
  keys,
  codeToBasic
};
