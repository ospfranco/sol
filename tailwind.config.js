module.exports = {
  content: ['./src/**/*.{tsx,ts}'],
  theme: {
    fontSize: {
      xxs: '10px',
      xs: '12px',
      sm: '13px',
      base: '14px',
      lg: '18px',
      xl: '20px',
      '2xl': '22px',
      '3xl': '24px',
    },
    extend: {
      borderRadius: {
        xs: '1px',
        corner: '7px',
      },
      colors: {
        accent: {DEFAULT: '#007AFF'},
        light: {DEFAULT: 'rgba(251, 251, 251, .80)'},
        lighter: {DEFAULT: 'rgba(251, 251, 251, .90)'},
        dark: {DEFAULT: 'rgba(21, 21, 21, .65)'},
        darker: {DEFAULT: 'rgba(21, 21, 21, .7)'},
        lightHighlight: {DEFAULT: 'rgba(0, 0, 0, .1)'},
        darkHighlight: {DEFAULT: 'rgba(255, 255, 255, .05)'},
        darkBorder: {DEFAULT: 'rgba(255, 255, 255, .1)'},
        lightBorder: {DEFAULT: 'rgba(0, 0, 0, .1)'},
        buttonBorder: {DEFAULT: 'rgba(0, 0, 0, .03)'},
        proGray: {
          900: 'rgba(21, 22, 25, 0.9)',
        },
      },
    },
  },
}
