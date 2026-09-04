/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yestalgia: {
          pink: '#F3AFCC',
          'pink-dark': '#E28EAF',
          lime: '#D7DD44',
          'lime-light': '#E8EF58',
          teal: '#00966E',
          'teal-light': '#6EB5A2',
          orange: '#F09341',
          'orange-bright': '#FF7A00',
          cyan: '#8ED1FC',
          purple: '#9B51E0',
          yellow: '#FCB900',
          bg: '#FAF8F3',
          'bg-muted': '#F2ECE1',
          dark: '#121212',
          card: '#FFFFFF',
        }
      },
      boxShadow: {
        'brutal-sm': '2px 2px 0px #121212',
        'brutal': '4px 4px 0px #121212',
        'brutal-md': '6px 6px 0px #121212',
        'brutal-lg': '8px 8px 0px #121212',
        'brutal-xl': '12px 12px 0px #121212',
        'brutal-pink': '5px 5px 0px #F3AFCC',
        'brutal-lime': '5px 5px 0px #D7DD44',
        'brutal-teal': '5px 5px 0px #00966E',
        'brutal-orange': '5px 5px 0px #F09341',
        'brutal-white': '4px 4px 0px #FFFFFF',
      },
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        heading: ['Space Grotesk', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['Rubik Mono One', 'monospace'],
        tape: ['Chakra Petch', 'monospace'],
      },
      borderWidth: {
        '3': '3px',
        '4': '4px',
        '5': '5px',
      },
      animation: {
        'marquee': 'marquee 25s linear infinite',
        'marquee-reverse': 'marquee-reverse 25s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 12s linear infinite',
        'bounce-subtle': 'bounce-subtle 2s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}
