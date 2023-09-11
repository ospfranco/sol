const plugin = require('tailwindcss/plugin')

module.exports = {
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    minWidth: {
      10: '10px',
    },
    g: ({theme}) => theme('spacing'),
    fontSize: {
      xxs: '11px',
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '19px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '38px',
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
        accent: '#007AFF',
        accentBg: '#007AFF10',
        light: {DEFAULT: 'rgba(255, 255, 255, .80)'},
        lighter: {DEFAULT: 'rgba(255, 255, 255, .90)'},
        dark: {DEFAULT: 'rgba(21, 21, 21, .65)'},
        darker: {DEFAULT: 'rgba(21, 21, 21, .7)'},
        lightHighlight: {DEFAULT: 'rgba(0, 0, 0, .1)'},
        darkHighlight: {DEFAULT: 'rgba(255, 255, 255, .05)'},
        darkBorder: {DEFAULT: 'rgba(255, 255, 255, .1)'},
        lightBorder: {DEFAULT: 'rgba(0, 0, 0, .1)'},
        buttonBorder: {DEFAULT: 'rgba(0, 0, 0, .03)'},
        keyBg: '#F4F5F8',
        proGray: {
          900: 'rgba(21, 22, 25, 0.9)',
        },
      },
    },
  },
  plugins: [
    plugin(function ({matchUtilities, theme}) {
      matchUtilities(
        {
          g: value => ({
            gap: value,
          }),
        },
        {values: theme('g')},
      )
    }),
  ],
}
