const ROM = Object.freeze({

  chars: "@ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".split(""),
  colors: ['HSL(0, 0%, 0%)', 'HSL(0, 0%, 100%)', 'HSL(8, 45%, 37%)','HSL(187, 42%, 63%)',
    'HSL(280, 46%, 47%)', 'HSL(96, 49%, 45%)','HSL(249, 59%, 41%)', 'HSL(67, 63%, 64%)',
    'HSL(34, 67%, 34%)', 'HSL(46, 100%, 18%)', 'HSL(9, 38%, 58%)', 'HSL(0, 0%, 33%)',
    'HSL(0, 0%, 50%)', 'HSL(98, 73%, 72%)', 'HSL(248, 62%, 65%)', 'HSL(0, 0%, 67%)'],
  vidMemLoc: 2042,
  vidColBackLoc: 3042,
  vidColForeLoc: 4042,
  spriteEnableLoc: 1000,
  spriteXYLoc: 1021,
  BACKCOL: 0,
  FORECOL: 1,
  dataReadLoc: 2,
  dataWriteLoc: 3,
  cursorPos: 4,
  pc: 5,
  dataBaseLoc: 5000

});

module.exports = ROM;
