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
        // accent: '#007AFF',
        // accentBg: '#007AFF10',
        // light: {DEFAULT: 'rgba(255, 255, 255, .80)'},
        // lighter: {DEFAULT: 'rgba(255, 255, 255, .90)'},
        // dark: {DEFAULT: 'rgba(21, 21, 21, .65)'},
        // darker: {DEFAULT: 'rgba(21, 21, 21, .7)'},
        // highlight: {
          // light: 'blue',
          // DEFAULT: 'yellow',
          // dark: 'red'
        // },
        lightHighlight: {DEFAULT: 'rgba(0, 0, 0, .1)'},
        darkHighlight: {DEFAULT: 'rgba(255, 255, 255, .07)'},
        darkBorder: {DEFAULT: '#1B1B1B'},
        lightBorder: {DEFAULT: 'rgba(0, 0, 0, .1)'},
        // buttonBorder: {DEFAULT: 'rgba(0, 0, 0, .03)'},
        // keyBg: '#F4F5F8',
        // proGray: {
        //   900: 'rgba(21, 22, 25, 0.9)',
        // },
      },
    },
  },
}
