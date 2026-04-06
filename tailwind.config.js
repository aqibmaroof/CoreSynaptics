/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Gilroy", "sans-serif"], // This makes it default
        gilroy: ["Gilroy", "sans-serif"],
      },
      colors: {
        "brand-blue": "#4F8EF7",
        "brand-violet": "#7B5EF8",
        "brand-dark-deep": "#070D1A",
        "brand-panel-left": "#0D1B2E",
        "brand-panel-right": "#0B1525",
        "brand-light-blue": "#E8F0FF",
        "brand-light-text": "#C8D8F0",
        "brand-cyan": "#00D4FF",
        "brand-teal": "#00E5CC",
        "brand-navy": "#0A1628",
      },
    },
  },
  plugins: [],
};
