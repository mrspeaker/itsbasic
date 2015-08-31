function screen (dom, ROM) {
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
      c.textContent = '*';
      c.style.backgroundColor = ROM.rom.colors[6];
      c.style.color = ROM.rom.colors[14];
    });
  };

  const update = () => {
    // Update screen
    chars.map((s, i) => {
      s.textContent = ROM.rom.chars[ROM.ram[ROM.rom.vidMemLoc + i]];
    });
  };

  return {
    chars,
    sprites,
    reset,
    update
  };
}

module.exports = screen;
