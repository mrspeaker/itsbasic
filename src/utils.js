const basciiSet = {
  0: '@',
  1: 'a', 2: 'b', 3: 'c', 4: 'd' ,5: 'e' ,6: 'f',7: 'g', 8: 'h',9: 'i',10: 'j',11: 'k',12: 'l',
  13: 'm',14: 'n',15: 'o',16: 'p',17: 'q',18: 'r',19: 's',20: 't',21: 'u',22: 'v',23: 'w', 24: 'x',25: 'y',26: 'z',
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
  58: ':',
  59: ';',
  60: '<',
  61: '=',
  62: '>',
  63: '?'
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

const char2Bascii = char => {
  if (charSet[char] !== undefined) {
    return charSet[char];
  } else {
    console.log(char, 'not in charset');
  }

  return 0;
};

const keycode2Bascii = ({code, char}) => {
  if (code === 8) return 8;
  if (code >= 65 && code < 90) return code - 64;
  if (code >= 97 && code < 123) return code - 96;

  return char2Bascii(char);
};

module.exports = {
  bascii2Char,
  char2Bascii,
  keycode2Bascii
};
