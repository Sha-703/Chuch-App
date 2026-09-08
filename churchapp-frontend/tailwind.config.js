/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Work Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      colors: {
        ink: {
          950: '#0F1B2E',
          900: '#152641',
          800: '#1D3155',
          700: '#284370',
          600: '#375A93',
        },
        parchment: {
          50: '#FBF9F3',
          100: '#F5F1E6',
          200: '#EDE6D3',
        },
        gold: {
          400: '#D9B24C',
          500: '#C9A227',
          600: '#A9821A',
          700: '#7A6414',
        },
        clay: {
          500: '#B5502F',
          600: '#96401F',
          700: '#7A3419',
        },
        leaf: {
          500: '#3F6B4F',
          600: '#2F5A3F',
          700: '#254A32',
        },
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,27,46,0.06), 0 8px 24px -8px rgba(15,27,46,0.12)',
      },
      backgroundImage: {
        'weave': "repeating-linear-gradient(135deg, rgba(201,162,39,0.10) 0px, rgba(201,162,39,0.10) 2px, transparent 2px, transparent 10px)",
      },
    },
  },
  plugins: [],
}
