/** @type {import('tailwindcss').Config} */

module.exports = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      black: "#121212",
      gray: "#1f1f1f",
      lightgray: "#3c3c3c",
      darkblue: "#0f172a",
      white: "#ffffff",
    },
    extend: {
      spacing: {
        26: "6.5rem",
      },
    },
  },
  plugins: [],
};
