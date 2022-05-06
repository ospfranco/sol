import {solNative} from 'lib/SolNative'
import {create} from 'twrnc'
const config = require('../tailwind.config.js')

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

config.theme.extend.colors.accent = solNative.accentColor
const accentRbg = hexToRgb(solNative.accentColor)
const accentDim = `rgba(${accentRbg?.r},${accentRbg?.g},${accentRbg?.b}, 0.6)`

config.theme.extend.colors.accentDim = accentDim

const tw = create(config)

export default tw
