const {solNative} = require('./lib/SolNative')

const colors = {
  accent: solNative.accentColor,
  accentBg: `${solNative.accentColor}88`,
  accentBg2: `${solNative.accentColor}10`,
}

module.exports = colors
