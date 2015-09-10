const basciiSet = {
  0: '@',
  32: ' ',
  33: '!',
  34: '"',
  35: '#',
  36: '$',
  37: '%',
  38: '&',
  39: '\'',
  40: '(',
  41: ')',
  42: '*',
  43: '+',
  44: ',',
  45: '-',
  46: '.',
  47: '/',
  48: '0', 49: '1', 50: '2', 51: '3', 52: '4', 53: '5', 54: '6', 55: '7', 56: '8', 57: '9',
  61: '='
};
//[..new Array(26)].forEach((_, i) => keys[i + 1] =
const charSet = Object.keys(basciiSet).reduce((chs, el) => {
  chs[basciiSet[el]] = el;
  return chs;
}, {});

const bascii2Char = bascii => {
  if (bascii === undefined) return '';
  if (basciiSet[bascii]) {
    return basciiSet[bascii];
  } else {
    console.log(bascii, 'not in bascii set');
  }
  if (bascii < 26) return String.fromCharCode(64 + bascii);

  console.log("Unknown bascii:", bascii);
  return '';
};

const keycode2Bascii = ({code, char}) => {
  if (code === 8) return 8;
  if (code >= 65 && code < 90) return code - 64;
  if (code >= 97 && code < 123) return code - 96;
  if (charSet[char] !== undefined) {
    return charSet[char];
  } else {
    console.log(char, code, 'not in charset');
  }

  return 0;
};

module.exports = {
  bascii2Char,
  keycode2Bascii
};
