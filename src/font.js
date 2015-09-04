
const img = new Image();
const letters = [];
img.src = '../res/font.png';
img.onload = () => {
  const can = document.createElement('canvas');
  const w = 256;
  const h = 32;
  can.width = w;
  can.height = h;
  const c = can.getContext('2d');
  c.fillStyle = "#fff";
  c.fillRect(0, 0, w, h);
  c.drawImage(img, 0, 0);

  for(var y = 0; y < h / 8; y++) {
    for (var x = 0; x < w / 8; x++) {
      const {data} = c.getImageData(x * 8, y * 8, 8, 8);
      const bits = data.reduce((ac, el, i) => {
        if (i % 4 === 0) {
          ac.push(el > 0 ? 0 : 1);
        }
        return ac;
      }, []);
      letters.push(bits);
    }
  }
  document.body.appendChild(can);
}

module.exports = letters;

[
  `
    ...XX...
    ..XXXX..
    .XX..XX.
    .XXXXXX.
    .XX..XX.
    .XX..XX.
    .XX..XX.
    ........
  `,
  `
    .XXXXX..
    .XX..XX.
    .XX..XX.
    .XXXXX..
    .XX..XX.
    .XX..XX.
    .XXXXX..
    ........
  `,
  `
    ..XXXX..
    .XX..XX.
    .XX.....
    .XX.....
    .XX.....
    .XX..XX.
    ..XXXX..
    ........
  `,
  `
    .XXXX...
    .XX.XX..
    .XX..XX.
    .XX..XX.
    .XX..XX.
    .XX..X..
    .XXXX...
    ........
  `,
  `
    .XXXXXX.
    .XX.....
    .XX.....
    .XXXX...
    .XX.....
    .XX,....
    .XXXXXX.
    ........
  `,
  `
    .XXXXXX.
    .XX.....
    .XX.....
    .XXXX...
    .XX.....
    .XX.....
    .XX.....
    ........
  `,
  `
    ..XXXX..
    .XX..XX.
    .XX.....
    .XX.XXX.
    .XX..XX.
    .XX..XX.
    ..XXXX..
    ........
  `,
  `
    .XX..XX.
    .XX..XX.
    .XX..XX.
    .XXXXXX.
    .XX..XX.
    .XX..XX.
    .XX..XX.
    ........
  `,
  `
    ..XXXX..
    ...XX...
    ...XX...
    ...XX...
    ...XX...
    ...XX...
    ..XXXX..
    ........
  `,
].map(ch => ch
    .split('\n')
    .map(l => l.replace(/\s/g, ''))
    .filter(l => l !== '')
    .map(l => l.split('').map(c => {
      return c === 'X' ? 1 : 0;
    })));
