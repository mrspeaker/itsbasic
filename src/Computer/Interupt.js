function IRQ () {
  const Interupt = new (require('events').EventEmitter)();

  const trigger = (name, ...rest) => Interupt.emit(name, rest);
  const latch = (name, func) => Interupt.on(name, func);

  return {
    trigger,
    latch
  };
}

module.exports = IRQ;
