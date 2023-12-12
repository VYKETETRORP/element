/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: ["./imports/client/**/*.{vue,js,ts,jsx,tsx}", "./client/*.html"],
  theme: {
    extend: {},
    screens: {
      sm: "768px",
      md: "992px",
      lg: "1200px",
      xl: "1920px",
    },
  },
  plugins: [],
};
