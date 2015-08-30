function screen (dom, ROM) {
  const screen = document.querySelector(dom);
  const chars = [...new Array(ROM.charW * ROM.charH)].map(() => {
    const d = document.createElement("div");
    screen.appendChild(d);
    return d;
  });

  const reset = () => {
    chars.map(c => {
      c.textContent = '!';
      c.style.backgroundColor = ROM.rom.colors[6];
      c.style.color = ROM.rom.colors[14];
    });
  };

  return {
    chars,
    reset
  };
}

module.exports = screen;
