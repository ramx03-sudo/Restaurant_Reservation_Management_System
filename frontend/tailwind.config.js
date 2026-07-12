/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fdf8f6',
          100: '#fbeee9',
          200: '#f7ddd3',
          300: '#f0c4b4',
          400: '#e5a18a',
          500: '#d97757', // Main warm peach
          600: '#c26143',
          700: '#a24e34',
          800: '#82402c',
          900: '#6b3627',
          950: '#3a1a12',
        },
      },
    },
  },
  plugins: [],
}
