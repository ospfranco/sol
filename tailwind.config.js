/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{tsx,ts}'],
  presets: [require("nativewind/preset")],
  theme: {
    minWidth: {
      10: '10px',
    },
    fontSize: {
      xxxs: '8px',
      xxs: '11px',
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '19px',
      '2xl': '20px',
      '3xl': '22px',
      '4xl': '26px',
      '5xl': '42px',
      '6xl': '52px',
      '7xl': '62px',
      '8xl': '128px',
    },
    extend: {
      borderRadius: {
        xs: '1px',
        corner: '7px',
      },
      spacing: {
        25: '108px',
        26: '112px',
      },
      colors: {
        lightHighlight:  'rgba(0, 0, 0, .1)',
        darkHighlight:  'rgba(255, 255, 255, .07)',
        darkBorder:  'rgba(255, 255, 255, .1)',
        lightBorder:  'rgba(0, 0, 0, .1)',
        subBgDark: '#00000020',
        subBgLight: '#FFFFFF77'
      },
    },
  },
}
