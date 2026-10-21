/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        nova: {
          bg: 'var(--bg-primary)',
          surface: 'var(--bg-surface)',
          text: 'var(--text-primary)',
          'text-secondary': 'var(--text-secondary)',
          border: 'var(--border-color)',
          accent: 'var(--accent-color)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
