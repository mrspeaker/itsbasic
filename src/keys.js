class Keys {
  constructor () {
    this.keys = {};
    this.buffer = [];
  }

  read () {
    return this.buffer.pop();
  }

  down (e) {
    const which = e.which;
    if (which === 8) {
      e.preventDefault();
    }
    this.keys[which] = true;
    if (e.location === 0) {
      // WARNING: e.key is IE9+, and different support across browser
      this.buffer.push({code: which, char: e.key});
    }
  }

  up ({which}) {
    this.keys[which] = false;
  }

}

module.exports = Keys;
