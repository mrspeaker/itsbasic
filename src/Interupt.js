const Interupt = new (require('events').EventEmitter)();

const trigger = (name, ...rest) => Interupt.emit(name, rest);
const latch = (name, func) => Interupt.on(name, func);

module.exports = {
  trigger,
  latch
};
