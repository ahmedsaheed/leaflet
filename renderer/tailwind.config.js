const colors = require("tailwindcss/colors");
const defaults = require("tailwindcss/defaultTheme");
module.exports = {
  content: [
    "./renderer/pages/**/*.{js,ts,jsx,tsx}",
    "./renderer/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "media",
  theme: {
    fontFamily: {
      mono: ['"iA Writer Quattro"', "system-ui", "sans-serif"],
      sans: ['"iA Writer Quattro"', "system-ui", "sans-serif"],
    },
  },
};
