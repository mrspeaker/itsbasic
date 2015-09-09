
const bascii2Char = bascii => {
  if (bascii === 0) return '@';
  if (bascii === 32) return ' ';
  if (bascii < 26) return String.fromCharCode(64 + bascii);
  if (bascii === 48) return '0';
  if (bascii > 48 && bascii < 57) return (bascii - 48) + '';
  console.log("Unknown bascii:", bascii);
  return '';
};

const keycode2Bascii = code => {
  const c = String.fromCharCode(code);
  if (c === '@') return 0;
  if (['!"#$%&\'()*+,-./'].indexOf(c) > -1) {
    return ['!"#$%&\'()*+,-./'].indexOf(c) + 65;
  }
  if (code === 32) return 32; // woah!
  if (code >= 48 && code <= 57) return (code - 48) + 48;
  if (code >= 65 && code < 90) return code - 64;
  if (code >= 97 && code < 123) return code - 96;
  return 0;
};

module.exports = {
  bascii2Char,
  keycode2Bascii
};
