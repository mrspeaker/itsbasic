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

    d.style.left = (Math.random() * 320 | 0) + 'px';
    d.style.top = (Math.random() * 200 | 0) + 'px';
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
