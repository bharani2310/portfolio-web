/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: 'rgb(var(--bg) / <alpha-value>)',
          surface: 'rgb(var(--surface) / <alpha-value>)',
        },
        ink: 'rgb(var(--ink) / <alpha-value>)',
        accent: { violet: '#7C5CFC', mint: 'rgb(var(--mint) / <alpha-value>)', amber: '#C97B12' },
        line: 'rgb(var(--line) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Sora"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'grid-faint': 'linear-gradient(rgba(124,92,252,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,252,0.06) 1px, transparent 1px)',
      },
      backgroundSize: {
        grid: '40px 40px',
      },
    },
  },
  plugins: [],
};
