/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#f0f8f6',
          100: '#d9e8e5',
          200: '#b3d1cc',
          300: '#8dbab3',
          400: '#65b39b',
          500: '#65B39B',
          600: '#559982',
          700: '#45806a',
          800: '#356852',
          900: '#254039',
        },
        secondary: {
          50: '#faf4f1',
          100: '#f2e1db',
          200: '#e5c3b7',
          300: '#d8a593',
          400: '#c7654f',
          500: '#C7654F',
          600: '#b04d39',
          700: '#993823',
          800: '#7d2a19',
          900: '#611d0f',
        },
        accent: {
          yellow: '#ECB876',
          brown: '#D3C483',
          red: '#C7654F',
        },
      },
    },
  },
  plugins: [],
}
