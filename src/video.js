const font = require('./font');

function video (dom, env) {

  // TODO: don't handle all pokes, just send vid instructions.
  env.interupt.latch('poke', ([addr, val]) => {
    const {ram, rom} = env;

    if (addr >= rom.vidMemLoc && addr < rom.vidMemLoc + 1000) {
      const charLoc = addr - rom.vidMemLoc;
      // TODO!!! this is sometimes > 15
      const backCol = palData[ram[rom.BACKCOL] % 16];
      drawGlyph(charLoc % env.charW * 8, (charLoc / env.charW | 0) * 8, backCol);
      const foreCol = palData[ram[rom.FORECOL] % 16];
      plot(charLoc % env.charW * 8, (charLoc / env.charW | 0) * 8, val, foreCol);
    }

    // Update color
    if (addr >= rom.vidColBackLoc && addr < rom.vidColBackLoc + 1000) {
      const charLoc = addr - rom.vidColBackLoc;
      const col = palData[ram[rom.BACKCOL] % 16];
      drawGlyph(charLoc % env.charW * 8, (charLoc / env.charW | 0) * 8, col);
    }
    if (addr >= rom.vidColForeLoc && addr < rom.vidColForeLoc + 1000) {
      //chars[addr - rom.vidColForeLoc].style.color = rom.colors[val];
    }

    // sprites
    if (addr >= rom.spriteEnableLoc && addr <= rom.spriteEnableLoc + 20) {
      const spriteNum = addr - rom.spriteEnableLoc;
      setSprite(spriteNum, val);
    }
    if (addr >= rom.spriteXYLoc && addr <= rom.spriteXYLoc + (20 * 2)) {
      const offset = addr - rom.spriteXYLoc;
      const spriteNum = offset / 2 | 0;
      const xo = offset % 2 === 0;
      moveSprite(spriteNum, xo, val);
    }
  });

  env.interupt.latch('sys_reset', () => reset());

  const palData = (() => {
    const palCan = document.createElement('canvas');
    const pal = palCan.getContext('2d');
    palCan.width = env.rom.colors.length * 8;
    palCan.height = 8;
    env.rom.colors.forEach((c, i) => {
      pal.fillStyle = c;
      pal.fillRect(i * 8, 0, 8, 8);
    });

    return env.rom.colors.map((c, i) => {
      const {data} = pal.getImageData(i * 8 + 4, 4, 1, 1);
      return {r:data[0], g:data[1], b:data[2]};
    });
  })();

  const screen = document.querySelector(dom);

  screen.style.position = 'relative';
  screen.style.overflow = 'hidden';

  const can = document.createElement('canvas');
  can.width = env.w;
  can.height = env.h;
  const c = can.getContext('2d');
  screen.appendChild(can);
  c.fillStyle = '#111';
  c.fillRect(0, 0, env.w, env.h);

  var data = c.getImageData(0, 0, env.w, env.h);
  const setPixel = (x, y, col) => {
    const offset = (y * env.w + x) * 4;
    data.data[offset] = col.r;
    data.data[offset + 1] = col.g;
    data.data[offset + 2] = col.b;
  };
  const drawGlyph = (x, y, col) => {
    for (var j = 0; j < 8; j++) {
      for (var i = 0; i < 8; i++) {
        setPixel(x + i, y + j, col);
      }
    }
  };

  const plot = (x, y, letter, col) => {
    const l = font[letter % font.length];
    if (!l) {
      // console.log(letter, font)
      return;
    }
    for (var j = 0; j < 8; j ++) {
      for (var i = 0; i < 8; i++) {
        if (l[j * 8 + i]) {
          setPixel(x + i, y + j, col);
        }
      }
    }
  };

  const linearToXY = (linear) => ({x: linear % env.charW * 8, y : (linear / env.charW | 0) * 8});
  const xyToLinear = (x, y) => ((y / 8 | 0) * env.charW) + (x / 8 | 0);
  const redrawChar = (x, y) => {
    const {ram, rom} = env;
    const loc = xyToLinear(x, y);

    const backCol = palData[ram[rom.vidColBackLoc + loc]]; // TODO: % 16?
    drawGlyph(x, y, backCol);

    const val = ram[rom.vidMemLoc + loc];
    if (val) {
      const foreCol = palData[ram[rom.vidColForeLoc + loc]];
      plot(x, y, val, foreCol);
    }
  };

  var lastCursorPos = env.ram[env.rom.cursorPos];

  const loop = () => {
    requestAnimationFrame(loop);
    const {ram, rom} = env;
    const blink = ram[rom.cursorOn];
    const cursorPos = ram[rom.cursorPos];
    const {x, y} = linearToXY(cursorPos);

    redrawChar(x, y);
    if (blink) {
      drawGlyph(x, y, palData[14]);
      const val = ram[rom.vidMemLoc + cursorPos];
      if (val) {
        const foreCol = palData[ram[rom.vidColBackLoc + cursorPos]];
        plot(x, y, val, foreCol);
      }
    }

    const moved = lastCursorPos !== cursorPos;
    if (moved) {
      const {x, y} = linearToXY(lastCursorPos);
      redrawChar(x, y);
    }

    lastCursorPos = cursorPos;

    c.putImageData(data, 0, 0);
  };
  loop();


  const sprites = [...new Array(20)].map(() => {
    const can = document.createElement('canvas');
    can.width = 24;
    can.height = 24;

    const ctx = can.getContext('2d');
    ctx.fillStyle = `hsl(${Math.random() * 360 | 0}, 50%, 50%)`;
    ctx.fillRect(0, 0, 24, 24);
    const img = new Image();
    img.src = can.toDataURL();
    img.className = 'sprite';
    screen.appendChild(img);

    img.style.display = 'none';
    img.style.left = 0;
    img.style.top = 0;

    return img;
  });

  const reset = () => {
    /*[...new Array(env.charW * env.charH)].map((_, i) => {
      ram[rom.vidMemLoc + i] = '32';
      ram[rom.vidColBackLoc + i] = 6;
      ram[rom.vidColForeLoc + i] = 14;
    });*/

    sprites.map((s, i) => {
      setSprite(i, 0);
      moveSprite(i, true, 0);
      moveSprite(i, false, 0);
    });

    c.fillStyle = env.rom.colors[6];
    c.fillRect(0, 0, env.w, env.h);
    data = c.getImageData(0, 0, env.w, env.h);
  };

  const setSprite = (num, val) => {
    sprites[num].style.display = val === 1 ? 'block' : 'none';
  };

  const moveSprite = (num, isX, pos) => {
    sprites[num].style[isX ? 'left' : 'top'] = pos + 'px';
  };


  reset();
}

module.exports = video;
