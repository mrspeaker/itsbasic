const Interupt = require('./Interupt');

function video (dom, ROM) {

  // TODO: don't handle all pokes, just send vid instructions.
  Interupt.latch('poke', ([addr, val]) => {

    const {ram, rom} = ROM;

    if (addr >= rom.vidMemLoc && addr < rom.vidMemLoc + 1000) {
      const dom = chars[addr - rom.vidMemLoc];
      dom.style.backgroundColor = rom.colors[ram[rom.BACKCOL]];
      dom.style.color = rom.colors[ram[rom.FORECOL]];
      dom.textContent = rom.chars[val];
    }

    // Update color
    if (addr >= rom.vidColBackLoc && addr < rom.vidColBackLoc + 1000) {
      chars[addr - rom.vidColBackLoc].style.backgroundColor = rom.colors[val];
    }
    if (addr >= rom.vidColForeLoc && addr < rom.vidColForeLoc + 1000) {
      chars[addr - rom.vidColForeLoc].style.color = rom.colors[val];
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

  Interupt.latch('sys_reset', () => reset());

  const screen = document.querySelector(dom);
  const chars = [...new Array(ROM.charW * ROM.charH)].map(() => {
    const d = document.createElement("div");
    screen.appendChild(d);
    return d;
  });

  const sprites = [...new Array(20)].map(() => {
    var can = document.createElement('canvas');
    can.width = 24;
    can.height = 24;

    var ctx = can.getContext('2d');
    ctx.fillStyle = `hsl(${Math.random() * 360 | 0}, 50%, 50%)`;
    ctx.fillRect(0, 0, 24, 24);
    const img = new Image();
    img.src = can.toDataURL();
    img.className = "sprite";
    screen.appendChild(img);

    img.style.display = 'none';
    img.style.left = 0;
    img.style.top = 0;

    return img;
  });

  const reset = () => {
    chars.map(c => {
      c.textContent = ' ';
      c.style.backgroundColor = ROM.rom.colors[6];
      c.style.color = ROM.rom.colors[14];
    });

    sprites.map((s, i) => {
      setSprite(i, 0);
      moveSprite(i, true, 0);
      moveSprite(i, false, 0);
    });

  };

  const setSprite = (num, val) => {
    sprites[num].style.display = val === 1 ? 'block' : 'none';
  };

  const moveSprite = (num, isX, pos) => {
    sprites[num].style[isX ? 'left' : 'top'] = pos + 'px';
  };

}

module.exports = video;
