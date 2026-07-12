/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#FAF8F5',
          card: '#FFFFFF',
          border: '#E7DFD7',
          text: '#111827',
          muted: '#6B7280',
        },
        primary: {
          50: '#fefcfb',
          100: '#fdf6f2',
          200: '#fae6dc',
          300: '#f5ccbe',
          400: '#eeab97',
          500: '#D97757', // Brand Primary
          600: '#c56141',
          700: '#a34c2f',
          800: '#823c25',
          900: '#6c321e',
          950: '#3e1a0e',
        },
      },
    },
  },
  plugins: [],
}
