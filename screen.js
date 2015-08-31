function screen (dom, ROM) {
  const screen = document.querySelector(dom);
  const chars = [...new Array(ROM.charW * ROM.charH)].map(() => {
    const d = document.createElement("div");
    screen.appendChild(d);
    return d;
  });

  const sprites = [...new Array(20)].map(() => {
    const d = document.createElement("div");
    d.className = "sprite";
    screen.appendChild(d);

    d.style.display = 'none';
    d.style.left = 0;
    d.style.top = 0;
    d.style.backgroundColor = 'hsl(' + (Math.random() * 360 | 0) + ',50%, 50%)';
    return d;
  });

  const reset = () => {
    chars.map(c => {
      c.textContent = '!';
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
