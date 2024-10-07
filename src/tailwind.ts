import {solNative} from 'lib/SolNative'

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

export const accentRgb = hexToRgb(solNative.accentColor)

// config.theme.extend.colors.accent = solNative.accentColor
// const accentRbg = hexToRgb(solNative.accentColor)
// const accentDim = `rgba(${accentRbg?.r},${accentRbg?.g},${accentRbg?.b}, 0.6)`
// const accentBg = `rgba(${accentRbg?.r},${accentRbg?.g},${accentRbg?.b}, 0.4)`

// config.theme.extend.colors.accentDim = accentDim
// config.theme.extend.colors.accentBg = accentBg
