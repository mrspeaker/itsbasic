const PEG = require("pegjs");
const parser = PEG.buildParser("start = ('a' / 'b')+");

module.exports = parser;
