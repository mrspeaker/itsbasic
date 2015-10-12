"use strict";
const assert = require("assert");

function test (msg, val, expected, deep) {
  let passed = false;
  try {
    assert[deep ? "deepEqual" : "equal"](val, expected, msg);
    passed = true;
  } catch (e) {
    console.log("😡  FAIL");
    console.log(e);
    console.log(JSON.stringify(e.actual));
  }
  if (passed) {
    console.log("🌲  " + msg);
  }
  return passed;
}

function deep (msg, val, expected) {
  return test(msg, val, expected, true);
}

function equal (msg, val, expected) {
  return test(msg, val, expected, false);
}

module.exports = {
  deep,
  equal
};
