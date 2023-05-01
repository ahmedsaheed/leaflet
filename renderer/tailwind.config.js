const colors = require('tailwindcss/colors')
const defaults = require('tailwindcss/defaultTheme')
module.exports = {
  important: true,
  content: [
    './renderer/pages/**/*.{js,ts,jsx,tsx}',
    './renderer/components/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'media',
  theme: {
    backgroundColor: {
      'white-10': 'hsl(223deg 5% 12% / 60%)',
      'code-light': 'hsla(223, 15%, 95%, 60%)',
      'code-dark': 'hsl(223deg 5% 12% / 60%)',
      ...colors
    },
    fontFamily: {
      mono: ['"Fira Code"', 'monospace'],
      sans: ['"iA Writer Quattro"', 'system-ui', 'sans-serif'],
      serif: ['"Inter"', 'system-ui', 'sans-serif']
    }
  }
}
