const {solNative} = require('./lib/SolNative')

console.warn(solNative.accentColor)

const colors = {
  accent: solNative.accentColor,
  accentBg: `${solNative.accentColor}10`,
}

module.exports = colors
