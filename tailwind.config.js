/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
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
      backgroundImage: {
        "main-bg": "url('/images/mainBackground.png'), url('/images/bg.png') ",
      },
    },
  },
  plugins: [],
};
